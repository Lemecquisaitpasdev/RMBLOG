import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

/**
 * Le filtre SVG qui donne l'effet « pinceau sec » : bords tremblés
 * (feDisplacementMap) et stries horizontales (bruit étiré en Y).
 * À poser une seule fois dans la page ; la classe `.brush` y fait référence.
 */
export function BrushFilter() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id="brush" x="-10%" y="-20%" width="120%" height="140%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" result="warp" />
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="5" xChannelSelector="R" yChannelSelector="G" result="rough" />
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.16" numOctaves="3" seed="11" result="streaks" />
        <feColorMatrix
          in="streaks"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -9 0 0 0 6.6"
          result="dry"
        />
        <feComposite in="rough" in2="dry" operator="in" />
      </filter>
    </svg>
  )
}

type BrushProps = {
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3"
  /** Se peint de gauche à droite en entrant dans l'écran. */
  reveal?: boolean
} & HTMLAttributes<HTMLElement>

/** Du texte au pinceau, façon lettrage à la main. */
export function Brush({ as: Tag = "span", reveal = true, className, ...props }: BrushProps) {
  return <Tag className={cn("brush block uppercase", reveal && "brush-reveal", className)} {...props} />
}
