import type { Metadata } from "next"
import { DeviceReaderClient } from "@/components/blog/reader-client"
import { readerFonts } from "../fonts"

export const metadata: Metadata = {
  title: "Liseuse",
  description: "Un livre ouvert depuis cet appareil.",
  robots: { index: false },
}

/** Un EPUB gardé dans ce navigateur, ouvert dans la liseuse : le fichier ne quitte pas l'appareil. */
export default function Lire() {
  return (
    <div className={readerFonts}>
      <DeviceReaderClient />
    </div>
  )
}
