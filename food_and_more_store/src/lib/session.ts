import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./auth";

// The signed-in user's session, or null. Wrapped in cache() so the header and
// the page share one lookup per request.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});
