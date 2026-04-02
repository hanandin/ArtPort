import { USER_PATCH_FILE } from "@/lib/serverApiContract";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type ApiUserProfile = {
  _id?: string;
  username?: string;
  email?: string;
  bio?: string;
  profilePictureUrl?: string;
};

export async function fetchUserProfile(
  userId: string
): Promise<ApiUserProfile | null> {
  const res = await fetch(
    `${API_URL}/api/users/${encodeURIComponent(userId)}`
  );
  if (!res.ok) return null;
  const data = (await res.json().catch(() => null)) as ApiUserProfile | null;
  return data && typeof data === "object" ? data : null;
}

/** Resolves a handle using existing GET /api/users (no extra backend route). */
export async function fetchUserProfileByUsername(
  username: string
): Promise<ApiUserProfile | null> {
  const q = username.trim();
  if (!q) return null;
  const res = await fetch(`${API_URL}/api/users`);
  if (!res.ok) return null;
  const list = (await res.json().catch(() => null)) as unknown;
  if (!Array.isArray(list)) return null;
  const lower = q.toLowerCase();
  for (const raw of list) {
    if (!raw || typeof raw !== "object") continue;
    const u = raw as ApiUserProfile;
    if (
      typeof u.username === "string" &&
      u.username.toLowerCase() === lower
    ) {
      return u;
    }
  }
  return null;
}

export async function fetchUserProfileLookup(
  segment: string
): Promise<ApiUserProfile | null> {
  const s = segment.trim();
  if (!s) return null;
  if (/^[a-f\d]{24}$/i.test(s)) {
    return fetchUserProfile(s);
  }
  return fetchUserProfileByUsername(s);
}

/** Returns null when PATCH is not implemented (404/405). */
export async function patchUserProfile(
  userId: string,
  fields: {
    username?: string;
    email?: string;
    bio?: string;
    profilePicture?: Blob | null;
    bannerPicture?: Blob | null;
  }
): Promise<ApiUserProfile | null> {
  const fd = new FormData();
  if (fields.username != null) fd.append("username", fields.username);
  if (fields.email != null) fd.append("email", fields.email);
  if (fields.bio != null) fd.append("bio", fields.bio);
  if (fields.profilePicture) {
    fd.append(
      USER_PATCH_FILE.profilePicture,
      fields.profilePicture,
      "profile.jpg"
    );
  }
  if (fields.bannerPicture) {
    fd.append(
      USER_PATCH_FILE.bannerPicture,
      fields.bannerPicture,
      "banner.jpg"
    );
  }

  const res = await fetch(
    `${API_URL}/api/users/${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
      body: fd,
    }
  );

  if (res.status === 404 || res.status === 405) {
    return null;
  }

  const data = (await res.json().catch(() => ({}))) as {
    message?: string;
  } & ApiUserProfile;

  if (!res.ok) {
    const msg =
      typeof data.message === "string" && data.message.trim()
        ? data.message.trim()
        : `Profile update failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}
