"use client"

import * as React from "react"
import { readLocal, useLocal, writeLocal } from "@/lib/local-store"

const KEY = "rmblog:visites"
// Une seule visite comptée par chargement, même si React monte deux fois en dev.
let counted = false

/**
 * Le compteur de visites façon odomètre. Sans back, il compte honnêtement
 * vos visites à vous, sur cet appareil.
 */
export function HitCounter({ digits = 7 }: { digits?: number }) {
  const stored = useLocal(KEY)

  React.useEffect(() => {
    if (counted) return
    counted = true
    writeLocal(KEY, String(Number(readLocal(KEY) ?? 0) + 1))
  }, [])

  const value = stored == null ? null : Number(stored) || 0
  const shown = value == null ? "-".repeat(digits) : String(value).padStart(digits, "0").slice(-digits)

  return (
    <div className="flex flex-col items-start gap-1">
      <span className="font-mono text-[12px]">Vos visites sur ce carnet :</span>
      <span className="bevel-in inline-flex bg-black p-[3px]" role="img" aria-label={value == null ? "Compteur en cours de chargement" : `${value} visites`}>
        {Array.from(shown).map((d, i) => (
          <span
            key={i}
            className="mx-px grid h-7 w-5 place-items-center bg-gradient-to-b from-[#2a2a2a] via-black to-[#2a2a2a] font-pixel text-[17px] leading-none text-[#ff3030]"
          >
            {d}
          </span>
        ))}
      </span>
      <span className="font-mono text-[11px] text-muted-foreground">(compteur local : le vrai arrivera avec le back)</span>
    </div>
  )
}
