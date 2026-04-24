import Artwork from "../models/Artwork.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { uploadImageToS3 } from "./imageUploadController.js";
import { withMediaDeliveryUrls } from "../utils/mediaDelivery.js";
import { validationError } from "../utils/apiErrors.js";
import { profanity } from "../utils/profanity.js";

const getOptionalCurrentUser = async (req) => {
  if (req.user?._id) {
    return req.user;
  }

  const authHeader = req.headers?.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token && req.headers?.cookie) {
    const cookieName = process.env.AUTHCOOKIE_NAME || "artport_token";
    const parts = req.headers.cookie.split(";").map((part) => part.trim());

    for (const part of parts) {
      if (!part.startsWith(`${cookieName}=`)) continue;
      const rawValue = part.slice(`${cookieName}=`.length);
      try {
        token = decodeURIComponent(rawValue);
      } catch {
        token = rawValue;
      }
      break;
    }
  }

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id).select("_id username");
  } catch {
    return null;
  }
};

// @desc    Get all artworks
// @route   GET /api/artworks
// @access  Public
export const getArtworks = async (req, res) => {
  try {
    const currentUser = await getOptionalCurrentUser(req);
    const requestedUserId =
      typeof req.query.userId === "string" ? req.query.userId.trim() : "";

    const publicUsers = await User.find({ isPrivate: { $ne: true } })
      .select("_id")
      .lean();

    const allowedUserIds = new Set(publicUsers.map((user) => String(user._id)));
    if (currentUser?._id) {
      allowedUserIds.add(String(currentUser._id));
    }

    if (requestedUserId && !allowedUserIds.has(requestedUserId)) {
      return res.json([]);
    }

    const artworkQuery = requestedUserId
      ? { userId: requestedUserId }
      : { userId: { $in: Array.from(allowedUserIds) } };

    const artworks = await Artwork.find(artworkQuery).populate(
      "userId",
      "_id username profilePictureUrl isPrivate",
    );

    res.json(artworks.map((artwork) => withMediaDeliveryUrls(artwork)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new artwork
// @route   POST /api/artworks
// @access  Private (Mocked for now)
export const createArtwork = async (req, res) => {
  try {
    const { title, description, userId } = req.body;

    const truncatedTitle = title.trim();
    // For description, we can allow empty but still check for profanity if provided
    const truncatedDescription = description ? description.trim() : "";

    if (!truncatedTitle) {
      return validationError(
        res,
        "ARTWORK_TITLE_REQUIRED",
        "Title is required",
      );
    }
    if (profanity.exists(truncatedTitle)) {
      return validationError(
        res,
        "ARTWORK_TITLE_PROFANITY",
        "Title contains inappropriate content",
      );
    }
    if (profanity.exists(truncatedDescription)) {
      return validationError(
        res,
        "ARTWORK_DESCRIPTION_PROFANITY",
        "Description contains inappropriate content",
      );
    }

    // Handle image uploads through imageUploadController
    let filePath = req.body.filePath;
    let thumbnailPath = req.body.thumbnailPath || "";

    if (req.files?.image?.[0]) {
      filePath = await uploadImageToS3(req.files.image[0], "artworks");
    }

    if (req.files?.thumbnailImage?.[0]) {
      thumbnailPath = await uploadImageToS3(
        req.files.thumbnailImage[0],
        "artworks/thumbnails",
      );
    }

    if (!filePath) {
      return res.status(400).json({ message: "Image is required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const artwork = new Artwork({
      userId,
      title: truncatedTitle,
      description: truncatedDescription,
      filePath,
      thumbnailPath,
    });

    const createdArtwork = await artwork.save();
    const populatedArtwork =
      typeof createdArtwork.populate === "function"
        ? await createdArtwork.populate(
            "userId",
            "_id username profilePictureUrl",
          )
        : createdArtwork;
    res.status(201).json(withMediaDeliveryUrls(populatedArtwork));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get artwork by ID
// @route   GET /api/artworks/:id
// @access  Public
export const getArtworkById = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id).populate(
      "userId",
      "_id username profilePictureUrl",
    );

    if (artwork) {
      res.json(withMediaDeliveryUrls(artwork));
    } else {
      res.status(404).json({ message: "Artwork not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
