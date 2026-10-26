import type { CSSProperties } from "react"

/** Le bandeau défilant, l'équivalent CSS d'une balise <marquee>. */
export function Marquee({ items }: { items: string[] }) {
  const line = items.map((item) => `+++ ${item} `).join("")
  return (
    <div className="overflow-hidden border-y-2 border-black bg-black py-2 text-white" role="marquee" aria-label={items.join(". ")}>
      <div
        className="animate-marquee flex w-max font-mono text-[14px] font-bold whitespace-nowrap uppercase hover:[animation-play-state:paused]"
        style={{ "--marquee-duration": `${Math.max(30, line.length / 6)}s` } as CSSProperties}
        aria-hidden
      >
        <span className="pr-2">{line}</span>
        <span className="pr-2">{line}</span>
      </div>
    </div>
  )
}
