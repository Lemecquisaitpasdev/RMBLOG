import type { Metadata } from "next"
import Link from "next/link"
import { CoverSection } from "@/components/blog/cover-section"
import { formatLong, pad } from "@/lib/format"
import { thoughts } from "@/lib/thoughts"

export const metadata: Metadata = {
  title: "Mon carnet de pensées",
  description: "Mes pensées, écrites au jour le jour.",
  alternates: { canonical: "/carnet-de-pensees" },
}

// Le papier réglé : une ligne par interligne, calée juste sous le texte.
const ruled =
  "[--rule:1.85rem] sm:[--rule:2rem] leading-[var(--rule)] [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_calc(var(--rule)-1px),rgba(0,0,0,.1)_calc(var(--rule)-1px),rgba(0,0,0,.1)_var(--rule))] [background-position:0_calc(var(--rule)*-0.16)]"

/** Mon carnet de pensées : les entrées, de la plus récente à la plus ancienne, sur papier réglé. */
export default function CarnetDePensees() {
  const entries = [...thoughts].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <article id="carnet" aria-labelledby="carnet-titre" className="bg-paper pb-24 text-black">
      <header className="mx-auto max-w-[72ch] px-5 pt-14 text-center sm:pt-20">
        <p className="font-mono text-[11px] tracking-[0.18em] text-black/60 uppercase">
          {entries.length} {entries.length > 1 ? "entrées" : "entrée"}
        </p>
        <h1
          id="carnet-titre"
          className="mt-4 font-display text-[clamp(3.2rem,11vw,7.5rem)] leading-[0.85] font-light tracking-[-0.035em]"
        >
          Mon carnet <em className="font-normal">de pensées</em>
        </h1>
      </header>

      {/* Pendant la lecture, l'en-tête collé se retire pour laisser toute la page au texte. */}
      <CoverSection as="div" id="carnet-entrees" threshold={0.25}>
        {entries.map((entry, i) => (
          <section
            key={entry.date}
            id={entry.date}
            aria-labelledby={`pensee-${entry.date}`}
            className="mx-auto mt-14 max-w-[72ch] scroll-mt-8 px-5 sm:mt-20"
          >
            <div className="flex items-baseline justify-between gap-4 border-b border-black pb-2">
              <h2 id={`pensee-${entry.date}`} className="font-display text-[clamp(1.6rem,3.4vw,2.3rem)] leading-none italic">
                {formatLong(entry.date)}
              </h2>
              <span className="font-mono text-[11px] tracking-[0.14em] text-black/60 uppercase">
                Pensée n° {pad(entries.length - i)}
              </span>
            </div>

            {/* La marge du cahier : un double filet à gauche, le texte réglé à droite. */}
            <div className="mt-[var(--rule)] border-l-[3px] border-double border-black/25 pl-5 sm:pl-8 [--rule:1.85rem] sm:[--rule:2rem]">
              <div className={`font-display text-[1.2rem] sm:text-[1.35rem] ${ruled}`}>
                {entry.paragraphs.map((paragraph, k) => (
                  <p
                    key={k}
                    className={`mb-[var(--rule)] text-pretty hyphens-auto last:mb-0 ${
                      k === 0
                        ? "first-letter:float-left first-letter:mt-[0.12em] first-letter:mr-2 first-letter:text-[calc(var(--rule)*2.15)] first-letter:leading-[0.8] first-letter:font-normal"
                        : ""
                    }`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </section>
        ))}
      </CoverSection>

      <p className="mx-auto mt-16 max-w-[72ch] px-5 font-mono text-[12px]">
        <Link href="/" className="retro-link">
          ← retour à la page d&apos;accueil
        </Link>
      </p>
    </article>
  )
}
