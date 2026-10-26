"use client"

import Image from "next/image"
import * as React from "react"
import { aspirations, photoOf, type Aspiration } from "@/lib/aspirations"

const pad = (n: number) => String(n).padStart(2, "0")
const PREVIEW_W = 280
const PREVIEW_H = 350

/** L'icône d'image cassée des navigateurs de 2003. */
function BrokenIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className}>
      <path d="M2.5 1.5h7l4 4v9h-11z" fill="#fff" stroke="#808080" />
      <path d="M9.5 1.5v4h4" fill="none" stroke="#808080" />
      <path d="M5 8l4 4m0-4l-4 4" stroke="#e00000" strokeWidth="1.6" />
    </svg>
  )
}

function Thumb({ person }: { person: Aspiration }) {
  const src = photoOf(person)
  if (!src) {
    return (
      <span className="bevel-in grid size-full place-items-center bg-white" title="Photo à venir">
        <BrokenIcon className="size-4" />
      </span>
    )
  }
  return (
    <Image
      src={src}
      alt={`Portrait de ${person.name}`}
      fill
      sizes="72px"
      className="object-cover object-top grayscale transition-[filter] duration-300 group-hover:grayscale-0"
    />
  )
}

/**
 * La liste en grandes lettres, façon Virgil Abloh. À la souris, le portrait suit le curseur ;
 * sur téléphone, la vignette de chaque ligne suffit.
 */
export function AspirationsList() {
  const [active, setActive] = React.useState<number | null>(null)
  const [armed, setArmed] = React.useState(false) // les grands portraits ne se chargent qu'au premier survol
  const preview = React.useRef<HTMLDivElement>(null)
  const target = React.useRef({ x: 0, y: 0 })
  const current = React.useRef({ x: 0, y: 0 })
  const frame = React.useRef(0)

  React.useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const place = () => {
    const el = preview.current
    if (!el) return
    const c = current.current
    el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) rotate(-2deg)`
  }

  const follow = () => {
    const c = current.current
    const t = target.current
    c.x += (t.x - c.x) * 0.2
    c.y += (t.y - c.y) * 0.2
    place()
    frame.current = Math.abs(t.x - c.x) + Math.abs(t.y - c.y) > 0.5 ? requestAnimationFrame(follow) : 0
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return
    // à droite du curseur, ou à gauche s'il n'y a plus la place ; toujours entier à l'écran
    const x = e.clientX + 28 + PREVIEW_W > window.innerWidth ? e.clientX - 28 - PREVIEW_W : e.clientX + 28
    const y = Math.min(Math.max(e.clientY - PREVIEW_H / 2, 12), window.innerHeight - PREVIEW_H - 12)
    target.current = { x, y }
    if (active === null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      current.current = { x, y }
      place()
      return
    }
    if (!frame.current) frame.current = requestAnimationFrame(follow)
  }

  return (
    <>
      <ol
        className="border-b border-black"
        onPointerMove={onPointerMove}
        onPointerLeave={() => setActive(null)}
      >
        {aspirations.map((person, i) => (
          <li
            key={person.slug}
            onPointerEnter={(e) => {
              if (e.pointerType !== "mouse") return
              setArmed(true)
              setActive(i)
            }}
            className="group grid grid-cols-[56px_1fr] items-center gap-x-4 gap-y-1 border-t border-black px-2 py-3 transition-colors duration-150 hover:bg-black hover:text-white md:grid-cols-[3rem_72px_1fr_minmax(0,21rem)] md:gap-x-6 md:px-4 md:py-3"
          >
            <span className="hidden font-mono text-[12px] md:block">{pad(i + 1)}</span>
            <span className="relative row-span-2 aspect-[4/5] w-[56px] overflow-hidden bg-neutral-200 md:row-span-1 md:w-[72px]">
              <Thumb person={person} />
            </span>
            <span className="font-sans text-[clamp(1.45rem,5vw,4rem)] leading-[0.95] font-bold tracking-[-0.035em] uppercase">
              &quot;{person.name}&quot;
            </span>
            <span className="col-start-2 font-mono text-[12px] leading-[1.4] md:col-start-auto md:text-right">
              <span className="md:hidden">{pad(i + 1)} · </span>
              {[person.role, person.dates, person.credit ? null : "photo à venir"].filter(Boolean).join(" · ")}
            </span>
          </li>
        ))}
      </ol>

      <div
        ref={preview}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-40 hidden transition-opacity duration-200 md:block"
        style={{ width: PREVIEW_W, height: PREVIEW_H, opacity: active === null ? 0 : 1 }}
      >
        {armed
          ? aspirations.map((person, i) => {
              const src = photoOf(person)
              const shown = i === active ? "opacity-100" : "opacity-0"
              return src ? (
                <div key={person.slug} className={`absolute inset-0 bg-neutral-200 shadow-[0_24px_60px_-20px_rgba(0,0,0,.6)] ${shown}`}>
                  <Image src={src} alt="" fill sizes={`${PREVIEW_W}px`} className="object-cover object-top" />
                  <span className="absolute bottom-0 left-0 bg-black px-1.5 py-0.5 font-mono text-[10px] text-white">
                    {person.slug}.jpg
                  </span>
                </div>
              ) : (
                <div key={person.slug} className={`bevel-out absolute inset-0 flex flex-col bg-win-face p-[3px] ${shown}`}>
                  <div className="flex h-[18px] items-center bg-[image:var(--win-title)] px-1.5 font-sans text-[11px] font-bold text-white">
                    {person.slug}.jpg
                  </div>
                  <div className="bevel-in m-[3px] grid flex-1 place-items-center bg-white text-center font-mono text-[12px] text-black">
                    <span className="grid justify-items-center gap-2">
                      <BrokenIcon className="size-8" />
                      Photo à venir
                    </span>
                  </div>
                </div>
              )
            })
          : null}
      </div>
    </>
  )
}
