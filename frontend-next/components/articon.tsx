"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { publicAsset } from "@/lib/paths";
import { FEED_ARTWORK_PLACEHOLDER, resolveApiAssetUrl } from "@/lib/artworkApi";
import type { FeedPost } from "@/types/feed";

const PLACEHOLDER_AVATAR = publicAsset("/avatar-default.svg");

export default function ArtIcon({ post }: { post: FeedPost }) {
  const router = useRouter();
  const profileHref =
    post.artistUsername != null && post.artistUsername !== ""
      ? `/user_profile/${encodeURIComponent(post.artistUsername)}`
      : post.artistUserId
        ? `/user_profile/${encodeURIComponent(post.artistUserId)}`
        : null;

  const imageSrc = resolveApiAssetUrl(post.image) || post.image;

  const goToPost = () => {
    const seg = post.slug || post.id;
    router.push(`/post/${encodeURIComponent(seg)}`);
  };

  const inner = (
    <div
      className="articon-container"
      role="button"
      tabIndex={0}
      onClick={goToPost}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToPost();
        }
      }}
    >
      <img
        src={imageSrc}
        alt={post.title}
        className="articon-image"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={(e) => {
          const el = e.currentTarget;
          if (el.src !== FEED_ARTWORK_PLACEHOLDER) {
            el.src = FEED_ARTWORK_PLACEHOLDER;
          }
        }}
      />

      <div className="articon-overlay">
        <div className="articon-user">
          {profileHref ? (
            <Link
              href={profileHref}
              className="articon-user-link"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={resolveApiAssetUrl(post.userImage) || post.userImage}
                alt=""
                className="articon-avatar"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const el = e.currentTarget;
                  if (el.src !== PLACEHOLDER_AVATAR) el.src = PLACEHOLDER_AVATAR;
                }}
              />
              <span className="articon-username">{post.username}</span>
            </Link>
          ) : (
            <>
              <img
                src={resolveApiAssetUrl(post.userImage) || post.userImage}
                alt=""
                className="articon-avatar"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const el = e.currentTarget;
                  if (el.src !== PLACEHOLDER_AVATAR) el.src = PLACEHOLDER_AVATAR;
                }}
              />
              <span className="articon-username">{post.username}</span>
            </>
          )}
        </div>

        <div className="articon-title">{post.title}</div>
      </div>
    </div>
  );

  return inner;
}
