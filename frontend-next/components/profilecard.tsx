"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import ImageCropModal from "@/components/profile/ImageCropModal";
import Folder from "@/components/folder";
import ProfilePostsGrid, {
  type ProfilePostItem,
} from "@/components/ProfilePostsGrid";
import { publicAsset } from "@/lib/paths";

import "./profilecard.css";

export type { ProfilePostItem };

export type ProfileCardProps = {
  username: string;
  bio?: string;
  avatarSrc?: string;
  bannerUrl?: string;
  followers?: number;
  following?: number;
  posts?: number;
  userPosts?: ProfilePostItem[];
  isOwnProfile?: boolean;
  enableBannerEdit?: boolean;
  onAvatarImageChange?: (blob: Blob) => Promise<void> | void;
  onBannerImageChange?: (blob: Blob) => Promise<void> | void;
};

const DEFAULT_AVATAR = publicAsset("/avatar-default.svg");
const LS_AVATAR = "artport_profile_avatar";
export const PROFILE_LS_BANNER = "artport_profile_banner";
const BANNER_ASPECT = 935 / 323;

function isRemoteImageUrl(s: string | undefined): s is string {
  return typeof s === "string" && /^https?:\/\//i.test(s.trim());
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  const parts = dataUrl.split(",");
  if (parts.length !== 2) return null;
  const match = parts[0].match(/data:(.*);base64/);
  const mime = match?.[1] ?? "image/jpeg";
  try {
    const binary = atob(parts[1]);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  } catch {
    return null;
  }
}

export default function ProfileCard({
  username,
  bio = "",
  avatarSrc: avatarSrcProp,
  bannerUrl: bannerUrlProp,
  followers = 0,
  following = 0,
  posts = 0,
  userPosts = [],
  isOwnProfile = true,
  enableBannerEdit = false,
  onAvatarImageChange,
  onBannerImageChange,
}: ProfileCardProps) {
  const [avatarSrc, setAvatarSrc] = useState(
    avatarSrcProp ?? DEFAULT_AVATAR
  );
  const [bannerSrc, setBannerSrc] = useState<string | null>(
    bannerUrlProp ?? null
  );
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [cropMode, setCropMode] = useState<"avatar" | "banner" | null>(null);
  const [pendingTarget, setPendingTarget] = useState<
    "avatar" | "banner" | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOwnProfile) {
      setAvatarSrc(avatarSrcProp ?? DEFAULT_AVATAR);
      setBannerSrc(bannerUrlProp ?? null);
      return;
    }
    try {
      const storedAvatar = localStorage.getItem(LS_AVATAR);
      const storedBanner = localStorage.getItem(PROFILE_LS_BANNER);

      if (isRemoteImageUrl(avatarSrcProp)) {
        setAvatarSrc(avatarSrcProp);
      } else if (storedAvatar) {
        setAvatarSrc(storedAvatar);
      } else if (avatarSrcProp) {
        setAvatarSrc(avatarSrcProp);
      } else {
        setAvatarSrc(DEFAULT_AVATAR);
      }

      if (isRemoteImageUrl(bannerUrlProp)) {
        setBannerSrc(bannerUrlProp);
      } else if (enableBannerEdit && storedBanner) {
        setBannerSrc(storedBanner);
      } else {
        setBannerSrc(bannerUrlProp ?? null);
      }
    } catch {
      setAvatarSrc(avatarSrcProp ?? DEFAULT_AVATAR);
      setBannerSrc(bannerUrlProp ?? null);
    }
  }, [avatarSrcProp, bannerUrlProp, isOwnProfile, enableBannerEdit]);

  const endCropSession = useCallback(() => {
    setRawImageSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setCropMode(null);
  }, []);

  const triggerPick = (target: "avatar" | "banner") => {
    setPendingTarget(target);
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingTarget) return;
    const url = URL.createObjectURL(file);
    setRawImageSrc(url);
    setCropMode(pendingTarget);
    setPendingTarget(null);
    e.target.value = "";
  };

  const applyCrop = (dataUrl: string) => {
    const blob = dataUrlToBlob(dataUrl);

    if (cropMode === "avatar") {
      setAvatarSrc(dataUrl);
      try {
        localStorage.setItem(LS_AVATAR, dataUrl);
      } catch {
      }
      if (blob && onAvatarImageChange) {
        onAvatarImageChange(blob);
      }
    } else if (cropMode === "banner" && enableBannerEdit) {
      setBannerSrc(dataUrl);
      try {
        localStorage.setItem(PROFILE_LS_BANNER, dataUrl);
      } catch {
      }
      if (blob && onBannerImageChange) {
        onBannerImageChange(blob);
      }
    }
    endCropSession();
  };

  return (
    <article className="entire_container">
      {isOwnProfile ? (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="profile_hidden_file_input"
          onChange={onFileChange}
          tabIndex={-1}
          aria-hidden
        />
      ) : null}

      <div className="banner_container">
        {bannerSrc ? (
          <img
            src={bannerSrc}
            alt=""
            className="banner_image"
            referrerPolicy="no-referrer"
          />
        ) : null}
        {isOwnProfile && enableBannerEdit ? (
          <button
            type="button"
            className="edit_banner_btn"
            onClick={() => triggerPick("banner")}
            aria-label="Change banner image"
          >
            Edit banner
          </button>
        ) : null}
      </div>

      <div className="profile_header_row">
        <div className="profile_picture_container">
          <img
            src={avatarSrc}
            alt={`${username} profile photo`}
            width={200}
            height={200}
            className="profile_pfp_image"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const el = e.currentTarget;
              // Avoid infinite loop if default avatar also fails to load
              if (el.src.includes("avatar-default.svg")) return;
              el.src = DEFAULT_AVATAR;
            }}
          />
          {isOwnProfile ? (
            <button
              type="button"
              className="profile_change_photo_btn"
              onClick={() => triggerPick("avatar")}
              aria-label="Change profile photo"
            >
              Change photo
            </button>
          ) : null}
        </div>

        <div className="profile_text_block">
          <h1 className="profile_username">{username}</h1>
          {bio ? (
            <p className="profile_user_bio">{bio}</p>
          ) : (
            <p className="profile_user_bio muted">No bio yet.</p>
          )}
        </div>

        <div className="profile_stats_col">
          <p className="stats_individual">{followers} followers</p>
          <p className="stats_individual">{following} following</p>
          <p className="stats_individual">{posts} posts</p>
        </div>
      </div>

      <div className="separation">
        <div className="folder_row">
          <Folder label="Portfolio" />
          <Folder label="Archive" />
        </div>
        <div className="profile_posts_section">
          <ProfilePostsGrid
            posts={userPosts}
            username={username}
            artistAvatarUrl={avatarSrc}
            artistProfileHref={
              username && username !== "…" && username !== "Unknown user"
                ? `/user_profile/${encodeURIComponent(username)}`
                : undefined
            }
          />
        </div>
      </div>

      {rawImageSrc && cropMode ? (
        <ImageCropModal
          imageSrc={rawImageSrc}
          aspect={cropMode === "banner" ? BANNER_ASPECT : 1}
          cropShape={cropMode === "avatar" ? "round" : "rect"}
          title={
            cropMode === "banner"
              ? "Adjust banner"
              : "Adjust profile photo"
          }
          onApply={applyCrop}
          onCancel={endCropSession}
        />
      ) : null}
    </article>
  );
}
