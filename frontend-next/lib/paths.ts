/**
 * Must match `basePath` in `next.config.ts`:
 * - Local dev: keep `basePath` commented out in next.config → use "" here.
 * - GitHub Pages: uncomment `basePath: "/ArtPort"` → set to "/ArtPort" here.
 */
export const APP_BASE_PATH = "";

export function publicAsset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!APP_BASE_PATH) return normalized;
  return `${APP_BASE_PATH}${normalized}`;
}
