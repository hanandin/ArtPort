"use client";

import { useState } from "react";

import ArtworkPostModal from "@/components/ArtworkPostModal";
import { resolveApiAssetUrl } from "@/lib/artworkApi";

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
  const selected = openId
    ? posts.find((p) => p.id === openId) ?? null
    : null;

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
        />
      ) : null}
    </section>
  );
}
