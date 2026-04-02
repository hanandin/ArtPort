"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import UploadCard from "@/components/uploadcard";
import {
  ARTWORK_BODY_AUTHOR,
  ARTWORK_BODY_USER_ID,
} from "@/lib/serverApiContract";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const LAST_ARTWORK_ID_LS_KEY = "artport_last_artwork_id";

function messageFromUploadError(
  status: number,
  parsed: unknown,
  rawText: string
): string {
  if (parsed && typeof parsed === "object") {
    const o = parsed as { message?: unknown; error?: unknown };
    if (typeof o.message === "string" && o.message.trim()) return o.message.trim();
    if (typeof o.error === "string" && o.error.trim()) return o.error.trim();
  }
  const t = rawText.trim();
  if (t) {
    return t.length > 400 ? `${t.slice(0, 400)}…` : t;
  }
  return `Upload failed (HTTP ${status})`;
}

const MONGO_ID_RE = /^[a-f\d]{24}$/i;

function isMongoIdString(s: string): string | null {
  const t = s.trim();
  return MONGO_ID_RE.test(t) ? t : null;
}

function createdArtworkId(data: unknown): string | null {
  if (data == null) return null;
  if (typeof data === "string") return isMongoIdString(data);
  if (Array.isArray(data) && data.length > 0) {
    return createdArtworkId(data[0]);
  }
  if (typeof data !== "object") return null;
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
    if (s && !s.startsWith("[object ")) return isMongoIdString(s) ?? s;
  }
  return null;
}

function extractArtworkIdFromRawBody(rawText: string): string | null {
  const t = rawText.replace(/^\uFEFF/, "").trim();
  if (!t) return null;
  try {
    const parsed = JSON.parse(t) as unknown;
    const id = createdArtworkId(parsed);
    if (id) return id;
  } catch {
  }
  const m =
    t.match(/"_id"\s*:\s*"([a-f\d]{24})"/i) ||
    t.match(/"_id"\s*:\s*\{\s*"\$oid"\s*:\s*"([a-f\d]{24})"\s*\}/i) ||
    t.match(/"id"\s*:\s*"([a-f\d]{24})"/i);
  if (m?.[1]) return m[1];
  const loose = t.match(/\b([a-f\d]{24})\b/i);
  return loose?.[1] ?? null;
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

    formData.set(ARTWORK_BODY_USER_ID, String(uid));
    formData.set(ARTWORK_BODY_AUTHOR, String(uid));

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/artworks`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const rawText = await res.text();
    const normalized = rawText.replace(/^\uFEFF/, "");
    let data: unknown = null;
    if (normalized.trim()) {
      try {
        data = JSON.parse(normalized) as unknown;
      } catch {
        data = null;
      }
    }
    if (!res.ok) {
      throw new Error(
        messageFromUploadError(res.status, data, normalized)
      );
    }
    let id =
      createdArtworkId(data) ?? extractArtworkIdFromRawBody(normalized);
    if (!id) {
      router.push("/feedback/select");
      return;
    }
    try {
      localStorage.setItem(LAST_ARTWORK_ID_LS_KEY, String(id));
    } catch {
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
