import RequireAuth from "@/components/RequireAuth";

import SettingsPageClient from "./SettingsPageClient";

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsPageClient />
    </RequireAuth>
  );
}