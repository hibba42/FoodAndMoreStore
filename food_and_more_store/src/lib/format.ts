// Display helpers. Prices come from Postgres NUMERIC as strings (e.g. "2.49"),
// so convert only at the edge, when showing them.

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatPrice(price: string | number): string {
  return usd.format(Number(price));
}

// price × quantity, computed in whole cents to avoid floating-point drift.
export function lineTotal(price: string | number, quantity: number): number {
  return (Math.round(Number(price) * 100) * quantity) / 100;
}
