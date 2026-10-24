import { createAuthClient } from "better-auth/react";

// Used by client components (sign-in, sign-up, sign-out). With no baseURL it
// talks to /api/auth on whatever address the page was loaded from.
export const authClient = createAuthClient();
