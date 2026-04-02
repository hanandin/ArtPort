"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import FeedbackQuestionSelect from "@/components/feedback/FeedbackQuestionSelect";
import type { FeedbackFormConfig } from "@/types/feedback";

export default function SelectArtworkParam({
  config,
}: {
  config: FeedbackFormConfig;
}) {
  const searchParams = useSearchParams();
  const fromQuery = searchParams.get("artworkId")?.trim() ?? "";
  const resolvedArtworkId = useMemo(() => {
    if (fromQuery) return fromQuery;
    try {
      return localStorage.getItem("artport_last_artwork_id")?.trim() ?? "";
    } catch {
      return "";
    }
  }, [fromQuery]);

  return (
    <FeedbackQuestionSelect config={config} initialArtworkId={resolvedArtworkId} />
  );
}
