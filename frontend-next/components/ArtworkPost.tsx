"use client";
import React, { useState } from "react";
import styles from "./ArtworkPost.module.css";
import FeedbackFormCard from "@/components/feedback/FeedbackFormCard";
import feedbackConfig from "@/data/feedback-questions.json";
import type { FeedbackFormConfig } from "@/types/feedback";

interface ArtworkPostProps {
  imageUrl: string;
  title: string;
  description: string;
  artistName: string;
  artistAvatarUrl?: string;
}

export default function ArtworkPost({
  imageUrl,
  title,
  description,
  artistName,
  artistAvatarUrl,
}: ArtworkPostProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.mainFrame}>

        {/* Left Column: image + caption */}
        <div className={feedbackOpen ? styles.leftColumnNarrow : styles.leftColumn}>

          {/* Image Container */}
          <div className={styles.imageContainer}>
            <img src={imageUrl} alt={title} className={styles.artworkImage} />
          </div>

          {/* Caption Frame */}
          <div className={styles.captionFrame}>
            <h1 className={styles.artworkTitle}>{title}</h1>
            <p className={styles.description}>{description}</p>
            <button
              className={styles.feedbackButton}
              onClick={() => setFeedbackOpen(!feedbackOpen)}
            >
              {feedbackOpen ? "Close Feedback" : "Leave Feedback"}
            </button>
          </div>
        </div>

        {/* Sidebar: artist info (only when feedback is closed) */}
        {!feedbackOpen && (
          <div className={styles.sidebar}>
            <div className={styles.artistInfo}>
              {artistAvatarUrl ? (
                <img
                  src={artistAvatarUrl}
                  alt={artistName}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder} />
              )}
              <span className={styles.username}>{artistName}</span>
            </div>
          </div>
        )}

        {/* Feedback Form Panel (replaces sidebar when open) */}
        {feedbackOpen && (
          <div className={styles.feedbackPanel}>
            <FeedbackFormCard config={feedbackConfig as FeedbackFormConfig} />
          </div>
        )}

      </div>
    </div>
  );
}
