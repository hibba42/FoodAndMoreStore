export const MIN_AGE = 21;

// Newest birth date (YYYY-MM-DD) that is still old enough, as of today (UTC).
function latestAllowedBirthDate(): string {
  const now = new Date();
  const limit = new Date(
    Date.UTC(now.getUTCFullYear() - MIN_AGE, now.getUTCMonth(), now.getUTCDate())
  );
  return limit.toISOString().slice(0, 10);
}

// Returns an error message, or null if the value is acceptable.
// ageRestricted=true: a date is required and the person must be 21+.
// ageRestricted=false: the date is optional, but if given it must be real.
export function checkBirthDate(value: string, ageRestricted: boolean): string | null {
  if (!value) {
    return ageRestricted ? "Date of birth is required for age-restricted items." : null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Enter a valid date.";

  const parsed = new Date(`${value}T00:00:00Z`);
  const today = new Date().toISOString().slice(0, 10);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value ||
    value < "1900-01-01" ||
    value > today
  ) {
    return "Enter a valid date.";
  }
  if (ageRestricted && value > latestAllowedBirthDate()) {
    return `You must be ${MIN_AGE} or older to order these items.`;
  }
  return null;
}

// Drizzle returns DATE columns as "YYYY-MM-DD" strings, but be defensive.
export function toDateInputValue(value: string | Date | null | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}
