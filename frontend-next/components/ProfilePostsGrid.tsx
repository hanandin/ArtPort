"use client";

import { useEffect, useState } from "react";

import ArtworkPostModal from "@/components/ArtworkPostModal";
import { resolveApiAssetUrl } from "@/lib/artworkApi";
import {
  fetchFeedbackForm,
  fetchFeedbackFormByArtworkId,
  mapApiFormToConfig,
  type ApiFeedbackForm,
} from "@/lib/feedbackApi";
import type { FeedbackFormConfig } from "@/types/feedback";

import styles from "./ProfilePostsGrid.module.css";

export type ProfilePostItem = {
  id: string;
  imageSrc: string;
  title: string;
  description?: string;
};

export type ProfilePostsGridProps = {
  posts: ProfilePostItem[];
  username: string;
  artistAvatarUrl?: string;
  artistProfileHref?: string;
};

export default function ProfilePostsGrid({
  posts,
  username,
  artistAvatarUrl,
  artistProfileHref,
}: ProfilePostsGridProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [feedbackConfig, setFeedbackConfig] =
    useState<FeedbackFormConfig | null>(null);
  const [feedbackFormId, setFeedbackFormId] = useState<string | null>(null);

  const selected = openId
    ? posts.find((p) => p.id === openId) ?? null
    : null;

  useEffect(() => {
    if (!openId) {
      setFeedbackConfig(null);
      setFeedbackFormId(null);
      return;
    }

    let cancelled = false;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    (async () => {
      let form: ApiFeedbackForm | null = null;

      if (token) {
        try {
          const storedFormId = localStorage.getItem(
            `artport_form_for_${openId}`
          );
          if (storedFormId) {
            form = await fetchFeedbackForm(storedFormId, token).catch(
              () => null
            );
          }
        } catch { /* localStorage unavailable */ }
      }

      if (!form) {
        form = await fetchFeedbackFormByArtworkId(openId, token);
      }

      if (cancelled) return;
      if (form) {
        setFeedbackConfig(mapApiFormToConfig(form));
        setFeedbackFormId(String(form._id));
      } else {
        setFeedbackConfig(null);
        setFeedbackFormId(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [openId]);

  return (
    <section
      className={styles.section}
      aria-label={`Posts by ${username}`}
    >
      <h2 className={styles.heading}>Your posts</h2>
      {posts.length === 0 ? (
        <p className={styles.empty}>No uploads yet.</p>
      ) : (
        <ul className={styles.grid}>
          {posts.map((p) => (
            <li key={p.id} className={styles.card}>
              <button
                type="button"
                className={styles.cardHit}
                onClick={() => setOpenId(p.id)}
              >
                <span className={styles.thumbWrap}>
                  <img
                    src={resolveApiAssetUrl(p.imageSrc) || p.imageSrc}
                    alt=""
                    className={styles.thumb}
                  />
                </span>
                <span className={styles.title}>{p.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected ? (
        <ArtworkPostModal
          open
          onClose={() => setOpenId(null)}
          post={selected}
          artistName={username}
          artistAvatarUrl={artistAvatarUrl}
          artistProfileHref={artistProfileHref}
          feedbackConfig={feedbackConfig ?? undefined}
          feedbackFormId={feedbackFormId ?? undefined}
        />
      ) : null}
    </section>
  );
}
