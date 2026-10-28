"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Book } from "@/lib/books"
import { EpubError, epubInfo } from "@/lib/epub"
import { bookId, deleteLocalBook, listLocalBooks, saveLocalBook } from "@/lib/local-library"

export type ShelfBook = Omit<Book, "chapters">
type LocalCopy = { id: string; title: string; author: string; cover?: string; percent?: number }

function readPercent(id: string) {
  try {
    const raw = window.localStorage.getItem(`liseuse:appareil:${id}`)
    const percent = raw ? Number(JSON.parse(raw).percent) : NaN
    return Number.isFinite(percent) ? percent : undefined
  } catch {
    return undefined
  }
}

/** « La distinction » et « La Distinction » désignent le même livre. */
const same = (a: string, b: string) => {
  const norm = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
  return norm(a) === norm(b)
}

function Cover({ title, author, cover, percent }: { title: string; author: string; cover?: string; percent?: number }) {
  return (
    <span className="relative block aspect-[2/3] overflow-hidden rounded-r-[6px] rounded-l-[2px] bg-white shadow-[0_22px_40px_-24px_rgba(0,0,0,.65),inset_6px_0_8px_-6px_rgba(0,0,0,.35)] transition-transform duration-300 group-hover:-translate-y-1.5 group-focus-visible:ring-2 group-focus-visible:ring-black">
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt={`Couverture de ${title}`} className="size-full object-cover" />
      ) : (
        <span className="flex size-full flex-col justify-between border border-black/15 p-4 text-left">
          <span className="font-display text-[1.35rem] leading-tight">{title}</span>
          <span className="font-mono text-[11px] tracking-[0.1em] text-black/60 uppercase">{author}</span>
        </span>
      )}
      {percent !== undefined ? (
        <span className="absolute inset-x-0 bottom-0 h-1 bg-black/15" aria-hidden>
          <span className="block h-full bg-black" style={{ width: `${percent}%` }} />
        </span>
      ) : null}
    </span>
  )
}

const grid = "grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5"

/**
 * L'étagère : les livres que j'ai aimés, puis ceux ouverts depuis l'appareil. Quand un livre de
 * l'étagère a été ouvert ici en EPUB, sa couverture mène à cet exemplaire, lu en entier.
 */
export function BookShelf({ books }: { books: ShelfBook[] }) {
  const router = useRouter()
  const input = React.useRef<HTMLInputElement>(null)
  const [copies, setCopies] = React.useState<LocalCopy[]>([])
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [version, setVersion] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false
    const urls: string[] = []
    listLocalBooks().then((list) => {
      if (cancelled) return
      setCopies(
        list.map((book) => {
          const cover = book.cover ? URL.createObjectURL(book.cover) : undefined
          if (cover) urls.push(cover)
          return { id: book.id, title: book.title, author: book.author, cover, percent: readPercent(book.id) }
        }),
      )
    })
    return () => {
      cancelled = true
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [version])

  const open = async (file: File) => {
    setBusy(true)
    setError(null)
    try {
      const info = await epubInfo(file)
      const id = bookId(file)
      await saveLocalBook({
        id,
        title: info.title ?? file.name.replace(/\.epub$/i, ""),
        author: info.author ?? "",
        cover: info.cover,
        file,
        added: Date.now(),
      })
      router.push(`/livres/lire?id=${encodeURIComponent(id)}`)
    } catch (e) {
      setError(e instanceof EpubError ? e.message : "Ce fichier n'a pas pu être ouvert.")
      setBusy(false)
    }
  }

  const copyOf = (book: ShelfBook) => copies.find((copy) => same(copy.title, book.title))
  const others = copies.filter((copy) => !books.some((book) => same(copy.title, book.title)))
  const remove = async (id: string) => {
    await deleteLocalBook(id)
    setVersion((v) => v + 1)
  }

  return (
    <>
      {books.length ? (
        <ul className={`mt-12 ${grid}`}>
          {books.map((book) => {
            const copy = copyOf(book)
            return (
              <li key={book.slug}>
                <Link href={copy ? `/livres/lire?id=${encodeURIComponent(copy.id)}` : `/livres/${book.slug}`} className="group block outline-none">
                  <Cover title={book.title} author={book.author} cover={book.cover} percent={copy?.percent} />
                  <span className="mt-4 block font-display text-[1.3rem] leading-tight">{book.title}</span>
                  {book.subtitle ? <span className="mt-0.5 block font-display text-[1.05rem] leading-tight italic">{book.subtitle}</span> : null}
                  <span className="mt-1 block font-mono text-[12px] text-black/70">
                    {book.author}
                    {book.year ? ` · ${book.year}` : ""}
                  </span>
                  {book.note ? <span className="mt-2 block text-[13px] leading-snug text-black/75">{book.note}</span> : null}
                  <span className="mt-3 inline-block font-mono text-[11px] tracking-[0.12em] uppercase underline-offset-4 group-hover:underline">
                    {copy ? (copy.percent ? `Reprendre · ${copy.percent} %` : "Lire · mon exemplaire") : `Ouvrir · ${book.edition.toLowerCase()}`} →
                  </span>
                </Link>
                {copy ? (
                  <button
                    type="button"
                    onClick={() => remove(copy.id)}
                    className="mt-2 block text-left font-mono text-[11px] text-black/55 underline-offset-4 hover:text-black hover:underline"
                  >
                    Retirer mon exemplaire de cet appareil
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}

      <section aria-labelledby="appareil-titre" className="mt-16 border-t border-black/15 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="appareil-titre" className="font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-none italic">
              sur cet appareil
            </h2>
            <p className="mt-3 max-w-[60ch] font-mono text-[12px] leading-[1.65] text-black/70">
              Ouvrez un EPUB depuis votre appareil : il s&apos;affiche en entier dans la liseuse, avec sa table des
              matières, ses notes et vos réglages. Le fichier reste dans ce navigateur ; rien n&apos;est envoyé ni publié.
            </p>
          </div>
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className="bg-black px-5 py-3 font-mono text-[12px] tracking-[0.12em] text-white uppercase transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {busy ? "Ouverture…" : "Ouvrir un EPUB"}
          </button>
          <input
            ref={input}
            type="file"
            accept=".epub,application/epub+zip"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ""
              if (file) void open(file)
            }}
          />
        </div>
        {error ? (
          <p className="mt-4 font-mono text-[12px] text-black" role="alert">
            {error}
          </p>
        ) : null}

        {others.length ? (
          <ul className={`mt-10 ${grid}`}>
            {others.map((copy) => (
              <li key={copy.id}>
                <Link href={`/livres/lire?id=${encodeURIComponent(copy.id)}`} className="group block outline-none">
                  <Cover title={copy.title} author={copy.author} cover={copy.cover} percent={copy.percent} />
                  <span className="mt-4 block font-display text-[1.3rem] leading-tight">{copy.title}</span>
                  {copy.author ? <span className="mt-1 block font-mono text-[12px] text-black/70">{copy.author}</span> : null}
                  <span className="mt-3 inline-block font-mono text-[11px] tracking-[0.12em] uppercase underline-offset-4 group-hover:underline">
                    {copy.percent ? `Reprendre · ${copy.percent} %` : "Lire"} →
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => remove(copy.id)}
                  className="mt-2 block text-left font-mono text-[11px] text-black/55 underline-offset-4 hover:text-black hover:underline"
                >
                  Retirer de cet appareil
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </>
  )
}
