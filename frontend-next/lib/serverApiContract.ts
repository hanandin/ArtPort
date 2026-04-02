/**
 * Contract the frontend follows — mirrors the Express API in `server/src/`.
 * When the backend changes, update this module (and any callers), not the other way around.
 *
 * References:
 * - Artwork POST: `server/src/routes/artworkRoutes.js` + `artworkController.createArtwork`
 * - User GET: `server/src/routes/userRoutes.js` + `userController.getUserProfile`
 *
 * Optional: `patchUserProfile` uses the field names below only if the backend adds PATCH /api/users/:id.
 */

/** POST /api/artworks — multer uses `upload.single(...)` on this field name. */
export const ARTWORK_FILE_FIELD = "image" as const;

/** POST /api/artworks — multipart text; controller uses `userId || author`. */
export const ARTWORK_BODY_USER_ID = "userId" as const;
export const ARTWORK_BODY_AUTHOR = "author" as const;
export const ARTWORK_BODY_TITLE = "title" as const;
export const ARTWORK_BODY_DESCRIPTION = "description" as const;
/** Optional thumbnail preview payload (string data URL), if backend supports it. */
export const ARTWORK_BODY_THUMBNAIL_PATH = "thumbnailPath" as const;

/** If PATCH /api/users/:id exists — multipart file field names. */
export const USER_PATCH_FILE = {
  profilePicture: "profilePicture",
  bannerPicture: "bannerPicture",
} as const;
