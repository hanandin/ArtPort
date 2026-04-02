"use client";

import React, { useRef, useState } from "react";

import ImageCropModal from "@/components/profile/ImageCropModal";
import {
  ARTWORK_BODY_DESCRIPTION,
  ARTWORK_BODY_THUMBNAIL_PATH,
  ARTWORK_BODY_TITLE,
  ARTWORK_BODY_USER_ID,
  ARTWORK_FILE_FIELD,
} from "@/lib/serverApiContract";

const ACCEPT_IMAGES =
  "image/jpeg,image/png,image/gif,image/webp,image/bmp,image/svg+xml,image/heic,image/heif";

const THUMB_ASPECT = 1;

function dataUrlLooksValid(s: string): boolean {
  return /^data:image\/[a-z0-9.+-]+;base64,/i.test(s.trim());
}

export type UploadCardProps = {
  onUpload?: (formData: FormData) => Promise<void> | void;
  userId?: string;
};

export default function UploadCardExact({ onUpload, userId }: UploadCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [artworkDisplayUrl, setArtworkDisplayUrl] = useState("");
  const [thumbnailDisplayUrl, setThumbnailDisplayUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [adjustingThumbnail, setAdjustingThumbnail] = useState(false);

  const fullImageUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const revokeFullImageUrl = () => {
    if (fullImageUrlRef.current) {
      URL.revokeObjectURL(fullImageUrlRef.current);
      fullImageUrlRef.current = null;
    }
    setArtworkDisplayUrl("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    revokeFullImageUrl();
    setThumbnailDisplayUrl("");

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    fullImageUrlRef.current = url;
    setArtworkDisplayUrl(url);
    e.target.value = "";
  };

  const handleCropApply = (dataUrl: string) => {
    setThumbnailDisplayUrl(dataUrl);
    setRawImageSrc(null);
    setAdjustingThumbnail(false);
    setSubmitError("");
  };

  const handleCropCancel = () => {
    if (adjustingThumbnail) {
      setRawImageSrc(null);
      setAdjustingThumbnail(false);
      return;
    }
    revokeFullImageUrl();
    setSelectedFile(null);
    setThumbnailDisplayUrl("");
    setRawImageSrc(null);
  };

  const handleChangeThumbnail = () => {
    if (!artworkDisplayUrl) return;
    setAdjustingThumbnail(true);
    setRawImageSrc(artworkDisplayUrl);
    setSubmitError("");
  };

  const handleBoxClick = () => {
    if (artworkDisplayUrl) return;
    fileInputRef.current?.click();
  };

  const handleReselectPhoto = () => {
    revokeFullImageUrl();
    setThumbnailDisplayUrl("");
    setSelectedFile(null);
    setRawImageSrc(null);
    setAdjustingThumbnail(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async () => {
    setSubmitError("");
    if (!selectedFile) {
      setSubmitError("Please upload a photo.");
      return;
    }
    if (!title.trim()) {
      setSubmitError("Title is required.");
      return;
    }
    if (!onUpload) {
      return;
    }
    const formData = new FormData();
    formData.append(ARTWORK_FILE_FIELD, selectedFile);
    if (userId) formData.append(ARTWORK_BODY_USER_ID, userId);
    formData.append(ARTWORK_BODY_TITLE, title.trim());
    if (description.trim()) {
      formData.append(ARTWORK_BODY_DESCRIPTION, description.trim());
    }
    if (thumbnailDisplayUrl && dataUrlLooksValid(thumbnailDisplayUrl)) {
      // Text payload keeps compatibility with backend routes that use upload.single("image").
      formData.append(ARTWORK_BODY_THUMBNAIL_PATH, thumbnailDisplayUrl);
    }

    try {
      setSubmitting(true);
      await onUpload(formData);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Upload failed. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    revokeFullImageUrl();
    setThumbnailDisplayUrl("");
    setSelectedFile(null);
    setRawImageSrc(null);
    setAdjustingThumbnail(false);
    setSubmitError("");
    setTitle("");
    setDescription("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const canSubmit = Boolean(
    selectedFile && title.trim().length > 0 && onUpload
  );

  return (
    <div className="upload-container">
      <h1 className="main-title">Upload Art</h1>

      <div
        className={`upload-file-box${artworkDisplayUrl ? " upload-file-box-has-image" : ""}`}
        onClick={handleBoxClick}
        role={artworkDisplayUrl ? undefined : "button"}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="fileInput"
          accept={ACCEPT_IMAGES}
          onChange={handleFileChange}
          className="hidden-input"
        />
        {artworkDisplayUrl ? (
          <img
            src={artworkDisplayUrl}
            alt="Artwork preview"
            className="preview-image-full"
          />
        ) : (
          <div className="upload-icon">
            <span>Click here to upload</span>
          </div>
        )}
      </div>

      <div className="upload-below-box">
        {artworkDisplayUrl ? (
          <button
            type="button"
            className="reselect-photo-button"
            onClick={(e) => {
              e.stopPropagation();
              handleReselectPhoto();
            }}
          >
            Choose a different photo
          </button>
        ) : null}
        <p className="upload-file-hint">
          Please upload your artwork image above
        </p>
      </div>

      <div className="upload-thumbnail-section">
        <p className="upload-thumbnail-label">Optional square crop (preview only)</p>
        {thumbnailDisplayUrl ? (
          <div className="upload-thumb-preview-wrap">
            <img
              src={thumbnailDisplayUrl}
              alt="Crop preview"
              className="upload-thumbnail-img"
            />
          </div>
        ) : artworkDisplayUrl ? (
          <p className="upload-thumbnail-placeholder">
            Upload uses your full image. Crop here if you want a square preview.
          </p>
        ) : (
          <p className="upload-thumbnail-placeholder">
            After you choose a photo, you can crop a square preview (optional).
          </p>
        )}
        {artworkDisplayUrl ? (
          <button
            type="button"
            className="change-thumbnail-button"
            onClick={handleChangeThumbnail}
          >
            {thumbnailDisplayUrl ? "Change crop preview" : "Crop preview"}
          </button>
        ) : null}
      </div>

      <div className="title-box">
        <label htmlFor="title" className="title-label">
          Title <span className="title-required" aria-hidden>*</span>
        </label>
        <input
          id="title"
          type="text"
          className="text-input"
          placeholder="Enter title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSubmitError("");
          }}
          required
          aria-required="true"
        />
      </div>

      <div className="description-box">
        <label htmlFor="artwork-description" className="description-label">
          Description (optional)
        </label>
        <textarea
          id="artwork-description"
          name="artwork-description"
          className="textarea-input"
          placeholder="Enter description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
        />
      </div>

      {submitError ? (
        <p className="upload-submit-error" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="button-row">
        <button
          type="button"
          className="upload-button"
          disabled={!canSubmit || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Uploading..." : "Upload"}
        </button>
        <button
          type="button"
          className="cancel-button"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>

      {rawImageSrc ? (
        <ImageCropModal
          imageSrc={rawImageSrc}
          aspect={THUMB_ASPECT}
          cropShape="rect"
          title={
            adjustingThumbnail
              ? "Adjust square crop"
              : "Square crop (optional preview)"
          }
          onApply={handleCropApply}
          onCancel={handleCropCancel}
        />
      ) : null}
    </div>
  );
}
