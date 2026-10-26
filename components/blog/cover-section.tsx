"use client"

import * as React from "react"

// Ce qui recouvre l'écran en ce moment. Tant qu'il y a quelque chose,
// <html data-covered> fait se retirer l'en-tête collé.
const covering = new Set<string>()

function setCovering(id: string, on: boolean) {
  if (on) covering.add(id)
  else covering.delete(id)
  document.documentElement.toggleAttribute("data-covered", covering.size > 0)
}

type CoverSectionProps = React.HTMLAttributes<HTMLElement> & {
  id: string
  /** Part de l'élément visible à partir de laquelle l'en-tête se retire. */
  threshold?: number
  as?: "section" | "div"
}

/** Une zone qui prend tout l'écran : l'en-tête s'efface quand elle est là. */
export function CoverSection({ id, threshold = 0.5, as = "section", children, ...props }: CoverSectionProps) {
  const ref = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setCovering(id, entry.isIntersecting && entry.intersectionRatio >= threshold),
      { threshold: [0, threshold, 1] },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      setCovering(id, false)
    }
  }, [id, threshold])

  return React.createElement(as, { ref, id, ...props }, children)
}
