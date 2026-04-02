import { Suspense } from "react";

import PostPageClient from "./PostPageClient";

export default async function PostPage({
  params,
}: {
  params: Promise<{ artwork: string }>;
}) {
  const { artwork } = await params;
  return (
    <Suspense
      fallback={
        <p style={{ padding: 24, fontFamily: "Inter, sans-serif" }}>Loading…</p>
      }
    >
      <PostPageClient segment={artwork} />
    </Suspense>
  );
}
