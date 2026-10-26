/** Petites fonctions de mise en forme, sans dépendance (utilisables côté client). */

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]

/** « 2026-10-20 » → « 20/10/2026 ». */
export function formatShort(iso: string) {
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

/** « 2026-10-20 » → « 20 octobre 2026 ». */
export function formatLong(iso: string) {
  const [y, m, d] = iso.split("-")
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`
}

/** Le numéro sur deux chiffres : 3 → « 03 ». */
export function pad(n: number) {
  return String(n).padStart(2, "0")
}
