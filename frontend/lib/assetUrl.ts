const API_ORIGIN = (process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:5000").replace(/\/+$/, "");

export function resolveBackendAssetUrl(assetPath?: string): string {
  if (!assetPath) return "";
  if (/^https?:\/\//i.test(assetPath)) return assetPath;

  const normalizedPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return `${API_ORIGIN}${normalizedPath}`;
}
