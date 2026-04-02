const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function resolveApiAssetUrl(path: string): string {
  const p = path.trim();
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
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

export async function fetchArtworkBySlug(
  slug: string
): Promise<ApiArtworkDetail | null> {
  const s = slug.trim();
  if (!s) return null;
  const res = await fetch(
    `${API_URL}/api/artworks/by-slug/${encodeURIComponent(s)}`
  );
  if (!res.ok) return null;
  const data = (await res.json().catch(() => null)) as ApiArtworkDetail | null;
  return data && typeof data === "object" ? data : null;
}

export async function fetchArtworkForPost(
  segment: string
): Promise<ApiArtworkDetail | null> {
  const s = segment.trim();
  if (!s) return null;
  if (/^[a-f\d]{24}$/i.test(s)) {
    return fetchArtworkById(s);
  }
  return fetchArtworkBySlug(s);
}

export function artworkDetailImageUrl(a: ApiArtworkDetail): string {
  return (
    a.imageUrl ||
    a.filePath ||
    a.thumbnailPath ||
    ""
  );
}

export function artworkArtistFromDetail(a: ApiArtworkDetail): {
  name: string;
  avatarUrl?: string;
  userId?: string;
  artistUsername?: string;
} {
  const u = a.userId;
  if (u && typeof u === "object") {
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
