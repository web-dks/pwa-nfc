/** RFC 4122 UUID (versions 1–5) in canonical lowercase hex form */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidUuid(text: string): boolean {
  return UUID_REGEX.test(text.trim())
}

export function normalizeUuid(text: string): string {
  return text.trim().toLowerCase()
}
