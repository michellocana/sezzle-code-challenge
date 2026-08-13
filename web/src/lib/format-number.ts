// Trims float64 noise from backend results (e.g. 3.3333333333333335) down
// to a sane number of significant digits for display.
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return String(value)
  return String(Number(value.toPrecision(12)))
}
