// Shared cart limits. Kept in their own file (no server-only imports) so both
// server code and client components can use them.
export const MIN_QTY = 1;
export const MAX_QTY = 99;
export const MAX_LINES = 50; // different products allowed in one cart
