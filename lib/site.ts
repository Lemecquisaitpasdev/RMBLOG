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

export type TocItem = { n: number; label: string; href: string }

/**
 * Le sommaire « De A à Z » de l'en-tête. Vide pour l'instant : ajoutez une
 * entrée par ligne, par exemple { n: 1, label: "Mon article", href: "/articles/mon-article" }.
 */
export const toc: TocItem[] = []
