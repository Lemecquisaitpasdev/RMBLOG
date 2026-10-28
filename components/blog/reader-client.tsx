"use client"

import dynamic from "next/dynamic"
import type { ReaderBook } from "@/lib/reader"

const Blank = () => <div className="fixed inset-0 z-[70] bg-paper" aria-hidden />

// La liseuse lit ses réglages dans le navigateur et mesure l'écran : elle ne se rend que côté client.
const KindleReader = dynamic(() => import("@/components/blog/kindle-reader").then((m) => m.KindleReader), {
  ssr: false,
  loading: Blank,
})
const DeviceReader = dynamic(() => import("@/components/blog/device-reader").then((m) => m.DeviceReader), {
  ssr: false,
  loading: Blank,
})

export function ReaderClient({ book }: { book: ReaderBook }) {
  return <KindleReader book={book} />
}

/** Un EPUB ouvert depuis l'appareil (voir local-shelf.tsx). */
export function DeviceReaderClient() {
  return <DeviceReader />
}
