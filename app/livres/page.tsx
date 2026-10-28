import type { Metadata } from "next"
import Link from "next/link"
import { books } from "@/lib/books"

export const metadata: Metadata = {
  title: "Mes livres",
  description: "Les livres que j'ai aimés, à lire comme sur une liseuse.",
  alternates: { canonical: "/livres" },
}

/** L'étagère : les livres que j'ai aimés ; chacun s'ouvre dans la liseuse. */
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

        {books.length ? (
          <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
            {books.map((book) => (
              <li key={book.slug}>
                <Link href={`/livres/${book.slug}`} className="group block outline-none">
                  <span className="relative block aspect-[2/3] overflow-hidden rounded-r-[6px] rounded-l-[2px] bg-white shadow-[0_22px_40px_-24px_rgba(0,0,0,.65),inset_6px_0_8px_-6px_rgba(0,0,0,.35)] transition-transform duration-300 group-hover:-translate-y-1.5 group-focus-visible:ring-2 group-focus-visible:ring-black">
                    {book.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={book.cover} alt={`Couverture de ${book.title}`} className="size-full object-cover" />
                    ) : (
                      <span className="flex size-full flex-col justify-between border border-black/15 p-4 text-left">
                        <span className="font-display text-[1.35rem] leading-tight">{book.title}</span>
                        <span className="font-mono text-[11px] tracking-[0.1em] text-black/60 uppercase">{book.author}</span>
                      </span>
                    )}
                  </span>
                  <span className="mt-4 block font-display text-[1.3rem] leading-tight">{book.title}</span>
                  <span className="mt-1 block font-mono text-[12px] text-black/70">
                    {book.author}
                    {book.year ? ` · ${book.year}` : ""}
                  </span>
                  {book.note ? <span className="mt-2 block text-[13px] leading-snug text-black/75">{book.note}</span> : null}
                  <span className="mt-3 inline-block font-mono text-[11px] tracking-[0.12em] uppercase underline-offset-4 group-hover:underline">
                    Lire · {book.edition.toLowerCase()} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-12 max-w-[52ch] font-mono text-[13px] leading-[1.6] text-black/70">
            L&apos;étagère attend son premier livre.
          </p>
        )}
      </div>
    </section>
  )
}
