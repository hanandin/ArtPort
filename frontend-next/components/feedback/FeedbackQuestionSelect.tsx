"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import QuestionField from "@/components/questions/QuestionField";
import CheckboxOption from "@/components/questions/CheckboxOption";
import RadioOption from "@/components/questions/RadioOption";
import RatingScale from "@/components/questions/RatingScale";
import type { FeedbackFormConfig, FeedbackQuestion } from "@/types/feedback";
import {
  createFeedbackForm,
  mapFeedbackQuestionsToCreatePayload,
} from "@/lib/feedbackApi";

import styles from "./FeedbackQuestionSelect.module.css";

type Props = {
  config: FeedbackFormConfig;
  initialArtworkId?: string;
};

export default function FeedbackQuestionSelect({
  config,
  initialArtworkId = "",
}: Props) {
  const ids = useMemo(
    () => config.questions.map((q) => q.id),
    [config.questions]
  );

  const [included, setIncluded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const id of ids) init[id] = true;
    return init;
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdFormId, setCreatedFormId] = useState<string | null>(null);

  const trimmedArtworkId = initialArtworkId.trim();

  const toggleInclude = (id: string, checked: boolean) => {
    setIncluded((prev) => ({ ...prev, [id]: checked }));
    setError("");
    setCreatedFormId(null);
  };

  const selectedQuestions = useMemo(() => {
    return config.questions.filter((q) => included[q.id]);
  }, [config.questions, included]);

  const hasArtworkContext = trimmedArtworkId.length > 0;

  const handleCreate = async () => {
    setError("");
    setCreatedFormId(null);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("Please log in first.");
      return;
    }

    if (!trimmedArtworkId) {
      setError(
        "This step needs an artwork from upload. Use Upload, then you will land here automatically."
      );
      return;
    }

    if (selectedQuestions.length === 0) {
      setError("Select at least one question to include.");
      return;
    }

    const payload = mapFeedbackQuestionsToCreatePayload(selectedQuestions);

    try {
      setSubmitting(true);
      const created = await createFeedbackForm(trimmedArtworkId, payload, token);
      setCreatedFormId(String(created._id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not create form.");
    } finally {
      setSubmitting(false);
    }
  };

  const pageTitle =
    config.selectPageTitle ?? "Choose questions for your feedback form";
  return (
    <div>
      <h1 className={styles.pageTitle}>{pageTitle}</h1>

      <div className={styles.questions}>
        {config.questions.map((q) => (
          <QuestionPreviewRow
            key={q.id}
            q={q}
            included={included[q.id] !== false}
            onIncludedChange={(checked) => toggleInclude(q.id, checked)}
          />
        ))}
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      {createdFormId ? (
        <p className={styles.success} role="status">
          Form created.{" "}
          <Link href={`/feedback?formId=${createdFormId}`}>
            Open feedback page for this form
          </Link>
        </p>
      ) : null}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryBtn}
          disabled={submitting || !hasArtworkContext}
          onClick={handleCreate}
        >
          {submitting ? "Creating…" : "Create feedback form"}
        </button>
      </div>
    </div>
  );
}

function QuestionPreviewRow({
  q,
  included,
  onIncludedChange,
}: {
  q: FeedbackQuestion;
  included: boolean;
  onIncludedChange: (checked: boolean) => void;
}) {
  return (
    <div
      className={`${styles.questionBox} ${!included ? styles.questionBoxMuted : ""}`}
    >
      <div className={styles.includeCol}>
        <label className={styles.includeLabel}>
          <input
            type="checkbox"
            className={styles.includeCheckbox}
            checked={included}
            onChange={(e) => onIncludedChange(e.target.checked)}
            aria-label={`Include: ${q.label}`}
          />
        </label>
      </div>
      <div className={styles.previewCol}>
        <QuestionPreview q={q} />
      </div>
    </div>
  );
}

function QuestionPreview({ q }: { q: FeedbackQuestion }) {
  if (q.type === "rating") {
    return (
      <QuestionField label={q.label} detail={q.detail} required={q.required}>
        <RatingScale
          name={`preview-${q.id}`}
          value=""
          onChange={() => {}}
          min={q.min ?? 1}
          max={q.max ?? 5}
          stepLabels={q.stepLabels}
          disabled
        />
      </QuestionField>
    );
  }

  if (q.type === "checkbox") {
    return (
      <QuestionField label={q.label} detail={q.detail} required={q.required}>
        {q.options.map((opt) => (
          <CheckboxOption
            key={opt.value}
            id={`preview-${q.id}-${opt.value}`}
            name={`preview-${q.id}`}
            value={opt.value}
            label={opt.label}
            checked={false}
            onChange={() => {}}
            disabled
          />
        ))}
      </QuestionField>
    );
  }

  if (q.type === "radio") {
    return (
      <QuestionField label={q.label} detail={q.detail} required={q.required}>
        {q.options.map((opt) => (
          <RadioOption
            key={opt.value}
            id={`preview-${q.id}-${opt.value}`}
            name={`preview-${q.id}`}
            value={opt.value}
            label={opt.label}
            checked={false}
            onChange={() => {}}
            disabled
          />
        ))}
      </QuestionField>
    );
  }

  if (q.type === "text") {
    return (
      <QuestionField label={q.label} detail={q.detail} required={q.required}>
        <textarea
          readOnly
          disabled
          rows={4}
          aria-hidden
          style={{
            width: "100%",
            borderRadius: 12,
            border: "1px solid #c9b297",
            background: "#f5f0e8",
            padding: "0.5rem 0.75rem",
            opacity: 0.85,
          }}
        />
      </QuestionField>
    );
  }

  return null;
}
