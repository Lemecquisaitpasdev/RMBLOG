export type BookChapter = {
  title: string
  /** Un paragraphe par entrée, en texte simple. */
  paragraphs: string[]
  /** Les paragraphes forment une liste (un sommaire). */
  list?: boolean
}

export type Book = {
  slug: string
  title: string
  subtitle?: string
  author: string
  year?: number
  /** Couverture dans public/images/livres/<slug>.jpg, au format d'un livre (2:3). */
  cover?: string
  /** Pourquoi je l'ai aimé, en une ou deux phrases, sous la couverture. */
  note?: string
  /**
   * « Texte intégral » pour un livre libre de droits, « Extraits » pour quelques passages,
   * « Sommaire » pour un livre protégé : son plan, et de quoi ouvrir son propre exemplaire.
   */
  edition: "Texte intégral" | "Extraits" | "Sommaire"
  chapters: BookChapter[]
}

/** Comment lire en entier un livre protégé : avec son propre fichier, qui reste sur l'appareil. */
const ownCopy = (title: string): BookChapter => ({
  title: "Lire le livre en entier",
  paragraphs: [
    `Le texte de ${title} est protégé par le droit d'auteur : il n'est pas publié sur ce carnet.`,
    "Si vous avez le livre en EPUB, ouvrez-le depuis « Mes livres », rubrique « sur cet appareil » : il s'affiche dans cette liseuse, en entier, avec sa table des matières et ses notes. Le fichier reste dans votre navigateur ; rien n'est envoyé.",
  ],
})

/** Les livres que j'ai aimés, dans l'ordre de l'étagère. Chacun s'ouvre dans la liseuse (/livres/<slug>). */
export const books: Book[] = [
  {
    slug: "la-distinction",
    title: "La Distinction",
    subtitle: "Critique sociale du jugement",
    author: "Pierre Bourdieu",
    year: 1979,
    cover: "/images/livres/la-distinction.jpg",
    edition: "Sommaire",
    chapters: [
      {
        title: "Sommaire",
        list: true,
        paragraphs: [
          "Introduction",
          "Première partie — Critique sociale du jugement de goût",
          "1. Titres et quartiers de noblesse culturelle",
          "Deuxième partie — L'économie des pratiques",
          "2. L'espace social et ses transformations",
          "3. L'habitus et l'espace des styles de vie",
          "4. La dynamique des champs",
          "Troisième partie — Goûts de classe et styles de vie",
          "5. Le sens de la distinction",
          "6. La bonne volonté culturelle",
          "7. Le choix du nécessaire",
          "8. Culture et politique",
          "Conclusion — Classes et classements",
          "Post-scriptum — Éléments pour une critique « vulgaire » des critiques « pures »",
          "Annexes",
        ],
      },
      ownCopy("La Distinction"),
    ],
  },
  {
    slug: "rendez-vous-avec-rama",
    title: "Rendez-vous avec Rama",
    author: "Arthur C. Clarke",
    year: 1973,
    cover: "/images/livres/rendez-vous-avec-rama.jpg",
    edition: "Sommaire",
    chapters: [
      {
        title: "Sommaire",
        list: true,
        paragraphs: [
          "Défense spatiale",
          "L'intrus",
          "Rama et Sita",
          "Rendez-vous",
          "Première sortie",
          "La Commission",
          "Deux épouses",
          "Dans le moyeu",
          "Reconnaissance",
          "La descente dans l'obscur",
          "Des hommes, des femmes et des singes",
          "L'escalier des dieux",
          "La plaine de Rama",
          "Avis de tempête",
          "Le bord de la mer",
          "Kealakekua",
          "Printemps",
          "Aube",
          "Un avertissement de Mercure",
          "Le livre de la Révélation",
          "Après la tempête",
          "Sur les flots de la mer cylindrique",
          "N.Y., Rama",
          "Une libellule",
          "Baptême de l'air",
          "La voix de Rama",
          "Le vent électrique",
          "Icare",
          "Premier contact",
          "La fleur",
          "Vitesse limitée",
          "La vague",
          "L'araignée",
          "Au grand regret de Son Excellence…",
          "Courrier exprès",
          "L'observateur de biotes",
          "Missile",
          "Assemblée générale",
          "Décision stratégique",
          "Saboteur",
          "Le héros",
          "Le temple de verre",
          "Retraite",
          "Espace moteur",
          "Phénix",
          "Interlude",
        ].map((title, i) => `${i + 1}. ${title}`),
      },
      ownCopy("Rendez-vous avec Rama"),
    ],
  },
  {
    slug: "belle-du-seigneur",
    title: "Belle du Seigneur",
    author: "Albert Cohen",
    year: 1968,
    cover: "/images/livres/belle-du-seigneur.jpg",
    edition: "Sommaire",
    chapters: [
      {
        title: "Sommaire",
        list: true,
        paragraphs: [
          "Première partie",
          "Deuxième partie",
          "Troisième partie",
          "Quatrième partie",
          "Cinquième partie",
          "Sixième partie",
          "Septième partie",
        ],
      },
      ownCopy("Belle du Seigneur"),
    ],
  },
  {
    slug: "les-freres-karamazov",
    title: "Les Frères Karamazov",
    author: "Fiodor Dostoïevski",
    year: 1880,
    cover: "/images/livres/les-freres-karamazov.jpg",
    edition: "Sommaire",
    chapters: [
      {
        title: "Sommaire",
        list: true,
        paragraphs: [
          "Première partie",
          "Livre I — Histoire d'une famille",
          "Livre II — Une réunion déplacée",
          "Livre III — Les sensuels",
          "Deuxième partie",
          "Livre IV — Les déchirements",
          "Livre V — Pro et contra",
          "Livre VI — Un religieux russe",
          "Troisième partie",
          "Livre VII — Aliocha",
          "Livre VIII — Mitia",
          "Livre IX — L'instruction préparatoire",
          "Quatrième partie",
          "Livre X — Les garçons",
          "Livre XI — Ivan Fiodorovitch",
          "Livre XII — Une erreur judiciaire",
          "Épilogue",
        ],
      },
      ownCopy("Les Frères Karamazov"),
    ],
  },
]

export const getBook = (slug: string) => books.find((book) => book.slug === slug)
