// Only allow redirects to paths on this site ("/checkout"), never to other
// sites ("//evil.example" or "https://evil.example"): an "open redirect".
export function safeNextPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
