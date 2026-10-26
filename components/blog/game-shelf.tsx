"use client"

import Image from "next/image"
import * as React from "react"
import { coverOf, games } from "@/lib/games"

const CYCLE_MS = 4500
const REDUCED = "(prefers-reduced-motion: reduce)"

function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}

const pad = (n: number) => String(n).padStart(2, "0")
const first = Math.min(...games.map((g) => g.year))
const last = Math.max(...games.map((g) => g.year))

/**
 * L'étagère de jeux : la pochette choisie teinte tout le fond, comme l'écran d'accueil d'une console.
 * Sans personne aux commandes, la sélection passe toute seule au jeu suivant.
 */
export function GameShelf() {
  const [active, setActive] = React.useState(0)
  const [hovering, setHovering] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const [onScreen, setOnScreen] = React.useState(false)
  const reduced = React.useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => true)
  const shelf = React.useRef<HTMLOListElement>(null)
  const game = games[active]
  const cycling = onScreen && !hovering && !focused && !reduced

  React.useEffect(() => {
    const el = shelf.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  React.useEffect(() => {
    if (!cycling) return
    const id = setTimeout(() => setActive((i) => (i + 1) % games.length), CYCLE_MS)
    return () => clearTimeout(id)
  }, [active, cycling])

  // La pochette penche vers la souris, avec un reflet qui la suit.
  const tilt = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || reduced) return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty("--rx", `${(0.5 - y) * 16}deg`)
    el.style.setProperty("--ry", `${(x - 0.5) * 16}deg`)
    el.style.setProperty("--gx", `${x * 100}%`)
    el.style.setProperty("--gy", `${y * 100}%`)
  }
  const untilt = (e: React.PointerEvent<HTMLElement>) => {
    for (const prop of ["--rx", "--ry", "--gx", "--gy"]) e.currentTarget.style.removeProperty(prop)
  }

  return (
    <div style={{ "--accent": game.accent } as React.CSSProperties}>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[12%] blur-3xl saturate-150">
          {games.map((g, i) => (
            <Image
              key={g.slug}
              src={coverOf(g)}
              alt=""
              fill
              sizes="160px"
              className={`object-cover transition-opacity duration-700 ${i === active ? "opacity-70" : "opacity-0"}`}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#0a0a0c_0%,rgba(10,10,12,.3)_30%,rgba(10,10,12,.62)_68%,#0a0a0c_100%)]" />
      </div>

      <div className="relative mx-auto max-w-[1320px]">
        <h2
          id="jeux-titre"
          className="font-sans text-[clamp(2rem,4vw,3.6rem)] leading-[1.08] font-bold tracking-[-0.02em] text-white uppercase"
        >
          <span className="bg-black px-2 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
            Mes jeux vidéo préférés
          </span>
        </h2>
        <p className="mt-4 font-mono text-[13px] text-white/75">
          {games.length} jeux, de {first} à {last} · choisissez une pochette
        </p>

        <div className="mt-10 flex items-end gap-5 md:gap-8">
          <p
            aria-hidden
            className="font-mono text-[clamp(3.2rem,8vw,6.5rem)] leading-[0.85] text-[var(--accent)] tabular-nums transition-colors duration-500"
          >
            {pad(active + 1)}
          </p>
          <div className="min-w-0 flex-1">
            {/* Toujours la place de deux lignes de titre, prise au-dessus : rien ne saute d'un jeu à l'autre. */}
            <div className="flex min-h-[calc(1.9*clamp(1.5rem,4.2vw,3.6rem)+1.75rem)] flex-col justify-end">
              <p className="font-mono text-[12px] tracking-[0.08em] text-white/70 uppercase">
                Sauvegarde {pad(active + 1)}/{pad(games.length)} · {game.year}
              </p>
              <p
                className="mt-2 font-wordmark text-[clamp(1.5rem,4.2vw,3.6rem)] leading-[0.95] font-extrabold text-balance text-white uppercase"
                style={{ fontVariationSettings: '"wdth" 112' }}
              >
                {game.title}
              </p>
            </div>
            <p className="mt-3 font-mono text-[13px] text-white/75">{game.studio}</p>
            <div className="mt-4 h-[2px] w-48 bg-white/15">
              {cycling ? (
                <span
                  key={active}
                  className="block h-full origin-left animate-[shelf-progress_4.5s_linear_forwards] bg-[var(--accent)]"
                />
              ) : null}
            </div>
          </div>
        </div>

        <ol
          ref={shelf}
          className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 md:gap-4 xl:grid-cols-8"
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
          }}
        >
          {games.map((g, i) => {
            const on = i === active
            return (
              <li key={g.slug}>
                <button
                  type="button"
                  aria-pressed={on}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  onPointerMove={tilt}
                  onPointerLeave={untilt}
                  className={`group relative block aspect-[3/4] w-full overflow-hidden rounded-[10px] bg-white/5 outline-none transition-[transform,opacity,box-shadow] duration-300 ease-out [transform:perspective(700px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))_translateY(var(--lift,0px))] focus-visible:ring-2 focus-visible:ring-white ${
                    on
                      ? "opacity-100 shadow-[0_22px_50px_-14px_var(--accent)] ring-2 ring-[var(--accent)] ring-offset-4 ring-offset-[#0a0a0c] [--lift:-6px]"
                      : "opacity-55 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={coverOf(g)}
                    alt={`Pochette de ${g.title} (${g.year})`}
                    fill
                    sizes="(min-width: 1280px) 160px, (min-width: 768px) 16vw, (min-width: 640px) 25vw, 33vw"
                    className="object-cover"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--gx,50%)_var(--gy,0%),rgba(255,255,255,.32),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[10px] ring-1 ring-white/15 ring-inset" />
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <p className="pointer-events-none absolute bottom-4 left-4 bg-black px-2 py-1 font-mono text-[12px] text-white">
        fig. 7 — mes jeux vidéo préférés · pochettes © leurs éditeurs, via Wikipédia
      </p>
    </div>
  )
}
