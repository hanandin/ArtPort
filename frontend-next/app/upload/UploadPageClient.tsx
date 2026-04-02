"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import UploadCard from "@/components/uploadcard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function createdArtworkId(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const raw = d._id ?? d.id;
  if (raw == null) return null;
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && raw !== null && "$oid" in raw) {
    const oid = (raw as { $oid?: string }).$oid;
    return typeof oid === "string" ? oid : null;
  }
  if (typeof raw === "object" && raw !== null && "toString" in raw) {
    const s = String((raw as { toString: () => string }).toString());
    if (s && !s.startsWith("[object ")) return s;
  }
  return null;
}

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

    formData.set("userId", String(uid));
    formData.set("author", String(uid));

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/artworks`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = (await res.json().catch(() => (null))) as unknown;
    if (!res.ok) {
      const err = data && typeof data === "object" ? (data as { message?: string }) : {};
      throw new Error(
        typeof err.message === "string" ? err.message : "Upload failed"
      );
    }
    const id = createdArtworkId(data);
    if (!id) {
      const hint =
        data && typeof data === "object"
          ? ` Response: ${JSON.stringify(data).slice(0, 200)}`
          : "";
      throw new Error(
        `Upload succeeded but no artwork id was returned.${hint}`
      );
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
