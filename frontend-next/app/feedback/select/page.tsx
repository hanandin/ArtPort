import { Suspense } from "react";

import feedbackConfig from "@/data/feedback-questions.json";
import type { FeedbackFormConfig } from "@/types/feedback";

import styles from "../feedback.module.css";
import SelectArtworkParam from "./SelectArtworkParam";

const config = feedbackConfig as FeedbackFormConfig;

export default function FeedbackSelectPage() {
  return (
    <main className={styles.main}>
      <Suspense fallback={<p>Loading…</p>}>
        <SelectArtworkParam config={config} />
      </Suspense>
    </main>
  );
}
