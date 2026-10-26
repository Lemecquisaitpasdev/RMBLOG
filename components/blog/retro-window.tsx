"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Chaque fenêtre cliquée passe au premier plan, comme sur un vrai bureau.
let topZ = 30

type RetroWindowProps = {
  title: string
  children: React.ReactNode
  /** Position et taille de la fenêtre (le conteneur). */
  className?: string
  bodyClassName?: string
  /** Déplaçable à la souris par la barre de titre (grands écrans uniquement). */
  draggable?: boolean
  closable?: boolean
}

/** Une fenêtre façon Windows 98 : on peut la déplacer, la réduire, la fermer. */
export function RetroWindow({
  title,
  children,
  className,
  bodyClassName,
  draggable = true,
  closable = true,
}: RetroWindowProps) {
  const titleId = React.useId()
  const [offset, setOffset] = React.useState({ x: 0, y: 0 })
  const [minimized, setMinimized] = React.useState(false)
  const [closed, setClosed] = React.useState(false)
  const [z, setZ] = React.useState<number>()
  const drag = React.useRef<{ px: number; py: number; ox: number; oy: number } | null>(null)

  const raise = () => setZ(++topZ)

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || e.button !== 0) return
    if ((e.target as HTMLElement).closest("button")) return
    if (!window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches) return
    drag.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    setOffset({ x: d.ox + e.clientX - d.px, y: d.oy + e.clientY - d.py })
  }
  const endDrag = () => {
    drag.current = null
  }

  return (
    <div
      className={cn("relative", className)}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, zIndex: z }}
      onPointerDownCapture={raise}
    >
      {closed ? (
        <button type="button" className="win-btn font-mono text-xs font-bold" onClick={() => setClosed(false)}>
          <WindowIcon /> Rouvrir {title}
        </button>
      ) : (
        <section
          aria-labelledby={titleId}
          className="bevel-out bg-win-face p-[3px] shadow-[10px_10px_0_rgba(0,0,0,0.16)]"
        >
          <div
            className={cn(
              "flex h-[26px] items-center justify-between gap-3 pr-[3px] pl-2 text-white select-none",
              draggable && "lg:cursor-move lg:touch-none",
            )}
            style={{ background: "var(--win-title)" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onDoubleClick={() => setOffset({ x: 0, y: 0 })}
          >
            <h2 id={titleId} className="truncate font-mono text-[13px] font-bold tracking-wide">
              {title}
            </h2>
            <div className="flex shrink-0 gap-[2px]">
              <TitleButton label={minimized ? "Restaurer" : "Réduire"} onClick={() => setMinimized((m) => !m)}>
                <path d="M2 8h6v2H2z" />
              </TitleButton>
              <TitleButton label="Remettre à sa place" onClick={() => setOffset({ x: 0, y: 0 })}>
                <path d="M1 1h8v8H1zM2 3v5h6V3z" fillRule="evenodd" />
              </TitleButton>
              {closable ? (
                <TitleButton label="Fermer" onClick={() => setClosed(true)}>
                  <path d="M1 1h2l2 2 2-2h2v1L7 5l2 2v2H7L5 7 3 9H1V7l2-2-2-2z" />
                </TitleButton>
              ) : null}
            </div>
          </div>
          {minimized ? null : <div className={cn("mt-[3px]", bodyClassName)}>{children}</div>}
        </section>
      )}
    </div>
  )
}

function TitleButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="bevel-out grid h-[18px] w-[20px] place-items-center bg-win-face text-black active:bevel-in"
    >
      <svg viewBox="0 0 10 10" width="10" height="10" fill="currentColor" aria-hidden>
        {children}
      </svg>
    </button>
  )
}

function WindowIcon() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden>
      <rect x="0.5" y="0.5" width="11" height="11" fill="#fff" stroke="#000" />
      <rect x="1" y="1" width="10" height="3" fill="#22409a" />
    </svg>
  )
}
