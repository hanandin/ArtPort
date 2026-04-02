"use client";

import { useParams } from "next/navigation";

import ProfilePageClient from "../ProfilePageClient";

export default function UserProfilePage() {
  const params = useParams();
  const raw = params?.username;
  const username = Array.isArray(raw) ? raw[0] : raw;

  if (!username || typeof username !== "string") {
    return (
      <main className="user-profile-main" style={{ padding: 24 }}>
        <p>Invalid profile link.</p>
      </main>
    );
  }

  return <ProfilePageClient profileHandle={username} />;
}
