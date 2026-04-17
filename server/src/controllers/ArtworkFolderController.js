import Artwork from "../models/Artwork.js";
import Folder from "../models/Folder.js";

// @desc    Move artwork to a different folder
// @route   POST /api/artworks/:id/move
// @access  Private
export const moveArtworkToFolder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { targetFolderId } = req.body;

    if (!targetFolderId) {
      return res.status(400).json({ message: "Target folder ID is required" });
    }

    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    // Check if user owns the artwork
    if (String(artwork.userId) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You do not have permission to move this artwork",
      });
    }

    // Verify target folder exists and belongs to user
    const targetFolder = await Folder.findById(targetFolderId);

    if (!targetFolder) {
      return res.status(404).json({ message: "Target folder not found" });
    }

    if (String(targetFolder.userId) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You do not have permission to move artwork to this folder",
      });
    }

    // Remove artwork from current folder if it exists
    const currentFolderId = artwork.folderId;
    if (currentFolderId) {
      const currentFolder = await Folder.findById(currentFolderId);
      if (currentFolder) {
        currentFolder.artworkIds = currentFolder.artworkIds.filter(
          (id) => String(id) !== String(artwork._id),
        );
        await currentFolder.save();
      }
    }

    // Add artwork to target folder
    if (!targetFolder.artworkIds.includes(artwork._id)) {
      targetFolder.artworkIds.push(artwork._id);
      await targetFolder.save();
    }

    res.json({
      message: "Artwork moved successfully",
      artwork,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Copy artwork to a different folder
// @route   POST /api/artworks/:id/copy
// @access  Private
export const copyArtworkToFolder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { targetFolderId } = req.body;

    if (!targetFolderId) {
      return res.status(400).json({ message: "Target folder ID is required" });
    }

    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    // Check if user can access this artwork (public or user owns it)
    if (
      !artwork.isPublic &&
      String(artwork.userId) !== String(req.user._id)
    ) {
      return res.status(403).json({
        message: "You do not have permission to access this artwork",
      });
    }

    // Verify target folder exists and belongs to the requesting user
    const targetFolder = await Folder.findById(targetFolderId);

    if (!targetFolder) {
      return res.status(404).json({ message: "Target folder not found" });
    }

    if (String(targetFolder.userId) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You do not have permission to add artwork to this folder",
      });
    }

    // Add artwork to target folder (without creating a duplicate)
    if (!targetFolder.artworkIds.includes(artwork._id)) {
      targetFolder.artworkIds.push(artwork._id);
      await targetFolder.save();
    }

    res.status(201).json({
      message: "Artwork added to folder successfully",
      artwork,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove artwork from folder
// @route   POST /api/artworks/:id/remove-from-folder
// @access  Private
export const removeArtworkFromFolder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    if (String(artwork.userId) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You do not have permission to modify this artwork",
      });
    }

    // Remove artwork from its folder
    if (artwork.folderId) {
      const folder = await Folder.findById(artwork.folderId);
      if (folder) {
        folder.artworkIds = folder.artworkIds.filter(
          (id) => String(id) !== String(artwork._id),
        );
        await folder.save();
      }
    }

    res.json({
      message: "Artwork removed from folder",
      artwork,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
