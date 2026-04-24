type ApiUserProfileLike = {
  _id?: string;
  username?: string;
  email?: string;
  bio?: string;
  profilePictureUrl?: string;
  bannerPictureUrl?: string;
  showEmailOnProfile?: boolean;
};

export type NormalizedUserProfile = {
  userId?: string;
  username: string;
  email?: string;
  bio: string;
  profilePictureUrl?: string;
  bannerPictureUrl?: string;
  showEmailOnProfile: boolean;
};

export function normalizeUserProfile(
  data: ApiUserProfileLike | null | undefined,
  fallbackUsername = "Artist"
): NormalizedUserProfile {
  return {
    userId: data?._id ? String(data._id) : undefined,
    username: data?.username || fallbackUsername,
    email: data?.email,
    bio: typeof data?.bio === "string" ? data.bio : "",
    profilePictureUrl: data?.profilePictureUrl,
    bannerPictureUrl: data?.bannerPictureUrl,
    showEmailOnProfile: Boolean(data?.showEmailOnProfile),
  };
}
