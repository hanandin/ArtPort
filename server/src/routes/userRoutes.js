import express from "express";
import { upload } from "../middleware/upload.js";
import {
  getUsers,
  registerUser,
  loginUser,
  getUserProfile,
  updateUser,
} from "../controllers/userController.js";

const router = express.Router();

router.route("/").get(getUsers);

router.post("/register", upload.single('profilePicture'), registerUser);
router.patch("/:id", upload.single('profilePicture'), updateUser);
router.post("/login", loginUser);

router.route("/:id").get(getUserProfile);

export default router;
