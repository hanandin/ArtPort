"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ padding: 24, fontFamily: "Inter, sans-serif" }}>
      <p style={{ color: "#b91c1c" }}>Something went wrong.</p>
      <button onClick={reset} style={{ marginTop: 12 }}>
        Try again
      </button>
    </div>
  );
}
