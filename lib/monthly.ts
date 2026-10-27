import type { FerrisWheelItem } from "@/components/ui/ferris-wheel-gallery"

/**
 * Les contenus du mois, sur la grande roue. Une entrée par contenu : l'image va dans
 * public/images/mois/, `discipline` dit ce que c'est (film, album, livre, vidéo…).
 * Tant que la liste est vide, la section n'apparaît pas sur la page.
 */
export const monthly: { month: string; items: FerrisWheelItem[] } = {
  month: "octobre 2026",
  items: [],
}
