"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import FeedbackFormCard from "@/components/feedback/FeedbackFormCard";
import feedbackConfig from "@/data/feedback-questions.json";
import {
  fetchFeedbackForm,
  mapApiFormToConfig,
} from "@/lib/feedbackApi";
import type { FeedbackFormConfig } from "@/types/feedback";

import styles from "@/app/feedback/feedback.module.css";

const staticConfig = feedbackConfig as FeedbackFormConfig;

function FeedbackPageInner({ embedded }: { embedded?: boolean }) {
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId")?.trim() || "";
  const Root = embedded ? "div" : "main";

  const [apiConfig, setApiConfig] = useState<FeedbackFormConfig | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!formId) {
      setApiConfig(null);
      setLoadError("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError("");
    setApiConfig(null);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    fetchFeedbackForm(formId, token)
      .then((form) => {
        if (cancelled) return;
        setApiConfig(mapApiFormToConfig(form));
      })
      .catch((err: Error) => {
        if (!cancelled) setLoadError(err.message || "Could not load form");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [formId]);

  if (formId && loading) {
    return (
      <Root className={styles.main}>
        <p>Loading feedback form…</p>
      </Root>
    );
  }

  if (formId && loadError) {
    return (
      <Root className={styles.main}>
        <p style={{ color: "#b91c1c" }}>{loadError}</p>
        <p style={{ marginTop: 8, fontSize: 14, opacity: 0.8 }}>
          You must be logged in as the form owner to load this form for now, or
          check the form id. Open{" "}
          <code style={{ fontSize: 13 }}>/feedback</code> without{" "}
          <code style={{ fontSize: 13 }}>formId</code> to use the local demo
          form.
        </p>
      </Root>
    );
  }

  if (formId && apiConfig) {
    return (
      <Root className={styles.main}>
        <FeedbackFormCard config={apiConfig} remoteFormId={formId} />
      </Root>
    );
  }

  return (
    <Root className={styles.main}>
      <FeedbackFormCard config={staticConfig} />
    </Root>
  );
}

export type FeedbackPageShellProps = { embedded?: boolean };

export default function FeedbackPageShell({
  embedded = false,
}: FeedbackPageShellProps) {
  return (
    <Suspense
      fallback={
        <main className={styles.main}>
          <p>Loading…</p>
        </main>
      }
    >
      <FeedbackPageInner embedded={embedded} />
    </Suspense>
  );
}
