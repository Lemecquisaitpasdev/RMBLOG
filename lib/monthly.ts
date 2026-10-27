import type { FerrisWheelItem } from "@/components/ui/ferris-wheel-gallery"

/**
 * Les contenus du mois, sur la grande roue. Une entrée par contenu : l'image va dans
 * public/images/mois/, `discipline` dit ce que c'est (film, album, livre, vidéo…).
 * Tant que la liste est vide, la roue montre des nacelles « à venir ».
 */
export const monthly: { month: string; items: FerrisWheelItem[] } = {
  month: "octobre 2026",
  items: [
    {
      id: "finis-les",
      src: "/images/mois/finis-les.jpg",
      alt: "Pochette de FINIS-LES : le dos nu d'un homme, une chaîne au cou, le titre en lettres rouges",
      title: "FINIS-LES",
      discipline: "Album de La Fève · mention spéciale au son « GOULAG »",
      year: "23 octobre 2026",
      link: { href: "https://www.deezer.com/album/1119476772", label: "Écouter sur Deezer" },
    },
    {
      id: "ramdane-touhami",
      src: "/images/mois/ramdane-touhami.jpg",
      alt: "Miniature : Ramdane Touhami en interview sur un plateau rouge, « L'histoire de sa vie, quitter la France, Mediapart »",
      title: "Ramdane Touhami : de clochard à vendre sa boîte à LVMH",
      discipline: "Vidéo · État de la Culture",
      link: { href: "https://www.youtube.com/watch?v=mdOwWq7cPy8&t=5732s", label: "Regarder sur YouTube" },
    },
    {
      id: "la-grande-renaissance",
      src: "/images/mois/la-grande-renaissance.jpg",
      alt: "Miniature : Idriss Aberkane sur scène, à côté d'un grand cercle titré « La Grande Renaissance »",
      title: "La Grande Renaissance",
      discipline: "Conférence · Idriss J. Aberkane",
      link: { href: "https://www.youtube.com/watch?v=yh6xJttEu0o", label: "Regarder sur YouTube" },
    },
  ],
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
