export const APP_BASE_PATH = "";

export function publicAsset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!APP_BASE_PATH) return normalized;
  return `${APP_BASE_PATH}${normalized}`;
}
