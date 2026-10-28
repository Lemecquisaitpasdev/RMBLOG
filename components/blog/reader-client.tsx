"use client"

import dynamic from "next/dynamic"
import type { Book } from "@/lib/books"

// La liseuse lit ses réglages dans le navigateur et mesure l'écran : elle ne se rend que côté client.
const KindleReader = dynamic(() => import("@/components/blog/kindle-reader").then((m) => m.KindleReader), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-[70] bg-white" aria-hidden />,
})

export function ReaderClient({ book }: { book: Book }) {
  return <KindleReader book={book} />
}
