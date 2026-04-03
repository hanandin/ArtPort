"use client";

import { useCallback, useEffect, useState } from "react";

import ProfileCard, {
  type ProfilePostItem,
} from "@/components/profilecard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type StoredUser = {
  _id?: string;
  username?: string;
  email?: string;
  token?: string;
  profilePictureUrl?: string;
  bannerPictureUrl?: string;
};

type ApiArtwork = {
  _id: string;
  title?: string;
  filePath?: string;
  thumbnailPath?: string;
  imageUrl?: string;
  userId?: string;
};

function mapUserArtworks(
  data: unknown,
  userId: string | undefined
): ProfilePostItem[] {
  if (!Array.isArray(data) || !userId) return [];
  const items: ProfilePostItem[] = [];
  for (const raw of data) {
    const a = raw as ApiArtwork;
    if (a.userId == null || String(a.userId) !== String(userId)) continue;
    const imageSrc =
      a.thumbnailPath || a.filePath || a.imageUrl || "";
    if (!imageSrc) continue;
    items.push({
      id: String(a._id),
      title: a.title?.trim() ? a.title : "Untitled",
      imageSrc,
    });
  }
  return items;
}

export default function UserProfilePage() {
  const [username, setUsername] = useState("Artist");
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userPosts, setUserPosts] = useState<ProfilePostItem[]>([]);

  const uploadUserImage = useCallback(
    async (fieldName: "profilePicture" | "bannerPicture", blob: Blob) => {
      if (!userId) return;

      const token = localStorage.getItem("token");
      const formData = new FormData();
      const fileName =
        fieldName === "profilePicture" ? "profile.jpg" : "banner.jpg";
      formData.append(fieldName, blob, fileName);

      const res = await fetch(`${API_URL}/api/users/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(data.message || "Failed to update profile image");
      }

      const updated = (await res.json().catch(() => ({}))) as {
        _id?: string;
        username?: string;
        email?: string;
        profilePictureUrl?: string;
        bannerPictureUrl?: string;
      };

      const existingRaw = localStorage.getItem("user");
      const existing = existingRaw ? (JSON.parse(existingRaw) as StoredUser) : {};
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...existing,
          _id: updated._id ?? existing._id,
          username: updated.username ?? existing.username,
          email: updated.email ?? existing.email,
          profilePictureUrl:
            updated.profilePictureUrl ?? existing.profilePictureUrl,
          bannerPictureUrl: updated.bannerPictureUrl ?? existing.bannerPictureUrl,
        }),
      );
    },
    [userId],
  );

  const handleAvatarImageChange = useCallback(
    async (blob: Blob) => {
      await uploadUserImage("profilePicture", blob);
    },
    [uploadUserImage],
  );

  const handleBannerImageChange = useCallback(
    async (blob: Blob) => {
      await uploadUserImage("bannerPicture", blob);
    },
    [uploadUserImage],
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const user = JSON.parse(raw) as StoredUser;
      if (user.username) setUsername(user.username);
      if (user._id) setUserId(String(user._id));
    } catch {
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      setUserPosts([]);
      return;
    }
    let cancelled = false;
    fetch(`${API_URL}/api/artworks`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: unknown) => {
        if (cancelled) return;
        setUserPosts(mapUserArtworks(data, userId));
      })
      .catch(() => {
        if (!cancelled) setUserPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const postCount = userPosts.length;

  return (
    <main className="user-profile-main">
      <ProfileCard
        username={username}
        bio="Welcome to your ArtPort profile."
        followers={0}
        following={0}
        posts={postCount}
        userPosts={userPosts}
        onAvatarImageChange={handleAvatarImageChange}
        onBannerImageChange={handleBannerImageChange}
      />
    </main>
  );
}
