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

  /** Le titre du carnet, en Garamond ; le dernier mot passe en italique. */
  heroTitle: "Carnet libre",
  /** La ligne sous le titre, comme sur la page de garde d'un vieux carnet. */
  dateline: "tenu par RM · ouvert en 2026",

  /** Liens du pied de page. Remplacez les « # » par vos vrais profils. */
  social: [
    { label: "Instagram", href: "#" },
    { label: "GitHub", href: "https://github.com/lemecquisaitpasdev" },
    { label: "Are.na", href: "#" },
    { label: "SoundCloud", href: "https://soundcloud.com/user-869323810" },
  ],
  /** Ma musique : le profil SoundCloud lu dans « Mes œuvres ». */
  soundcloud: "https://soundcloud.com/user-869323810",
  /** Adresse d'exemple : à remplacer par la vôtre. */
  email: "contact@example.com",
} as const

export type Site = typeof site

/** Un onglet du carnet : le menu de l'en-tête et la tranche à droite de l'écran. */
export type NotebookTab = {
  label: string
  href: string
  /** Les sections de la page qui allument l'onglet quand on les lit. */
  sections: readonly string[]
}

export const tabs: NotebookTab[] = [
  { label: "Mes aspirations", href: "/#aspirations", sections: ["aspirations"] },
  { label: "Mes divertissements préférés", href: "/#jeux", sections: ["jeux", "contenus"] },
  { label: "Mes investissements en direct", href: "/#portefeuille", sections: ["portefeuille"] },
  { label: "Mes réflexions", href: "/#benjamins", sections: ["benjamins", "kaaba", "reve"] },
  { label: "Mes œuvres", href: "/#oeuvres", sections: ["oeuvres"] },
  { label: "Mon carnet de pensées", href: "/carnet-de-pensees", sections: ["carnet"] },
  { label: "Mes livres", href: "/livres", sections: ["livres"] },
]
