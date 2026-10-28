export type BookChapter = {
  title: string
  /** Un paragraphe par entrée, en texte simple. */
  paragraphs: string[]
}

export type Book = {
  slug: string
  title: string
  author: string
  year?: number
  /** Couverture dans public/images/livres/<slug>.jpg, au format d'un livre (2:3). */
  cover?: string
  /** Pourquoi je l'ai aimé, en une ou deux phrases, sous la couverture. */
  note?: string
  /** « Texte intégral » pour un livre libre de droits, « Extraits » sinon. */
  edition: "Texte intégral" | "Extraits"
  chapters: BookChapter[]
}

/** Les livres que j'ai aimés, dans l'ordre de l'étagère. Chacun s'ouvre dans la liseuse (/livres/<slug>). */
export const books: Book[] = []

export const getBook = (slug: string) => books.find((book) => book.slug === slug)
