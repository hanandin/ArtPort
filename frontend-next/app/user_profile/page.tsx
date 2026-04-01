"use client";

import { useEffect, useState } from "react";

import ProfileCard, {
  type ProfilePostItem,
} from "@/components/profilecard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type StoredUser = {
  _id?: string;
  username?: string;
  email?: string;
  bio?: string;
  profilePictureUrl?: string;
};

type ApiArtwork = {
  _id: string;
  title?: string;
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
    });
  }
  return items;
}

export default function UserProfilePage() {
  const [username, setUsername] = useState("Artist");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userPosts, setUserPosts] = useState<ProfilePostItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const user = JSON.parse(raw) as StoredUser;
      if (user.username) setUsername(user.username);
      if (user._id) setUserId(String(user._id));
      if (typeof user.bio === "string") setBio(user.bio);
      if (user.profilePictureUrl) setAvatarUrl(user.profilePictureUrl);
    } catch {
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetch(`${API_URL}/api/users/${encodeURIComponent(userId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        if (cancelled || !data || typeof data !== "object") return;
        const u = data as {
          username?: string;
          bio?: string;
          profilePictureUrl?: string;
        };
        if (u.username) setUsername(u.username);
        if (typeof u.bio === "string") setBio(u.bio);
        if (u.profilePictureUrl) setAvatarUrl(u.profilePictureUrl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

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
        bio={bio}
        avatarSrc={avatarUrl}
        followers={0}
        following={0}
        posts={postCount}
        userPosts={userPosts}
      />
    </main>
  );
}
