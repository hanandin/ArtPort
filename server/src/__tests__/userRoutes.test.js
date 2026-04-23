import express from "express";
import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { MongoMemoryServer } from "mongodb-memory-server";

import userRoutes from "../routes/userRoutes.js";

import User from "../models/User.js";

const JWT_SECRET = "test-jwt-secret";

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/users", userRoutes);
  return app;
};

const makeAuthHeader = (token) => ({ Authorization: `Bearer ${token}` });

const createUserWithToken = async ({ username, email }) => {
  const user = await User.create({
    username,
    email,
    passwordHash: "hashed-password",
  });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
  return { user, token };
};

describe("User API routes", () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    process.env.JWT_SECRET = JWT_SECRET;

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    app = buildApp();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    await Promise.all(
      Object.values(collections).map((collection) => collection.deleteMany({})),
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  test("PATCH /api/users/:id rejects unauthenticated requests", async () => {
    const { user } = await createUserWithToken({
      username: "profileOwner",
      email: "profileOwner@example.com",
    });

    const res = await request(app)
      .patch(`/api/users/${user._id}`)
      .send({ bio: "Updated bio" });

    expect(res.status).toBe(401);
  });

  test("PATCH /api/users/:id rejects updates from other users", async () => {
    const { user: owner } = await createUserWithToken({
      username: "ownerUser",
      email: "ownerUser@example.com",
    });
    const { token: otherToken } = await createUserWithToken({
      username: "otherUser",
      email: "otherUser@example.com",
    });

    const res = await request(app)
      .patch(`/api/users/${owner._id}`)
      .set(makeAuthHeader(otherToken))
      .send({ bio: "Should not apply" });

    expect(res.status).toBe(403);
  });

  test("PATCH /api/users/:id allows the owner to update their profile", async () => {
    const { user, token } = await createUserWithToken({
      username: "editableUser",
      email: "editableUser@example.com",
    });

    const res = await request(app)
      .patch(`/api/users/${user._id}`)
      .set(makeAuthHeader(token))
      .send({ bio: "New bio text" });

    expect(res.status).toBe(200);
    expect(res.body.bio).toBe("New bio text");
    expect(res.body._id).toBe(String(user._id));
  });

  test("PATCH /api/users/:id can update privacy and profile email visibility", async () => {
    const { user, token } = await createUserWithToken({
      username: "privacyUser",
      email: "privacyUser@example.com",
    });

    const res = await request(app)
      .patch(`/api/users/${user._id}`)
      .set(makeAuthHeader(token))
      .send({ isPrivate: true, showEmailOnProfile: true });

    expect(res.status).toBe(200);
    expect(res.body.isPrivate).toBe(true);
    expect(res.body.showEmailOnProfile).toBe(true);
  });

  test("PATCH /api/users/:id can change password with the current password", async () => {
    const passwordHash = await bcrypt.hash("OldPass123!", 10);
    const user = await User.create({
      username: "passwordUser",
      email: "passwordUser@example.com",
      passwordHash,
    });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    const res = await request(app)
      .patch(`/api/users/${user._id}`)
      .set(makeAuthHeader(token))
      .send({
        currentPassword: "OldPass123!",
        newPassword: "NewPass123!",
        confirmNewPassword: "NewPass123!",
      });

    expect(res.status).toBe(200);

    const updatedUser = await User.findById(user._id);
    expect(updatedUser).not.toBeNull();
    expect(await bcrypt.compare("NewPass123!", updatedUser.passwordHash)).toBe(
      true,
    );
  });

  test("GET /api/users/by-username/:username only exposes a private notice for private accounts", async () => {
    const user = await User.create({
      username: "hiddenArtist",
      email: "hiddenArtist@example.com",
      passwordHash: "hashed-password",
      bio: "Secret bio",
      isPrivate: true,
      showEmailOnProfile: true,
    });

    const res = await request(app).get(
      `/api/users/by-username/${encodeURIComponent(user.username)}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.username).toBe("hiddenArtist");
    expect(res.body.isPrivate).toBe(true);
    expect(res.body.bio).toBeUndefined();
    expect(res.body.email).toBeUndefined();
  });
});
