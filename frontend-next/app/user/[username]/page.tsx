import Link from "next/link";
import { notFound } from "next/navigation";

import UserProfileClient from "./UserProfileClient";
import { apiUrl } from "@/lib/apiConfig";

import styles from "./private-profile.module.css";

type UsernameProfile = {
  username?: string;
  isPrivate?: boolean;
};

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const res = await fetch(apiUrl(`/api/users/by-username/${encodeURIComponent(username)}`), {
    cache: "no-store",
  });

  if (!res.ok) {
    notFound();
  }

  const profile = (await res.json().catch(() => null)) as UsernameProfile | null;

  if (!profile?.username) {
    notFound();
  }

  if (profile.isPrivate) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.kicker}>Private account</p>
          <h1 className={styles.title}>{profile.username}</h1>
          <p className={styles.copy}>
            This account is private.
          </p>
          <Link href="/" className={styles.homeButton}>
            Go home
          </Link>
        </section>
      </main>
    );
  }

  return <UserProfileClient usernameParam={username} />;
}
