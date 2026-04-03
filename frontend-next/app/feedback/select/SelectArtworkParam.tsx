"use client";

import { useSearchParams } from "next/navigation";

import FeedbackQuestionSelect from "@/components/feedback/FeedbackQuestionSelect";
import type { FeedbackFormConfig } from "@/types/feedback";

export default function SelectArtworkParam({
  config,
}: {
  config: FeedbackFormConfig;
}) {
  const searchParams = useSearchParams();
  const fromQuery = searchParams.get("artworkId")?.trim() ?? "";

  return (
    <FeedbackQuestionSelect config={config} initialArtworkId={fromQuery} />
  );
}
