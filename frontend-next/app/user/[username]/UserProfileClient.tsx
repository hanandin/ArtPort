"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ProfileCard, {
  type ProfilePostItem,
} from "@/components/profilecard";
import {
  fetchArtworks,
  mapArtworkToProfileItem,
} from "@/lib/artworkApi";
import { apiFetch } from "@/lib/apiClient";
import { getClientAuthToken } from "@/lib/authSession";
import { fetchCurrentUser } from "@/lib/currentUserApi";
import { normalizeUserProfile } from "@/lib/userProfile";

type ApiUserProfile = {
  _id?: string;
  username?: string;
  email?: string;
  bio?: string;
  profilePictureUrl?: string;
  bannerPictureUrl?: string;
  showEmailOnProfile?: boolean;
};

export default function UserProfileClient({
  usernameParam,
}: {
  usernameParam: string;
}) {
  const router = useRouter();
  const [username, setUsername] = useState(usernameParam || "Artist");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [showEmailOnProfile, setShowEmailOnProfile] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>(undefined);
  const [bannerPictureUrl, setBannerPictureUrl] = useState<string | undefined>(undefined);
  const [userPosts, setUserPosts] = useState<ProfilePostItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const token = getClientAuthToken();

    if (!token) {
      return () => {
        cancelled = true;
      };
    }

    fetchCurrentUser().then((user) => {
      if (cancelled || !user?.username) return;

      if (
        user.username.trim().toLowerCase() ===
        usernameParam.trim().toLowerCase()
      ) {
        router.replace("/me");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router, usernameParam]);

  useEffect(() => {
    let cancelled = false;

    apiFetch(`/api/users/by-username/${encodeURIComponent(usernameParam)}`, {
      auth: false,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ApiUserProfile | null) => {
        if (cancelled || !data) return;

        const normalized = normalizeUserProfile(data, usernameParam || "Artist");
        setUsername(normalized.username);
        setBio(normalized.bio);
        setEmail(normalized.email);
        setShowEmailOnProfile(normalized.showEmailOnProfile);
        setUserId(normalized.userId);
        setProfilePictureUrl(normalized.profilePictureUrl);
        setBannerPictureUrl(normalized.bannerPictureUrl);
      })
      .catch(() => {
      });

    return () => {
      cancelled = true;
    };
  }, [usernameParam]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    let cancelled = false;
    fetchArtworks({ userId }).then((data) => {
      if (cancelled) return;
      setUserPosts(
        data
          .map((artwork, index) => mapArtworkToProfileItem(artwork, index))
      );
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const visibleUserPosts = userId ? userPosts : [];
  const profileCardKey = [
    usernameParam,
    username,
    email ?? "",
    profilePictureUrl ?? "",
    bannerPictureUrl ?? "",
  ].join("|");

  const postCount = userPosts.length;

  return (
    <main className="user-profile-main">
      <ProfileCard
        key={profileCardKey}
        username={username}
        avatarSrc={profilePictureUrl}
        bannerSrc={bannerPictureUrl}
        bio={bio}
        contactEmail={showEmailOnProfile ? email : undefined}
        followers={0}
        following={0}
        posts={postCount}
        userPosts={visibleUserPosts}
        isEditable={false}
      />
    </main>
  );
}
