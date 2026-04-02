"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserProfileMePage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const u = JSON.parse(raw) as { _id?: string; username?: string };
      if (u?._id) {
        router.replace(
          `/user_profile/${encodeURIComponent(String(u._id))}`
        );
      } else if (u?.username) {
        router.replace(
          `/user_profile/${encodeURIComponent(String(u.username))}`
        );
      }
    } catch {
      /* ignore */
    }
  }, [router]);

  return (
    <main className="user-profile-main" style={{ padding: 24 }}>
      <p>
        Open your profile after{" "}
        <Link href="/login" style={{ fontWeight: 600 }}>
          logging in
        </Link>
        , or use a direct link:{" "}
        <code style={{ fontSize: 14 }}>
          /user_profile/&lt;user id or username&gt;
        </code>
      </p>
    </main>
  );
}
