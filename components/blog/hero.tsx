import Link from "next/link"
import { AsciiEffect } from "@/components/ui/ascii-effect"
import { TiltedGridHero } from "@/components/ui/tilted-grid-hero"
import { Brush } from "@/components/blog/brush"
import { HitCounter } from "@/components/blog/hit-counter"
import { NewsletterForm } from "@/components/blog/newsletter-form"
import { RetroWindow } from "@/components/blog/retro-window"
import { formatShort } from "@/lib/format"
import { site } from "@/lib/site"

/**
 * L'ouverture : le titre au pinceau au-dessus du bandeau 3D (TiltedGridHero),
 * et deux fenêtres Windows 98 posées de travers par-dessus, comme sur l'original.
 */
export function Hero({ lastUpdate, firstDate }: { lastUpdate: string; firstDate: string }) {
  return (
    <section aria-label="Accueil" className="relative">
      <TiltedGridHero
        images={site.heroImages.map((img) => ({ ...img }))}
        className="h-[clamp(460px,82vw,600px)] w-full bg-background lg:h-[700px]"
        axis={66}
        tileHeight={30}
        curve={76}
        speed={4.5}
        fade={14}
      >
        <div className="pointer-events-none relative z-10 flex h-full flex-col items-center px-2 pt-4 text-center lg:pt-2">
          <Brush as="h1" reveal={false} className="text-[16.5vw] sm:text-[8.3vw] sm:whitespace-nowrap 2xl:text-[8.6rem]">
            &quot;{site.heroTitle}&quot;
          </Brush>
          <p className="mt-auto mb-4 max-w-xl font-mono text-[12px] leading-snug text-black/70">
            fig. 1 — le carnet en images, en rotation continue (3D en CSS, aucun plug-in Flash requis).
          </p>
        </div>
      </TiltedGridHero>

      <div className="relative z-20 grid gap-6 px-4 pb-10 lg:pointer-events-none lg:absolute lg:inset-0 lg:block lg:p-0">
        <RetroWindow
          title="BIENVENUE.EXE"
          className="w-full max-w-[400px] lg:pointer-events-auto lg:absolute lg:bottom-[-56px] lg:left-[3.5%] lg:-rotate-1"
          bodyClassName="bg-white p-4"
        >
          <p className="font-mono text-[14px] leading-[1.3]">
            Bienvenue sur {site.name}™, carnet personnel ouvert le {formatShort(firstDate)}. Dernière mise à jour le{" "}
            {formatShort(lastUpdate)}.
          </p>
          <div className="mt-3">
            <HitCounter />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/#introduction" className="win-btn font-bold">
              Entrer
            </Link>
            <Link href="/#archives" className="win-btn">
              Archives
            </Link>
          </div>
        </RetroWindow>

        <RetroWindow
          title={'"POST-SCRIPTUM"'}
          className="w-full max-w-[460px] justify-self-end lg:pointer-events-auto lg:absolute lg:top-[27%] lg:right-[3%] lg:rotate-[0.6deg]"
          bodyClassName="bg-retro-red px-5 pt-6 pb-5 text-black"
        >
          <p className="text-center font-sans text-[clamp(1rem,1.6vw,1.2rem)] leading-tight font-bold uppercase">
            La lettre mensuelle du carnet
            <br />
            un e-mail, zéro algorithme
          </p>
          <figure className="my-5">
            <div className="bevel-in bg-black p-[3px]">
              <AsciiEffect
                src="/images/franklin.jpg"
                alt="Portrait de Benjamin Franklin redessiné en trame binaire verte qui scintille"
                position="50% 24%"
                className="aspect-[16/11] w-full"
              />
            </div>
            <figcaption className="mt-2 font-mono text-[11px] leading-snug">
              benjamin.exe — « All about the Benjamins » : B. Franklin d&apos;après Duplessis (v. 1785), en binaire. La lettre,
              elle, est gratuite.
            </figcaption>
          </figure>
          <p className="text-center font-sans text-[15px] font-bold">{site.name}™</p>
          <p
            className="text-center font-wordmark text-[clamp(2.4rem,4.6vw,3.6rem)] leading-[0.9] font-black tracking-[-0.03em] uppercase"
            style={{ fontVariationSettings: '"wdth" 80' }}
          >
            &quot;Post-Scriptum&quot;
          </p>
          <p className="mb-5 text-center font-sans text-[15px] font-bold uppercase">la lettre</p>
          <NewsletterForm />
        </RetroWindow>
      </div>
    </section>
  )
}
