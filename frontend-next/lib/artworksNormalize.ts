export function normalizeArtworksList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as { artworks?: unknown[] }).artworks)
  ) {
    return (data as { artworks: unknown[] }).artworks;
  }
  return [];
}

export function artworkImageUrl(raw: Record<string, unknown>): string {
  if (raw == null || typeof raw !== "object") return "";
  const u =
    (raw.imageUrl as string | undefined) ||
    (raw.filePath as string | undefined) ||
    (raw.thumbnailPath as string | undefined) ||
    (raw.url as string | undefined) ||
    (raw.secure_url as string | undefined) ||
    (typeof raw.image === "string" ? raw.image : undefined);
  return typeof u === "string" && u.trim() ? u.trim() : "";
}

export function artistIdFromArtworkRaw(raw: Record<string, unknown>): string | undefined {
  if (raw == null || typeof raw !== "object") return undefined;
  const uid = raw.userId ?? raw.author;
  if (uid == null) return undefined;
  if (typeof uid === "object" && uid !== null && "_id" in uid) {
    const id = (uid as { _id?: unknown })._id;
    if (id != null) return String(id);
  }
  return String(uid);
}
