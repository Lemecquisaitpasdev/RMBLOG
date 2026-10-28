export type BookChapter = {
  title: string
  /** Un paragraphe par entrée, en texte simple. */
  paragraphs: string[]
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
        paragraphs: [
          "Introduction.",
          "Première partie — Critique sociale du jugement de goût : 1. Titres et quartiers de noblesse culturelle.",
          "Deuxième partie — L'économie des pratiques : 2. L'espace social et ses transformations ; 3. L'habitus et l'espace des styles de vie ; 4. La dynamique des champs.",
          "Troisième partie — Goûts de classe et styles de vie : 5. Le sens de la distinction ; 6. La bonne volonté culturelle ; 7. Le choix du nécessaire ; 8. Culture et politique.",
          "Conclusion — Classes et classements.",
          "Post-scriptum — Éléments pour une critique « vulgaire » des critiques « pures ».",
          "Annexes.",
        ],
      },
      ownCopy("La Distinction"),
    ],
  },
]

export const getBook = (slug: string) => books.find((book) => book.slug === slug)
