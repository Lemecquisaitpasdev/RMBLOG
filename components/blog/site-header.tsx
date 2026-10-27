"use client"

import * as React from "react"
import { HeaderTabs } from "@/components/blog/notebook-tabs"
import { Wordmark } from "@/components/blog/wordmark"

/**
 * L'en-tête de free-game.virgilabloh.com : texte d'intro en Courier, logo qui
 * tourne, et les onglets du carnet sur la tranche droite. Collé en haut sur les
 * grands écrans, il s'efface devant les zones plein écran et le pied de page.
 */
export function SiteHeader({ intro, wordmark }: { intro: readonly string[]; wordmark: string }) {
  const ref = React.useRef<HTMLElement>(null)
  const fill = React.useRef<HTMLSpanElement>(null)

  // Hauteur de l'en-tête → --header-h, pour les ancres et les éléments collants.
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // La pilule noire se remplit avec la lecture de la page.
  React.useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (fill.current) fill.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return (
    // Les zones plein écran et le pied de page posent <html data-covered> :
    // l'en-tête se retire pour leur laisser tout l'écran.
    <header
      ref={ref}
      className="z-50 bg-white transition-transform duration-500 ease-[cubic-bezier(.65,0,.2,1)] tall:sticky tall:top-0 tall:[html[data-covered]_&]:-translate-y-full"
    >
      <a
        href="#contenu"
        className="sr-only font-mono text-sm focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-link focus:px-2 focus:py-1 focus:text-white"
      >
        [Aller au contenu]
      </a>
      <div className="grid gap-6 px-3 pt-3 pb-4 lg:grid-cols-2 lg:gap-8">
        <div className="min-w-0">
          <div className="max-w-[78ch] font-mono text-[13px] leading-[1.22] lg:text-[13.5px]">
            {intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="mt-3 flex justify-center">
            <Wordmark text={wordmark} />
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="relative block h-[22px] w-[200px] overflow-hidden rounded-full border-2 border-black" aria-hidden>
              <span ref={fill} className="absolute inset-0 origin-left scale-x-0 rounded-full bg-black" />
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">lecture en cours…</span>
          </div>
        </div>

        <HeaderTabs />
      </div>
    </header>
  )
}
