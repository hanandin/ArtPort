/**
 * Search API — maps backend `/api/search/*` responses to UI result items.
 * Env: NEXT_PUBLIC_API_URL. Backend routes (reference): GET /api/search/users, GET /api/search/artworks
 *
 * This helper never throws: if the backend is down, CORS blocks, or the response is not OK,
 * it returns an empty array so the search bar stays usable in frontend-only mode.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type SearchResultArtist = {
  id: string;
  type: "artist";
  username: string;
  profilePictureUrl?: string;
  handle?: string;
};

export type SearchResultArtwork = {
  id: string;
  type: "artwork";
  title: string;
  artworkImageUrl: string;
  /** Pretty /post/:slug when backend sends it */
  slug?: string;
  artistUsername?: string;
  artistProfilePictureUrl?: string;
  /** When API sends owner id, search can link to their profile */
  artistUserId?: string;
};

export type SearchResultItem = SearchResultArtist | SearchResultArtwork;

type ApiUserHit = {
  _id: string;
  username?: string;
  profilePictureUrl?: string;
};

type ApiArtworkHit = {
  _id: string;
  title?: string;
  slug?: string;
  filePath?: string;
  thumbnailPath?: string;
  userId?: string | { _id?: string };
  userDetails?: { username?: string; profilePictureUrl?: string };
};

/**
 * Fetches search results from the backend. `filter` matches SearchBar UI: "Title" | "Artist".
 * Never throws — returns [] when the request fails or the backend is unavailable.
 */
export async function fetchSearchResults(
  query: string,
  filter: string
): Promise<SearchResultItem[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const isArtist = filter.toLowerCase() === "artist";
    const url = isArtist
      ? `${API_URL}/api/search/users?query=${encodeURIComponent(q)}`
      : `${API_URL}/api/search/artworks?query=${encodeURIComponent(q)}`;

    const res = await fetch(url, { headers });

    const data = (await res.json().catch(() => ({}))) as {
      message?: string;
      results?: unknown[];
    };

    if (!res.ok) {
      return [];
    }

    const raw = Array.isArray(data.results) ? data.results : [];

    if (isArtist) {
      return (raw as ApiUserHit[]).map((u) => ({
        id: String(u._id),
        type: "artist" as const,
        username: u.username?.trim() ? u.username : "Unknown",
        profilePictureUrl: u.profilePictureUrl,
      }));
    }

    return (raw as ApiArtworkHit[]).map((a) => {
      let artistUserId: string | undefined;
      if (a.userId != null) {
        artistUserId =
          typeof a.userId === "object" && a.userId !== null && "_id" in a.userId
            ? String((a.userId as { _id: string })._id)
            : String(a.userId);
      }
      return {
        id: String(a._id),
        type: "artwork" as const,
        title: a.title?.trim() ? a.title : "Untitled",
        artworkImageUrl: a.thumbnailPath || a.filePath || "",
        slug: typeof a.slug === "string" && a.slug.trim() ? a.slug : undefined,
        artistUsername: a.userDetails?.username,
        artistProfilePictureUrl: a.userDetails?.profilePictureUrl,
        artistUserId,
      };
    });
  } catch {
    return [];
  }
}
