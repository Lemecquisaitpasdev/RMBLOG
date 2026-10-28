import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ReaderClient } from "@/components/blog/reader-client"
import { books, getBook } from "@/lib/books"
import { readerFonts } from "../fonts"

export function generateStaticParams() {
  // Cache Components veut au moins une page à préparer : tant que l'étagère est vide, une adresse qui mène au 404.
  return books.length ? books.map((book) => ({ slug: book.slug })) : [{ slug: "a-venir" }]
}

export async function generateMetadata({ params }: PageProps<"/livres/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const book = getBook(slug)
  if (!book) return {}
  return {
    title: `${book.title} — ${book.author}`,
    description: book.note ?? `${book.title}, de ${book.author}, dans la liseuse.`,
    alternates: { canonical: `/livres/${book.slug}` },
  }
}

/** Un livre ouvert dans la liseuse, plein écran. */
export default async function Livre({ params }: PageProps<"/livres/[slug]">) {
  const { slug } = await params
  const book = getBook(slug)
  if (!book) notFound()
  return (
    <div className={readerFonts}>
      <ReaderClient book={book} />
    </div>
  )
}
