const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** Gray SVG — used when no artwork URL exists; avoids a single shared JPG users might replace while testing. */
export const FEED_ARTWORK_PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#e5e7eb" width="100%" height="100%"/></svg>'
  );

export function resolveApiAssetUrl(path: string): string {
  const p = path.trim();
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  if (p.startsWith("data:")) return p;
  // Next.js `public/` files load from the app origin — do not send these to the API host
  if (
    p.startsWith("/images/") ||
    p === "/avatar-default.svg" ||
    p.startsWith("/avatar-default")
  ) {
    return p;
  }
  if (p.startsWith("/")) return `${API_URL}${p}`;
  return p;
}

export type ApiArtworkDetail = {
  _id: string;
  slug?: string;
  title?: string;
  description?: string;
  filePath?: string;
  thumbnailPath?: string;
  imageUrl?: string;
  url?: string;
  /** Backend may populate `author` (Express controller) or `userId` (alternate schema). */
  author?:
    | string
    | {
        _id?: string;
        username?: string;
        profilePictureUrl?: string;
      };
  userId?:
    | string
    | {
        _id?: string;
        username?: string;
        profilePictureUrl?: string;
      };
};

export async function fetchArtworkById(
  id: string
): Promise<ApiArtworkDetail | null> {
  const res = await fetch(
    `${API_URL}/api/artworks/${encodeURIComponent(id)}`
  );
  if (!res.ok) return null;
  const data = (await res.json().catch(() => null)) as ApiArtworkDetail | null;
  return data && typeof data === "object" ? data : null;
}

/**
 * Loads a single artwork by its URL segment.
 * Backend only supports GET /api/artworks/:id (Mongo ObjectId),
 * so non-ObjectId segments (e.g. slugs) return null.
 */
export async function fetchArtworkForPost(
  segment: string
): Promise<ApiArtworkDetail | null> {
  const s = segment.trim();
  if (!s) return null;
  if (/^[a-f\d]{24}$/i.test(s)) {
    return fetchArtworkById(s);
  }
  return null;
}

export function artworkDetailImageUrl(a: ApiArtworkDetail): string {
  return (
    a.imageUrl ||
    a.filePath ||
    a.thumbnailPath ||
    a.url ||
    ""
  );
}

export function artworkArtistFromDetail(a: ApiArtworkDetail): {
  name: string;
  avatarUrl?: string;
  userId?: string;
  artistUsername?: string;
} {
  const raw = a.userId ?? a.author;
  if (raw && typeof raw === "object") {
    const u = raw as {
      _id?: string;
      username?: string;
      profilePictureUrl?: string;
    };
    const uname = u.username?.trim();
    return {
      name: uname ? uname : "Artist",
      avatarUrl: u.profilePictureUrl,
      userId: u._id != null ? String(u._id) : undefined,
      artistUsername: uname || undefined,
    };
  }
  return { name: "Artist" };
}
