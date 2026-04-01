import express from 'express';
import { getArtworks, createArtwork, getArtworkById } from '../controllers/artworkController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.route('/')
    .get(getArtworks)
    .post(upload.single('artworkImage'), createArtwork);

router.route('/:id')
    .get(getArtworkById);

export default router;
