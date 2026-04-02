"use client";

import { useEffect } from "react";

import ArtworkPost from "@/components/ArtworkPost";
import { FEED_ARTWORK_PLACEHOLDER, resolveApiAssetUrl } from "@/lib/artworkApi";
import type { FeedbackFormConfig } from "@/types/feedback";

import styles from "./ArtworkPostModal.module.css";
import type { ProfilePostItem } from "@/components/ProfilePostsGrid";

export type ArtworkPostModalProps = {
  open: boolean;
  onClose: () => void;
  post: ProfilePostItem;
  artistName: string;
  artistAvatarUrl?: string;
  artistProfileHref?: string;
  feedbackConfig?: FeedbackFormConfig;
  feedbackFormId?: string;
};

export default function ArtworkPostModal({
  open,
  onClose,
  post,
  artistName,
  artistAvatarUrl,
  artistProfileHref,
  feedbackConfig,
  feedbackFormId,
}: ArtworkPostModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const rawSrc = resolveApiAssetUrl(post.imageSrc) || post.imageSrc;
  const imageUrl = rawSrc.trim() ? rawSrc : FEED_ARTWORK_PLACEHOLDER;

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={styles.modalOuter}
        role="dialog"
        aria-modal="true"
        aria-label={post.title}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <ArtworkPost
          imageUrl={imageUrl}
          title={post.title}
          description={post.description ?? ""}
          artistName={artistName}
          artistAvatarUrl={
            artistAvatarUrl
              ? resolveApiAssetUrl(artistAvatarUrl) || artistAvatarUrl
              : undefined
          }
          artistProfileHref={artistProfileHref}
          feedbackConfig={feedbackConfig}
          feedbackFormId={feedbackFormId}
        />
      </div>
    </div>
  );
}
