"use client"

import dynamic from "next/dynamic"
import { WhenNear } from "@/components/blog/when-near"
import { dreamImages } from "@/lib/dream"

// three.js ne se charge qu'à l'approche de la section, et jamais côté serveur.
const InfiniteGallery = dynamic(() => import("@/components/ui/3d-gallery-photography"), { ssr: false })

/** La galerie 3D infinie : elle avance toute seule, et plus vite quand on fait défiler la page. */
export function DreamGallery({ className }: { className?: string }) {
  return (
    <WhenNear className={className}>
      <InfiniteGallery images={dreamImages} speed={1.2} visibleCount={12} followPageScroll className="h-full w-full" />
    </WhenNear>
  )
}
