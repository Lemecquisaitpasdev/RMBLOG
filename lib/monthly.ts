import type { FerrisWheelItem } from "@/components/ui/ferris-wheel-gallery"

/**
 * Les contenus du mois, sur la grande roue. Une entrée par contenu : l'image va dans
 * public/images/mois/, `discipline` dit ce que c'est (film, album, livre, vidéo…).
 * Tant que la liste est vide, la roue montre des nacelles « à venir ».
 */
export const monthly: { month: string; items: FerrisWheelItem[] } = {
  month: "octobre 2026",
  items: [],
}

/** Ce que la roue affiche : les contenus du mois, ou six nacelles « à venir » en attendant. */
export const wheelItems: FerrisWheelItem[] = monthly.items.length
  ? monthly.items
  : Array.from({ length: 6 }, (_, i) => ({
      id: `a-venir-${i + 1}`,
      src: "/images/mois/a-venir.svg",
      alt: "Contenu à venir",
      title: "À venir",
      discipline: `contenu du mois · ${monthly.month}`,
    }))
