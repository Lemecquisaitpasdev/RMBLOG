"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { EpubError, epubInfo } from "@/lib/epub"
import { bookId, deleteLocalBook, listLocalBooks, saveLocalBook } from "@/lib/local-library"

type Shelved = { id: string; title: string; author: string; cover?: string; percent?: number }

function readPercent(id: string) {
  try {
    const raw = window.localStorage.getItem(`liseuse:appareil:${id}`)
    const percent = raw ? Number(JSON.parse(raw).percent) : NaN
    return Number.isFinite(percent) ? percent : undefined
  } catch {
    return undefined
  }
}

/** L'étagère de l'appareil : les EPUB ouverts ici, gardés dans ce navigateur et nulle part ailleurs. */
export function LocalShelf({ divided = true }: { divided?: boolean }) {
  const router = useRouter()
  const input = React.useRef<HTMLInputElement>(null)
  const [books, setBooks] = React.useState<Shelved[]>([])
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [version, setVersion] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false
    const urls: string[] = []
    listLocalBooks().then((list) => {
      if (cancelled) return
      setBooks(
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

  return (
    <section aria-labelledby="appareil-titre" className={divided ? "mt-14 border-t border-black/15 pt-10" : "mt-12"}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 id="appareil-titre" className="font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-none italic">
            sur cet appareil
          </h2>
          <p className="mt-3 max-w-[60ch] font-mono text-[12px] leading-[1.65] text-black/70">
            Ouvrez un EPUB depuis votre appareil : il s&apos;affiche dans la liseuse, avec sa table des matières, ses notes
            et vos réglages. Le fichier reste dans ce navigateur ; rien n&apos;est envoyé ni publié.
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

      {books.length ? (
        <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
          {books.map((book) => (
            <li key={book.id}>
              <Link href={`/livres/lire?id=${encodeURIComponent(book.id)}`} className="group block outline-none">
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
                  {book.percent !== undefined ? (
                    <span className="absolute inset-x-0 bottom-0 h-1 bg-black/15" aria-hidden>
                      <span className="block h-full bg-black" style={{ width: `${book.percent}%` }} />
                    </span>
                  ) : null}
                </span>
                <span className="mt-4 block font-display text-[1.3rem] leading-tight">{book.title}</span>
                {book.author ? <span className="mt-1 block font-mono text-[12px] text-black/70">{book.author}</span> : null}
                <span className="mt-3 inline-block font-mono text-[11px] tracking-[0.12em] uppercase underline-offset-4 group-hover:underline">
                  {book.percent ? `Reprendre · ${book.percent} %` : "Lire"} →
                </span>
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await deleteLocalBook(book.id)
                  setVersion((v) => v + 1)
                }}
                className="mt-2 block font-mono text-[11px] text-black/55 underline-offset-4 hover:text-black hover:underline"
              >
                Retirer de cet appareil
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
