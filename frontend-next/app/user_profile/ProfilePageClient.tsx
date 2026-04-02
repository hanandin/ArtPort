"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import ProfileCard, { type ProfilePostItem } from "@/components/profilecard";
import { resolveApiAssetUrl } from "@/lib/artworkApi";
import { normalizeArtworksList } from "@/lib/artworksNormalize";
import {
  fetchUserProfileLookup,
  type ApiUserProfile,
} from "@/lib/userProfileApi";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** Mirrors GET /api/artworks — backend may use author + imageUrl and/or userId + filePath. */
type ApiArtwork = {
  _id: string;
  title?: string;
  description?: string;
  filePath?: string;
  thumbnailPath?: string;
  imageUrl?: string;
  author?: string | { _id?: string; username?: string; profilePictureUrl?: string };
  userId?: string | { _id?: string; username?: string; profilePictureUrl?: string };
};

function artworkOwnerId(raw: ApiArtwork): string | undefined {
  const u = raw.author ?? raw.userId;
  if (u == null) return undefined;
  if (typeof u === "object" && u !== null && "_id" in u && (u as { _id?: unknown })._id != null) {
    return String((u as { _id: unknown })._id);
  }
  return String(u);
}

function mapUserArtworks(
  data: unknown,
  userId: string | undefined
): ProfilePostItem[] {
  const arr = normalizeArtworksList(data);
  if (arr.length === 0 || !userId) return [];
  const data_ = arr;
  const items: ProfilePostItem[] = [];
  for (const raw of data_) {
    const a = raw as ApiArtwork;
    const owner = artworkOwnerId(a);
    if (owner == null || owner !== String(userId)) continue;
    const imageSrc =
      a.imageUrl || a.filePath || a.thumbnailPath || "";
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
  const [bannerError, setBannerError] = useState("");

  const avatarBlobRef = useRef<string | null>(null);
  const bannerBlobRef = useRef<string | null>(null);

  const myId = readStoredUserId();
  const isOwn = Boolean(
    myId && resolvedUserId && String(myId) === String(resolvedUserId)
  );

  const applyProfile = useCallback((u: ApiUserProfile) => {
    if (avatarBlobRef.current) {
      URL.revokeObjectURL(avatarBlobRef.current);
      avatarBlobRef.current = null;
    }
    if (bannerBlobRef.current) {
      URL.revokeObjectURL(bannerBlobRef.current);
      bannerBlobRef.current = null;
    }
    if (u.username) setUsername(u.username);
    if (typeof u.bio === "string") setBio(u.bio);
    setAvatarUrl(u.profilePictureUrl || undefined);
    setBannerUrl(undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadError("");
    setResolvedUserId(null);
    fetchUserProfileLookup(profileHandle)
      .then((data) => {
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
      })
      .catch(() => {
        if (!cancelled) setLoadError("Could not load profile.");
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

  /** No PATCH /api/users on server — keep preview locally (ProfileCard also persists to localStorage). */
  const handleAvatarUpload = async (blob: Blob) => {
    if (!isOwn || !resolvedUserId) return;
    setAvatarError("");
    try {
      if (avatarBlobRef.current) {
        URL.revokeObjectURL(avatarBlobRef.current);
        avatarBlobRef.current = null;
      }
      const url = URL.createObjectURL(blob);
      avatarBlobRef.current = url;
      setAvatarUrl(url);
    } catch (e) {
      setAvatarError(e instanceof Error ? e.message : "Photo update failed");
    }
  };

  const handleBannerUpload = async (blob: Blob) => {
    if (!isOwn || !resolvedUserId) return;
    setBannerError("");
    try {
      if (bannerBlobRef.current) {
        URL.revokeObjectURL(bannerBlobRef.current);
        bannerBlobRef.current = null;
      }
      const url = URL.createObjectURL(blob);
      bannerBlobRef.current = url;
      setBannerUrl(url);
    } catch (e) {
      setBannerError(e instanceof Error ? e.message : "Banner update failed");
    }
  };

  useEffect(() => {
    return () => {
      if (avatarBlobRef.current) URL.revokeObjectURL(avatarBlobRef.current);
      if (bannerBlobRef.current) URL.revokeObjectURL(bannerBlobRef.current);
    };
  }, []);

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
      {bannerError ? (
        <p style={{ color: "#b91c1c", marginBottom: 12 }} role="alert">
          {bannerError}
        </p>
      ) : null}

      <ProfileCard
        username={username}
        bio={bio}
        avatarSrc={
          avatarUrl ? resolveApiAssetUrl(avatarUrl) || avatarUrl : undefined
        }
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
