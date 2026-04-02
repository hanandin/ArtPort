"use client";

import { useEffect, useState } from "react";

import ArtworkPost from "@/components/ArtworkPost";
import {
  FEED_ARTWORK_PLACEHOLDER,
  artworkArtistFromDetail,
  artworkDetailImageUrl,
  fetchArtworkForPost,
  resolveApiAssetUrl,
  type ApiArtworkDetail,
} from "@/lib/artworkApi";
import {
  fetchFeedbackForm,
  fetchFeedbackFormByArtworkId,
  mapApiFormToConfig,
  type ApiFeedbackForm,
} from "@/lib/feedbackApi";
import type { FeedbackFormConfig } from "@/types/feedback";

type Props = {
  segment: string;
};

export default function PostPageClient({ segment }: Props) {
  const [artwork, setArtwork] = useState<ApiArtworkDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedbackConfig, setFeedbackConfig] =
    useState<FeedbackFormConfig | null>(null);
  const [feedbackFormId, setFeedbackFormId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setFeedbackConfig(null);
    setFeedbackFormId(null);

    fetchArtworkForPost(segment)
      .then(async (data) => {
        if (cancelled) return;
        if (!data || !data._id) {
          setLoading(false);
          setError("Artwork not found.");
          setArtwork(null);
          return;
        }
        setArtwork(data);

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

        let form: ApiFeedbackForm | null = null;

        // 1) Try stored formId (reliable by-ID endpoint)
        if (token) {
          try {
            const storedFormId = localStorage.getItem(
              `artport_form_for_${data._id}`
            );
            if (storedFormId) {
              form = await fetchFeedbackForm(storedFormId, token).catch(
                () => null
              );
            }
          } catch { /* localStorage unavailable */ }
        }

        // 2) Fall back to artwork-based search
        if (!form) {
          form = await fetchFeedbackFormByArtworkId(data._id, token);
        }

        if (cancelled) return;
        if (form) {
          setFeedbackConfig(mapApiFormToConfig(form));
          setFeedbackFormId(String(form._id));
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setError("Could not load artwork.");
          setArtwork(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [segment]);

  if (loading) {
    return (
      <p style={{ padding: 24, fontFamily: "Inter, sans-serif" }}>Loading…</p>
    );
  }

  if (error || !artwork) {
    return (
      <p style={{ padding: 24, color: "#b91c1c", fontFamily: "Inter, sans-serif" }}>
        {error || "Artwork not found."}
      </p>
    );
  }

  const rawImg = artworkDetailImageUrl(artwork);
  const imageUrl = rawImg
    ? resolveApiAssetUrl(rawImg) || rawImg
    : FEED_ARTWORK_PLACEHOLDER;

  const artist = artworkArtistFromDetail(artwork);
  const avatar = artist.avatarUrl
    ? resolveApiAssetUrl(artist.avatarUrl) || artist.avatarUrl
    : undefined;

  const artistProfileHref =
    artist.artistUsername != null && artist.artistUsername !== ""
      ? `/user_profile/${encodeURIComponent(artist.artistUsername)}`
      : artist.userId
        ? `/user_profile/${encodeURIComponent(artist.userId)}`
        : undefined;

  return (
    <ArtworkPost
      imageUrl={imageUrl}
      title={artwork.title?.trim() ? artwork.title : "Untitled"}
      description={
        typeof artwork.description === "string" ? artwork.description : ""
      }
      artistName={artist.name}
      artistAvatarUrl={avatar}
      artistProfileHref={artistProfileHref}
      feedbackConfig={feedbackConfig ?? undefined}
      feedbackFormId={feedbackFormId ?? undefined}
    />
  );
}
