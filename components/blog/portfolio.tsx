"use client"

import dynamic from "next/dynamic"
import { WhenNear } from "@/components/blog/when-near"

// Rendu côté client seulement : l'heure d'ouverture fixe la base, et les cours arrivent du navigateur.
const LivePortfolio = dynamic(() => import("@/components/blog/live-portfolio").then((m) => m.LivePortfolio), { ssr: false })

/** Le tableau de bord à 50 000 000 $ : il ne se branche aux marchés qu'à l'approche de l'écran. */
export function Portfolio({ className }: { className?: string }) {
  return (
    <WhenNear className={className}>
      <LivePortfolio />
    </WhenNear>
  )
}
