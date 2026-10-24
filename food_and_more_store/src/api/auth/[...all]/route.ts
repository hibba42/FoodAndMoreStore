import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// One catch-all route serves every auth endpoint (sign-in, sign-up, sign-out,
// session lookup, ...) and applies Better Auth's built-in rate limiting.
export const { GET, POST } = toNextJsHandler(auth);
