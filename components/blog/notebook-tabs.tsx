"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { tabs } from "@/lib/site"

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]

/** L'onglet de la section qu'on est en train de lire (celle qui traverse le milieu de l'écran), -1 sinon. */
function useActiveTab() {
  const [active, setActive] = React.useState(-1)
  // Les onglets vivent dans la mise en page : à chaque page, on regarde ses sections à elle.
  const pathname = usePathname()

  React.useEffect(() => {
    const owner = new Map<string, number>()
    tabs.forEach((tab, i) => tab.sections.forEach((id) => owner.set(id, i)))
    const visible = new Set<string>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        const id = [...visible][0]
        setActive(id === undefined ? -1 : (owner.get(id) ?? -1))
      },
      { rootMargin: "-45% 0px -50% 0px" },
    )
    for (const id of owner.keys()) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => {
      io.disconnect()
      setActive(-1)
    }
  }, [pathname])

  return active
}

/** Les onglets de l'en-tête : des intercalaires qui dépassent de la tranche, à droite de la page. */
export function HeaderTabs() {
  const active = useActiveTab()
  return (
    <nav id="sommaire" aria-label="Onglets du carnet" className="lg:pt-6">
      <ol className="-mr-3 flex flex-col items-end gap-1.5">
        {tabs.map((tab, i) => {
          const on = i === active
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={on ? "location" : undefined}
                className={cn(
                  "flex items-baseline gap-3 rounded-l-[14px] border border-r-0 border-black py-[0.45rem] pr-5 pl-5 shadow-[0_8px_20px_-16px_rgba(0,0,0,.5)] transition-[transform,background-color,color] duration-300 ease-out hover:-translate-x-2 focus-visible:-translate-x-2 focus-visible:outline-none lg:pl-6",
                  on ? "-translate-x-3 bg-black text-white" : "bg-paper text-black",
                )}
              >
                <span className="w-[3ch] text-right font-mono text-[11px] tabular-nums opacity-70">{ROMAN[i]}</span>
                <span className="font-display text-[clamp(1.3rem,1.9vw,1.8rem)] leading-none font-medium italic">{tab.label}</span>
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/**
 * La même chose en tranche, collée au bord droit de l'écran dès que l'en-tête n'est plus là :
 * le chiffre seul, le nom au survol, celui de la section lue toujours ouvert sur grand écran.
 */
export function TabRail() {
  const active = useActiveTab()
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    const header = document.getElementById("sommaire")
    if (!header) return
    const io = new IntersectionObserver(([entry]) => setShow(!entry.isIntersecting))
    io.observe(header)
    return () => io.disconnect()
  }, [])

  return (
    <nav
      aria-label="Onglets du carnet, en tranche"
      inert={!show}
      className={cn(
        "fixed top-1/2 right-0 z-50 -translate-y-1/2 transition-transform duration-500 ease-[cubic-bezier(.65,0,.2,1)]",
        show ? "translate-x-0" : "translate-x-full",
      )}
    >
      <ol className="flex flex-col items-end gap-1">
        {tabs.map((tab, i) => {
          const on = i === active
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={on ? "location" : undefined}
                aria-label={tab.label}
                className={cn(
                  "group flex items-center rounded-l-[10px] border border-r-0 border-black py-1.5 pr-2 pl-2.5 shadow-[0_6px_18px_-10px_rgba(0,0,0,.55)] transition-colors duration-300 focus-visible:outline-none md:py-2 md:pr-2.5 md:pl-3",
                  on ? "bg-black text-white" : "bg-paper text-black",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "max-w-0 overflow-hidden font-display text-[17px] leading-none whitespace-nowrap italic opacity-0 transition-[max-width,opacity,margin] duration-300 group-hover:mr-2.5 group-hover:max-w-[18rem] group-hover:opacity-100 group-focus-visible:mr-2.5 group-focus-visible:max-w-[18rem] group-focus-visible:opacity-100",
                    on && "lg:mr-2.5 lg:max-w-[18rem] lg:opacity-100",
                  )}
                >
                  {tab.label}
                </span>
                <span aria-hidden className="w-[2.6ch] text-center font-display text-[15px] leading-none font-semibold md:text-[16px]">
                  {ROMAN[i]}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
