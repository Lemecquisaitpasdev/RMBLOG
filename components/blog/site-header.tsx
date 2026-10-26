"use client"

import * as React from "react"
import Link from "next/link"
import { Wordmark } from "@/components/blog/wordmark"

export type TocItem = { n: number; label: string; href: string }

/**
 * L'en-tête de free-game.virgilabloh.com : texte d'intro en Courier, logo qui
 * tourne, et le sommaire « de A à Z » en bleu. Collé en haut sur les grands
 * écrans, il s'efface quand le pied de page arrive.
 */
export function SiteHeader({ intro, wordmark, items }: { intro: readonly string[]; wordmark: string; items: TocItem[] }) {
  const ref = React.useRef<HTMLElement>(null)
  const fill = React.useRef<HTMLSpanElement>(null)
  const [hidden, setHidden] = React.useState(false)
  const rows = Math.ceil(items.length / 2)

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

  // La pilule rouge se remplit avec la lecture de la page.
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

  // Le pied de page a besoin de tout l'écran : l'en-tête se retire.
  React.useEffect(() => {
    const footer = document.getElementById("site-footer")
    if (!footer) return
    const io = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), { threshold: 0.12 })
    io.observe(footer)
    return () => io.disconnect()
  }, [])

  return (
    <header
      ref={ref}
      data-hidden={hidden}
      className="z-50 bg-white transition-transform duration-500 ease-[cubic-bezier(.65,0,.2,1)] tall:sticky tall:top-0 tall:data-[hidden=true]:-translate-y-full"
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
            <span className="relative block h-[22px] w-[200px] overflow-hidden rounded-full border-2 border-retro-red" aria-hidden>
              <span ref={fill} className="absolute inset-0 origin-left scale-x-0 rounded-full bg-retro-red" />
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">lecture en cours…</span>
          </div>
        </div>

        <nav aria-labelledby="sommaire" className="lg:pt-14">
          <h2 id="sommaire" className="text-center font-sans text-[19px] leading-[1.15] font-bold">
            DE A À Z
            <br />
            (SOMMAIRE)
          </h2>
          <ol
            className="mt-5 grid gap-x-12 font-sans text-[clamp(1rem,1.42vw,1.3rem)] leading-[1.12] font-bold uppercase sm:grid-flow-col sm:grid-rows-[repeat(var(--rows),auto)] lg:mx-auto lg:w-fit"
            style={{ "--rows": rows } as React.CSSProperties}
          >
            {items.map((item) => (
              <li key={item.href} className="flex gap-[0.3em]">
                <span className="w-[2.1ch] shrink-0 text-right text-link tabular-nums">{item.n}.</span>
                <Link href={item.href} className="text-link decoration-2 underline-offset-2 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </header>
  )
}
