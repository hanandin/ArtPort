"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import UploadCard from "@/components/uploadcard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UploadPageClient() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const u = JSON.parse(raw) as { _id?: string };
      if (u?._id) setUserId(u._id);
    } catch {
      /* ignore */
    }
  }, []);

  const onUpload = async (formData: FormData) => {
    const uid = userId ?? (() => {
      try {
        const raw = localStorage.getItem("user");
        if (!raw) return undefined;
        const u = JSON.parse(raw) as { _id?: string };
        return u._id;
      } catch {
        return undefined;
      }
    })();

    if (!uid) {
      throw new Error("Log in first so we can attach your artwork to your account.");
    }

    // Same Mongo user id, two possible form field names: some API versions read
    // `userId` (matches User ref on artwork), others read `author`. Sending both
    // avoids a broken upload when only one name is wired on the server.
    formData.set("userId", String(uid));
    formData.set("author", String(uid));

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/artworks`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = (await res.json().catch(() => ({}))) as {
      message?: string;
      _id?: string;
    };
    if (!res.ok) {
      throw new Error(
        typeof data.message === "string" ? data.message : "Upload failed"
      );
    }
    const id = data._id;
    if (!id) {
      throw new Error("Upload succeeded but no artwork id was returned.");
    }
    router.push(
      `/feedback/select?artworkId=${encodeURIComponent(String(id))}`
    );
  };

  return (
    <main className="upload-route">
      <h1> Upload page </h1>
      {!userId ? (
        <p style={{ marginBottom: 16, color: "#92400e" }}>
          You need to{" "}
          <Link href="/login" style={{ fontWeight: 600 }}>
            log in
          </Link>{" "}
          before uploading — the API requires your user id.
        </p>
      ) : null}
      <UploadCard onUpload={onUpload} userId={userId} />
    </main>
  );
}
