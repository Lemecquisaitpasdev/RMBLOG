"use client"

import Image from "next/image"
import * as React from "react"
import type { Painting } from "@/lib/works"

const roman = (n: number) =>
  [
    ["L", 50],
    ["XL", 40],
    ["X", 10],
    ["IX", 9],
    ["V", 5],
    ["IV", 4],
    ["I", 1],
  ].reduce((out, [glyph, value]) => {
    let s = out
    while (n >= (value as number)) {
      s += glyph
      n -= value as number
    }
    return s
  }, "")
const ROMAN = Array.from({ length: 60 }, (_, i) => roman(i + 1))

type WorksGalleryProps = {
  paintings: (Painting & { ready: boolean })[]
  className?: string
}

/**
 * La cimaise : les tableaux défilent de côté, un par un, avec leur cartel.
 * Un clic ouvre le tableau en grand ; Échap ou un clic à côté le referme.
 */
export function WorksGallery({ paintings, className }: WorksGalleryProps) {
  const track = React.useRef<HTMLOListElement>(null)
  const dialog = React.useRef<HTMLDialogElement>(null)
  const [current, setCurrent] = React.useState(0)
  const [open, setOpen] = React.useState<number | null>(null)
  const last = paintings.length - 1

  // Le tableau le plus proche du centre de la cimaise (plusieurs tableaux verticaux tiennent à l'écran à la fois).
  React.useEffect(() => {
    const el = track.current
    if (!el) return
    let frame = 0
    const update = () => {
      frame = 0
      const middle = el.scrollLeft + el.clientWidth / 2
      let best = 0
      let distance = Infinity
      Array.from(el.children as HTMLCollectionOf<HTMLElement>).forEach((item, i) => {
        const d = Math.abs(item.offsetLeft + item.offsetWidth / 2 - middle)
        if (d < distance) {
          distance = d
          best = i
        }
      })
      setCurrent(best)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      el.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  const go = (i: number) => {
    const el = track.current
    const item = el?.children[Math.max(0, Math.min(last, i))] as HTMLElement | undefined
    if (!el || !item) return
    el.scrollTo({ left: item.offsetLeft - (el.clientWidth - item.clientWidth) / 2, behavior: "smooth" })
  }

  const show = (i: number) => {
    setOpen(i)
    dialog.current?.showModal()
  }

  const shown = open === null ? null : paintings[open]

  return (
    <div className={className}>
      <ol
        ref={track}
        aria-label="Mes tableaux"
        className="relative flex snap-x snap-mandatory items-end gap-[clamp(20px,4vw,72px)] overflow-x-auto px-[7vw] pt-2 pb-6 [scrollbar-width:none] sm:px-[15vw] lg:px-[max(20vw,calc((100vw-1000px)/2))] [&::-webkit-scrollbar]:hidden"
      >
        {paintings.map((painting, i) => (
          <li
            key={painting.src}
            className={
              // même hauteur de toile pour tous sur grand écran : une toile 9:16 fait (9/16)² de la largeur
              // d'une 16:9, à quoi s'ajoute la marie-louise blanche (--mat) de chaque côté
              painting.portrait
                ? "w-[62vw] shrink-0 snap-center [--mat:clamp(8px,1.5vw,22px)] sm:w-[calc((70vw-2*var(--mat))*0.3164+2*var(--mat))] lg:w-[calc((min(60vw,1000px)-2*var(--mat))*0.3164+2*var(--mat))]"
                : "w-[86vw] shrink-0 snap-center sm:w-[70vw] lg:w-[min(60vw,1000px)]"
            }
          >
            <figure>
              <button
                type="button"
                disabled={!painting.ready}
                onClick={() => show(i)}
                aria-label={`Voir en grand : tableau n° ${ROMAN[i]}`}
                className="block w-full cursor-zoom-in border border-black bg-white p-[clamp(8px,1.5vw,22px)] shadow-[0_34px_60px_-38px_rgba(0,0,0,.6)] transition-transform duration-500 ease-out hover:-translate-y-1 disabled:cursor-default disabled:hover:translate-y-0"
              >
                <span className={`relative block overflow-hidden bg-paper ${painting.portrait ? "aspect-[9/16]" : "aspect-[16/9]"}`}>
                  {painting.ready ? (
                    <Image
                      src={painting.src}
                      alt={painting.alt}
                      fill
                      sizes="(min-width: 1024px) 60vw, (min-width: 640px) 70vw, 86vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="grid size-full place-items-center p-2 text-center font-display text-[clamp(1.2rem,2.6vw,2.2rem)] leading-tight text-black/45 italic">
                      Tableau à venir
                    </span>
                  )}
                </span>
              </button>
              <figcaption className="mt-4 flex items-baseline justify-between gap-4 border-t border-black pt-2">
                <span className="font-display text-[clamp(1.3rem,2vw,1.7rem)] leading-none italic">N° {ROMAN[i]}</span>
                <span className="font-mono text-[11px] tracking-[0.14em] uppercase">Riyane</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>

      <div className="mx-auto mt-4 flex max-w-[1320px] items-center justify-between px-4 sm:px-8">
        <p className="font-display text-[1.35rem] italic tabular-nums" aria-live="polite">
          {ROMAN[current]} <span className="text-black/45">/ {ROMAN[last]}</span>
        </p>
        <div className="flex gap-2">
          {[
            { label: "Tableau précédent", to: current - 1, glyph: "←", disabled: current === 0 },
            { label: "Tableau suivant", to: current + 1, glyph: "→", disabled: current === last },
          ].map((b) => (
            <button
              key={b.label}
              type="button"
              aria-label={b.label}
              disabled={b.disabled}
              onClick={() => go(b.to)}
              className="grid size-11 place-items-center rounded-full border border-black font-display text-2xl leading-none transition-colors hover:bg-black hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              {b.glyph}
            </button>
          ))}
        </div>
      </div>

      <dialog
        ref={dialog}
        aria-label={shown ? `Tableau n° ${ROMAN[open!]}` : undefined}
        onClose={() => setOpen(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close()
        }}
        className="m-0 h-svh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-black/90 open:grid open:place-items-center"
      >
        {shown ? (
          <figure className="grid justify-items-center gap-4 p-4">
            <Image
              src={shown.src}
              alt={shown.alt}
              width={shown.portrait ? 1125 : 2000}
              height={shown.portrait ? 2000 : 1125}
              sizes="92vw"
              className={`h-auto border-[10px] border-white ${shown.portrait ? "w-[min(92vw,calc(82svh*9/16))]" : "w-[min(92vw,calc(82svh*16/9))]"}`}
            />
            <figcaption
              className={`flex items-baseline justify-between gap-4 text-white ${shown.portrait ? "w-[min(92vw,calc(82svh*9/16))]" : "w-[min(92vw,calc(82svh*16/9))]"}`}
            >
              <span className="font-display text-2xl italic">N° {ROMAN[open!]} — Riyane</span>
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                className="font-mono text-[12px] tracking-[0.12em] uppercase underline-offset-4 hover:underline"
              >
                Fermer ✕
              </button>
            </figcaption>
          </figure>
        ) : null}
      </dialog>
    </div>
  )
}
