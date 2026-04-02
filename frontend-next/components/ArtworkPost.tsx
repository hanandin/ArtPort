"use client";

import React, { useState } from "react";
import Link from "next/link";

import FeedbackFormCard from "@/components/feedback/FeedbackFormCard";
import staticFeedbackConfig from "@/data/feedback-questions.json";
import type { FeedbackFormConfig } from "@/types/feedback";

import styles from "./ArtworkPost.module.css";

interface ArtworkPostProps {
  imageUrl: string;
  title: string;
  description: string;
  artistName: string;
  artistAvatarUrl?: string;
  artistProfileHref?: string;
  /** When the artwork has a customized feedback form from the API, pass its config here. */
  feedbackConfig?: FeedbackFormConfig;
  /** The remote form ID so responses are submitted to the backend. */
  feedbackFormId?: string;
}

export default function ArtworkPost({
  imageUrl,
  title,
  description,
  artistName,
  artistAvatarUrl,
  artistProfileHref,
  feedbackConfig: apiFeedbackConfig,
  feedbackFormId,
}: ArtworkPostProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const resolvedConfig = apiFeedbackConfig ?? (staticFeedbackConfig as FeedbackFormConfig);

  return (
    <div className={styles.page}>
      <div className={styles.mainFrame}>
        <div
          className={feedbackOpen ? styles.leftColumnNarrow : styles.leftColumn}
        >
          <div className={styles.imageContainer}>
            <img src={imageUrl} alt={title} className={styles.artworkImage} />
          </div>

          <div className={styles.captionFrame}>
            <h1 className={styles.artworkTitle}>{title}</h1>
            <p className={styles.description}>{description}</p>
            <button
              type="button"
              className={styles.feedbackButton}
              onClick={() => setFeedbackOpen(!feedbackOpen)}
            >
              {feedbackOpen ? "Close Feedback" : "Leave Feedback"}
            </button>
          </div>
        </div>

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
              {artistProfileHref ? (
                <Link href={artistProfileHref} className={styles.username}>
                  {artistName}
                </Link>
              ) : (
                <span className={styles.username}>{artistName}</span>
              )}
            </div>
          </div>
        )}

        {feedbackOpen && (
          <div className={styles.feedbackPanel}>
            <FeedbackFormCard
              config={resolvedConfig}
              remoteFormId={feedbackFormId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
