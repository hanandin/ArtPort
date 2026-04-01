"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./uploadcard.module.css";

export default function UploadCardExact() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user from local storage
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserId(parsedUser._id || parsedUser.id || null);
    }
  }, []);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      const img = new Image();
      img.src = URL.createObjectURL(selectedFile);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 777;
        const maxHeight = 856;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(maxWidth / width, maxHeight / height);
          width *= scale;
          height *= scale;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) setPreview(URL.createObjectURL(blob));
        }, selectedFile.type);
      };

      setFile(selectedFile);
    }
  };

  const handleBoxClick = () => {
    const input = document.getElementById("fileInput");
    input?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image to upload.");
      return;
    }
    if (!title.trim()) {
      setError("Please provide a title.");
      return;
    }
    if (!userId) {
      setError("You must be logged in to upload artwork.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("artworkImage", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("userId", userId);

      const response = await fetch("http://localhost:5000/api/artworks", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to upload artwork");
      }

      // Success
      router.push("/");
    } catch (err: any) {
      setError(err.message);
      setIsUploading(false);
    }
  };


  return (
    <div className={styles.uploadContainer}>
      <h1 className={styles.mainTitle}>Upload Art</h1>

      {/* Upload Box */}
      <div className={styles.uploadFileBox} onClick={handleBoxClick}>
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          onChange={handleFileChange}
          className={styles.hiddenInput}
        />
        {preview ? (
          <img src={preview} alt="Preview" className={styles.previewImage} />
        ) : (
          <div className={styles.uploadIcon}>
            <span>Click here to upload</span>
          </div>
        )}
      </div>

      {/* Title Box */}
      <div className={styles.titleBox}>
        <label htmlFor="title" className={styles.titleLabel}>
          Title
        </label>
        <input
          id="title"
          type="text"
          className={styles.textInput}
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Description Box */}
      <div className={styles.descriptionBox}>
        <label htmlFor="description" className={styles.descriptionLabel}>
          Description (optional)
        </label>
        <textarea
          id="description"
          className={styles.textareaInput}
          placeholder="Enter description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* Buttons */}
      <div className={styles.buttonRow}>
        <button
          className={styles.uploadButton}
          onClick={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
        <button className={styles.cancelButton} onClick={() => router.push("/")}>
          Cancel
        </button>
      </div>
    </div>
  );
}