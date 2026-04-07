import UserProfileClient from "./UserProfileClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/api/users`);

    if (!res.ok) {
      return [{ username: "demo" }];
    }

    const users = (await res.json().catch(() => [])) as Array<{
      username?: string;
    }>;

    const params = users
      .map((user) => user.username?.trim())
      .filter((username): username is string => Boolean(username))
      .map((username) => ({ username }));

    return params.length > 0 ? params : [{ username: "demo" }];
  } catch {
    return [{ username: "demo" }];
  }
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <UserProfileClient usernameParam={username} />;
}
