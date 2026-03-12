import express from "express";
import {
  getUsers,
  registerUser,
  loginUser,
  getUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.route("/").get(getUsers);

router.post("/register", registerUser);
router.post("/login", loginUser);

router.route("/:id").get(getUserProfile);

export default router;
