// Only accept plain positive whole numbers that fit in a Postgres INTEGER
// (up to 9 digits), so junk like "abc" or "99999999999" in a URL becomes a clean
// 404 instead of a database error.
export function parseId(raw: string): number | null {
  if (!/^\d{1,9}$/.test(raw)) return null;
  const id = Number(raw);
  return id > 0 ? id : null;
}
