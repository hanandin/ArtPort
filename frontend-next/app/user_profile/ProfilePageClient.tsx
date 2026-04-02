"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ProfileCard, {
  PROFILE_LS_BANNER,
  type ProfilePostItem,
} from "@/components/profilecard";
import { resolveApiAssetUrl } from "@/lib/artworkApi";
import {
  fetchUserProfileLookup,
  patchUserProfile,
  type ApiUserProfile,
} from "@/lib/userProfileApi";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ApiArtwork = {
  _id: string;
  title?: string;
  description?: string;
  filePath?: string;
  thumbnailPath?: string;
  imageUrl?: string;
  userId?:
    | string
    | { _id?: string; username?: string; profilePictureUrl?: string };
};

function artworkOwnerId(raw: ApiArtwork): string | undefined {
  const u = raw.userId;
  if (u == null) return undefined;
  if (typeof u === "object" && "_id" in u && u._id != null) {
    return String(u._id);
  }
  return String(u);
}

function mapUserArtworks(
  data: unknown,
  userId: string | undefined
): ProfilePostItem[] {
  if (!Array.isArray(data) || !userId) return [];
  const items: ProfilePostItem[] = [];
  for (const raw of data) {
    const a = raw as ApiArtwork;
    const owner = artworkOwnerId(a);
    if (owner == null || owner !== String(userId)) continue;
    const imageSrc =
      a.filePath || a.imageUrl || a.thumbnailPath || "";
    if (!imageSrc) continue;
    items.push({
      id: String(a._id),
      title: a.title?.trim() ? a.title : "Untitled",
      imageSrc,
      description:
        typeof (a as { description?: string }).description === "string"
          ? (a as { description: string }).description
          : "",
    });
  }
  return items;
}

function readStoredUserId(): string | undefined {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return undefined;
    const u = JSON.parse(raw) as { _id?: string };
    return u._id ? String(u._id) : undefined;
  } catch {
    return undefined;
  }
}

type Props = {
  profileHandle: string;
};

export default function ProfilePageClient({ profileHandle }: Props) {
  const router = useRouter();
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("…");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [bannerUrl, setBannerUrl] = useState<string | undefined>(undefined);
  const [userPosts, setUserPosts] = useState<ProfilePostItem[]>([]);
  const [loadError, setLoadError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerError, setBannerError] = useState("");
  const [bannerUploading, setBannerUploading] = useState(false);

  const myId = readStoredUserId();
  const isOwn = Boolean(
    myId && resolvedUserId && String(myId) === String(resolvedUserId)
  );

  const applyProfile = useCallback((u: ApiUserProfile) => {
    if (u.username) setUsername(u.username);
    if (typeof u.bio === "string") setBio(u.bio);
    setAvatarUrl(u.profilePictureUrl || undefined);
    setBannerUrl(u.bannerPictureUrl || undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadError("");
    setResolvedUserId(null);
    fetchUserProfileLookup(profileHandle).then((data) => {
      if (cancelled) return;
      if (!data || !data._id) {
        setLoadError("Profile not found.");
        setUsername("Unknown user");
        return;
      }
      const id = String(data._id);
      setResolvedUserId(id);
      applyProfile(data);
      const uname = data.username?.trim();
      if (
        uname &&
        /^[a-f\d]{24}$/i.test(profileHandle.trim()) &&
        profileHandle.trim() !== uname
      ) {
        router.replace(`/user_profile/${encodeURIComponent(uname)}`);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [profileHandle, applyProfile, router]);

  useEffect(() => {
    if (!resolvedUserId) return;
    let cancelled = false;
    fetch(`${API_URL}/api/artworks`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: unknown) => {
        if (cancelled) return;
        setUserPosts(mapUserArtworks(data, resolvedUserId));
      })
      .catch(() => {
        if (!cancelled) setUserPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [resolvedUserId]);

  const handleAvatarUpload = async (blob: Blob) => {
    if (!isOwn || !resolvedUserId) return;
    setAvatarError("");
    setAvatarUploading(true);
    try {
      const updated = await patchUserProfile(resolvedUserId, {
        profilePicture: blob,
      });
      applyProfile(updated);
      try {
        localStorage.removeItem("artport_profile_avatar");
        const prev = localStorage.getItem("user");
        const parsed = prev ? (JSON.parse(prev) as Record<string, unknown>) : {};
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...parsed,
            profilePictureUrl: updated.profilePictureUrl,
          })
        );
      } catch {
      }
    } catch (e) {
      setAvatarError(e instanceof Error ? e.message : "Photo upload failed");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleBannerUpload = async (blob: Blob) => {
    if (!isOwn || !resolvedUserId) return;
    setBannerError("");
    setBannerUploading(true);
    try {
      const updated = await patchUserProfile(resolvedUserId, {
        bannerPicture: blob,
      });
      applyProfile(updated);
      try {
        localStorage.removeItem(PROFILE_LS_BANNER);
        const prev = localStorage.getItem("user");
        const parsed = prev ? (JSON.parse(prev) as Record<string, unknown>) : {};
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...parsed,
            bannerPictureUrl: updated.bannerPictureUrl,
          })
        );
      } catch {
      }
    } catch (e) {
      setBannerError(e instanceof Error ? e.message : "Banner upload failed");
    } finally {
      setBannerUploading(false);
    }
  };

  return (
    <main className="user-profile-main">
      {loadError ? (
        <p style={{ color: "#b91c1c", marginBottom: 12 }}>{loadError}</p>
      ) : null}
      {avatarError ? (
        <p style={{ color: "#b91c1c", marginBottom: 12 }} role="alert">
          {avatarError}
        </p>
      ) : null}
      {isOwn && avatarUploading ? (
        <p style={{ marginBottom: 12, fontSize: 14, opacity: 0.85 }}>
          Uploading new photo…
        </p>
      ) : null}
      {bannerError ? (
        <p style={{ color: "#b91c1c", marginBottom: 12 }} role="alert">
          {bannerError}
        </p>
      ) : null}
      {isOwn && bannerUploading ? (
        <p style={{ marginBottom: 12, fontSize: 14, opacity: 0.85 }}>
          Uploading new banner…
        </p>
      ) : null}

      <ProfileCard
        username={username}
        bio={bio}
        avatarSrc={avatarUrl}
        bannerUrl={
          bannerUrl ? resolveApiAssetUrl(bannerUrl) || bannerUrl : undefined
        }
        followers={0}
        following={0}
        posts={userPosts.length}
        userPosts={userPosts}
        isOwnProfile={isOwn}
        enableBannerEdit={isOwn}
        onAvatarImageChange={isOwn ? handleAvatarUpload : undefined}
        onBannerImageChange={isOwn ? handleBannerUpload : undefined}
      />
    </main>
  );
}
