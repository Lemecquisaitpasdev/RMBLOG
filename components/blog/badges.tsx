import { cn } from "@/lib/utils"

type Badge = { top: string; bottom: string; className: string; href?: string }

const BADGES: Badge[] = [
  { top: "FAIT AVEC", bottom: "NEXT.JS 16", className: "bg-black text-white", href: "https://nextjs.org" },
  { top: "PROPULSÉ PAR", bottom: "REACT 19", className: "bg-[#20232a] text-[#61dafb]", href: "https://react.dev" },
  { top: "STYLE", bottom: "TAILWIND 4", className: "bg-[#0b1120] text-[#38bdf8]", href: "https://tailwindcss.com" },
  { top: "COMPOSANTS", bottom: "SHADCN/UI", className: "bg-white text-black", href: "https://ui.shadcn.com" },
  { top: "PHP ?", bottom: "NON. (HOMMAGE)", className: "bg-[#777bb3] text-white" },
  { top: "COOKIES", bottom: "AUCUN", className: "bg-[#ffef00] text-black" },
  { top: "MEILLEUR AVEC", bottom: "TOUT NAVIGATEUR", className: "bg-[#008080] text-white", href: "https://anybrowser.org/campaign/" },
  { top: "ÉCRIT", bottom: "À LA MAIN", className: "bg-retro-red text-white" },
]

/** Les badges 88×31 des pages perso d'antan. */
export function Badges() {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Badges du site">
      {BADGES.map((b) => {
        const inner = (
          <span
            className={cn(
              "bevel-out flex h-[31px] w-[88px] flex-col items-center justify-center font-pixel text-[7px] leading-[1.15] tracking-wide",
              b.className,
            )}
          >
            <span>{b.top}</span>
            <span className="text-[8.5px] font-bold">{b.bottom}</span>
          </span>
        )
        return (
          <li key={b.bottom}>
            {b.href ? (
              <a href={b.href} target="_blank" rel="noopener noreferrer" aria-label={`${b.top} ${b.bottom}`}>
                {inner}
              </a>
            ) : (
              inner
            )}
          </li>
        )
      })}
    </ul>
  )
}
