import type { Metadata } from "next"
import { BookShelf } from "@/components/blog/book-shelf"
import { books } from "@/lib/books"

export const metadata: Metadata = {
  title: "Mes livres",
  description: "Les livres que j'ai aimés, à lire comme sur une liseuse.",
  alternates: { canonical: "/livres" },
}

/** L'étagère : les livres que j'ai aimés, puis ceux ouverts depuis l'appareil ; chacun s'ouvre dans la liseuse. */
export default function Livres() {
  return (
    <section id="livres" aria-labelledby="livres-titre" className="bg-paper px-4 pt-14 pb-24 text-black sm:px-8 lg:pt-20">
      <div className="mx-auto max-w-[1320px]">
        <h1
          id="livres-titre"
          className="font-sans text-[clamp(2rem,4vw,3.6rem)] leading-[1.08] font-bold tracking-[-0.02em] text-white uppercase"
        >
          <span className="bg-black px-2 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">Mes livres</span>
        </h1>
        <p className="mt-3 font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-none italic">les livres que j&apos;ai aimés</p>

        {/* L'étagère n'emporte que la fiche de chaque livre, pas son texte. */}
        <BookShelf
          books={books.map(({ slug, title, subtitle, author, year, cover, note, edition }) => ({ slug, title, subtitle, author, year, cover, note, edition }))}
        />
      </div>
    </section>
  )
}
