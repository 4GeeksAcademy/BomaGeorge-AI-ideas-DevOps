export function requireString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid or missing field: ${field}`);
  }
  return value.trim();
}
