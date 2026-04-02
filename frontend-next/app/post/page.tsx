import Link from "next/link";

export default function PostIndexPage() {
  return (
    <main
      style={{
        padding: 24,
        maxWidth: 560,
        fontFamily: "Inter, sans-serif",
        lineHeight: 1.5,
      }}
    >
      <h1 style={{ fontSize: "1.25rem", marginBottom: 12 }}>Artwork post</h1>
      <p style={{ marginBottom: 8 }}>
        Open a specific piece with its id from the API, for example:
      </p>
      <p style={{ marginBottom: 16 }}>
        <code>/post/&lt;artworkMongoId&gt;</code>
      </p>
      <Link href="/" style={{ fontWeight: 600 }}>
        ← Home
      </Link>
    </main>
  );
}
