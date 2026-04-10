import { getClientAuthToken } from "@/lib/authSession";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type CurrentUserProfile = {
  _id?: string;
  username?: string;
  email?: string;
  bio?: string;
  profilePictureUrl?: string;
  bannerPictureUrl?: string;
};

export async function fetchCurrentUser(
  token?: string | null
): Promise<CurrentUserProfile | null> {
  const authToken = token || getClientAuthToken();
  const headers: HeadersInit = {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const res = await fetch(`${API_URL}/api/users/me`, {
      headers,
      credentials: "include",
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json().catch(() => null)) as
      | CurrentUserProfile
      | null;
    if (!data || typeof data !== "object") {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}
