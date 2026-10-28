"use client"

import * as React from "react"
import Link from "next/link"
import { KindleReader } from "@/components/blog/kindle-reader"
import { EpubError, readEpub } from "@/lib/epub"
import { getLocalBook } from "@/lib/local-library"
import type { ReaderBook } from "@/lib/reader"

type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; book: ReaderBook }

/** Rouvre un livre gardé dans ce navigateur (/livres/lire?id=…) et le donne à la liseuse. */
export function DeviceReader() {
  const [state, setState] = React.useState<State>({ status: "loading" })

  React.useEffect(() => {
    let cancelled = false
    let urls: string[] = []
    const id = new URLSearchParams(window.location.search).get("id")
    ;(async () => {
      const stored = id ? await getLocalBook(id) : undefined
      if (!stored) throw new EpubError("Ce livre n'est pas sur cet appareil : rouvrez le fichier depuis « Mes livres ».")
      const result = await readEpub(stored.file, `appareil:${stored.id}`, stored.title)
      if (cancelled) {
        result.urls.forEach((url) => URL.revokeObjectURL(url))
        return
      }
      urls = result.urls
      setState({ status: "ready", book: result.book })
    })().catch((error: unknown) => {
      if (!cancelled) setState({ status: "error", message: error instanceof EpubError ? error.message : "Ce livre n'a pas pu s'ouvrir." })
    })
    return () => {
      cancelled = true
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  if (state.status === "ready") return <KindleReader book={state.book} />
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-paper px-6 text-center text-black">
      {state.status === "loading" ? (
        <p className="font-mono text-[12px] tracking-[0.12em] uppercase" role="status">
          Ouverture du livre…
        </p>
      ) : (
        <div className="max-w-[44ch]">
          <p className="font-display text-[1.6rem] leading-tight italic">{state.message}</p>
          <Link href="/livres" className="mt-6 inline-block font-mono text-[12px] tracking-[0.12em] uppercase underline underline-offset-4">
            ← Mes livres
          </Link>
        </div>
      )}
    </div>
  )
}
