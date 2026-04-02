"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import ArtIcon from "@/components/articon";
import FeedbackPageShell from "@/components/feedback/FeedbackPageShell";
import { resolveApiAssetUrl } from "@/lib/artworkApi";
import { publicAsset } from "@/lib/paths";
import {
  normalizeArtworksList,
  artworkImageUrl,
  artistIdFromArtworkRaw,
} from "@/lib/artworksNormalize";
import type { FeedPost } from "@/types/feed";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ApiArtwork = Record<string, unknown>;

function mapArtworkToFeedPost(raw: ApiArtwork, index: number): FeedPost {
  const userObj =
    (raw.user && typeof raw.user === "object" && raw.user) ||
    (raw.author && typeof raw.author === "object" && raw.author) ||
    (raw.userId && typeof raw.userId === "object" && raw.userId);

  const u = userObj as
    | {
        username?: string;
        profilePicture?: string;
        profilePictureUrl?: string;
      }
    | undefined;

  const rawImg = artworkImageUrl(raw);
  const img =
    rawImg.trim() === ""
      ? ""
      : resolveApiAssetUrl(rawImg) || rawImg;

  const artistUserId = artistIdFromArtworkRaw(raw);

  const slugRaw = raw.slug;
  const slug =
    typeof slugRaw === "string" && slugRaw.trim() ? slugRaw.trim() : undefined;

  const rawAvatar =
    u?.profilePictureUrl ||
    u?.profilePicture ||
    "";
  const avatarResolved =
    rawAvatar.trim() === ""
      ? ""
      : resolveApiAssetUrl(rawAvatar) || rawAvatar;

  return {
    id: raw._id != null ? String(raw._id) : `post-${index}`,
    slug,
    image: img || publicAsset("/images/artwork_1.jpg"),
    title:
      typeof raw.title === "string" && raw.title.trim()
        ? raw.title.trim()
        : "Untitled",
    username: u?.username || "Unknown artist",
    artistUsername: u?.username?.trim() || undefined,
    userImage:
      avatarResolved || publicAsset("/avatar-default.svg"),
    artistUserId,
  };
}

function HomeInner() {
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId")?.trim() ?? "";
  const feedbackAnchorRef = useRef<HTMLDivElement | null>(null);

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [feedError, setFeedError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/api/artworks`)
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok) {
          const msg =
            data &&
            typeof data === "object" &&
            typeof (data as { message?: string }).message === "string"
              ? (data as { message: string }).message
              : `Could not load feed (${res.status})`;
          setFeedError(msg);
          setPosts([]);
          return;
        }
        const list = normalizeArtworksList(data);
        const mapped = list.map((item, index) =>
          mapArtworkToFeedPost(item as ApiArtwork, index)
        );
        setFeedError("");
        setPosts(mapped);
      })
      .catch(() => {
        if (!cancelled) {
          setFeedError("Network error — is the API running?");
          setPosts([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!formId) return;
    const t = window.setTimeout(() => {
      feedbackAnchorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
    return () => window.clearTimeout(t);
  }, [formId]);

  return (
    <main className="home-main">
      <h1 className="home-title">Front Page</h1>

      {feedError ? (
        <p style={{ color: "#b91c1c", maxWidth: 560, textAlign: "center" }}>
          {feedError}
        </p>
      ) : null}

      <div className="feed-grid">
        {posts.map((post) => (
          <ArtIcon key={post.id} post={post} />
        ))}
      </div>

      {!feedError && posts.length === 0 ? (
        <p style={{ opacity: 0.8 }}>No artworks yet.</p>
      ) : null}

      <p className="feed-end-message">u have reached the end of the page : )</p>

      {formId ? (
        <div
          id="home-feedback-form"
          ref={feedbackAnchorRef}
          style={{ marginTop: 48, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Your feedback form
          </h2>
          <FeedbackPageShell embedded />
        </div>
      ) : null}
    </main>
  );
}

export default function FrontPage() {
  return (
    <Suspense
      fallback={
        <main className="home-main">
          <h1 className="home-title">Front Page</h1>
          <p style={{ textAlign: "center", opacity: 0.85 }}>Loading…</p>
        </main>
      }
    >
      <HomeInner />
    </Suspense>
  );
}
