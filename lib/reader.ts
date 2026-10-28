import type { Book } from "@/lib/books"

/** Un morceau du livre affiché d'un bloc dans la liseuse : un chapitre, ou un fichier d'un EPUB. */
export type ReaderSection = {
  /** Titre court, sous le curseur et dans la table des matières. */
  title: string
  /** Numéro de chapitre, en tête de page comme sur Kindle (livres du blog). */
  number?: string
  /** Paragraphes simples (livres du blog)… */
  paragraphs?: string[]
  /** …ou contenu déjà nettoyé (EPUB ouvert depuis l'appareil, voir lib/epub.ts). */
  html?: string
  /** Page de titre : couverture, titre et auteur. */
  titlePage?: boolean
  /** Longueur du texte, pour situer la lecture dans tout le livre. */
  chars: number
}

export type ReaderTocEntry = { label: string; depth: number; section: number; anchor?: string }

export type ReaderBook = {
  /** Clé sous laquelle ce navigateur retient la page en cours. */
  key: string
  title: string
  subtitle?: string
  author: string
  year?: number
  cover?: string
  lang: string
  extracts?: boolean
  /** Nombre de pages de l'édition papier, quand le fichier les indique. */
  printPages?: number
  sections: ReaderSection[]
  toc: ReaderTocEntry[]
}

/** Un livre de l'étagère (lib/books.ts) tel que la liseuse le lit. */
export function fromBook(book: Book): ReaderBook {
  return {
    key: book.slug,
    title: book.title,
    subtitle: book.subtitle,
    author: book.author,
    year: book.year,
    cover: book.cover,
    lang: "fr",
    extracts: book.edition === "Extraits",
    sections: [
      { title: book.title, titlePage: true, chars: 0 },
      ...book.chapters.map((chapter, i) => ({
        title: chapter.title,
        number: book.edition === "Sommaire" ? undefined : String(i + 1),
        paragraphs: chapter.paragraphs,
        chars: chapter.paragraphs.reduce((sum, paragraph) => sum + paragraph.length, 0),
      })),
    ],
    toc: book.chapters.map((chapter, i) => ({ label: chapter.title, depth: 0, section: i + 1 })),
  }
}
