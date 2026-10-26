/**
 * Réglages globaux du blog. Tout ce qui est « à remplacer » est regroupé ici :
 * nom, textes d'accueil, liens sociaux, images du bandeau.
 */
export const site = {
  name: "RMBLOG",
  /** Le mot qui tourne en haut à gauche, suivi d'un ™. */
  wordmark: "RMBLOG",
  author: "RM",
  url: "https://rmblog.example",
  lang: "fr",
  description:
    "Carnet personnel : notes, essais et archives. Un blog mi-rétro (page perso PHP de 2003), mi-futuriste (Next.js).",

  /** Le paragraphe en Courier tout en haut de la page. */
  intro: [
    "Ci-dessous, un carnet ouvert pour les idées encore à leurs premières phases. Il est né en essayant de résumer, au même endroit, les réponses aux questions que je me pose le plus souvent. Le but : apprendre en public, laisser des traces, et ouvrir la porte à celles et ceux qui arrivent par la marge.",
    "Ce carnet est écrit à la main, publié sans algorithme et archivé comme au temps des pages perso en PHP.",
  ],

  /** Le grand titre au pinceau du bandeau d'accueil. */
  heroTitle: "CARNET LIBRE",

  /** Images qui défilent dans le bandeau 3D (TiltedGridHero). */
  heroImages: [
    { src: "/images/hero/318.jpg", alt: "La tour Eiffel en noir et blanc, un oiseau en vol" },
    { src: "/images/hero/101.jpg", alt: "Un bunker de béton sous un ciel vert d'eau" },
    { src: "/images/hero/175.jpg", alt: "Le cadran d'une horloge en noir et blanc" },
    { src: "/images/hero/338.jpg", alt: "Une silhouette encapuchonnée face à la mer" },
    { src: "/images/hero/111.jpg", alt: "Une voiture ancienne garée dans une rue" },
    { src: "/images/hero/447.jpg", alt: "Une personne face à un lac et des montagnes" },
    { src: "/images/hero/494.jpg", alt: "Une ruelle sombre traversée par la lumière" },
    { src: "/images/hero/145.jpg", alt: "La tête d'une guitare en gros plan" },
    { src: "/images/hero/106.jpg", alt: "Des fleurs roses contre un ciel bleu" },
    { src: "/images/hero/514.jpg", alt: "Une maison en bois et un 4x4 blanc" },
  ],

  /** Liens du pied de page. Remplacez les « # » par vos vrais profils. */
  social: [
    { label: "Instagram", href: "#" },
    { label: "GitHub", href: "https://github.com/lemecquisaitpasdev" },
    { label: "Are.na", href: "#" },
  ],
  /** Adresse d'exemple : à remplacer par la vôtre. */
  email: "contact@example.com",
} as const

export type Site = typeof site
