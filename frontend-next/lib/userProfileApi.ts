const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type ApiUserProfile = {
  _id?: string;
  username?: string;
  email?: string;
  bio?: string;
  profilePictureUrl?: string;
  bannerPictureUrl?: string;
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

export async function fetchUserProfileByUsername(
  username: string
): Promise<ApiUserProfile | null> {
  const q = username.trim();
  if (!q) return null;
  const res = await fetch(
    `${API_URL}/api/users/by-username/${encodeURIComponent(q)}`
  );
  if (!res.ok) return null;
  const data = (await res.json().catch(() => null)) as ApiUserProfile | null;
  return data && typeof data === "object" ? data : null;
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

export async function patchUserProfile(
  userId: string,
  fields: {
    username?: string;
    email?: string;
    bio?: string;
    bannerPictureUrl?: string;
    profilePicture?: Blob | null;
    bannerPicture?: Blob | null;
  }
): Promise<ApiUserProfile> {
  const fd = new FormData();
  if (fields.username != null) fd.append("username", fields.username);
  if (fields.email != null) fd.append("email", fields.email);
  if (fields.bio != null) fd.append("bio", fields.bio);
  if (fields.bannerPictureUrl != null) {
    fd.append("bannerPictureUrl", fields.bannerPictureUrl);
  }
  if (fields.profilePicture) {
    fd.append("profilePicture", fields.profilePicture, "profile.jpg");
  }
  if (fields.bannerPicture) {
    fd.append("bannerPicture", fields.bannerPicture, "banner.jpg");
  }

  const res = await fetch(
    `${API_URL}/api/users/${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
      body: fd,
    }
  );
  const data = (await res.json().catch(() => ({}))) as {
    message?: string;
  } & ApiUserProfile;

  if (!res.ok) {
    throw new Error(
      typeof data.message === "string" ? data.message : "Profile update failed"
    );
  }

  return data;
}
