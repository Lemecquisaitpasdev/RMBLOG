import { TiltedGridHero } from "@/components/ui/tilted-grid-hero"
import { Brush } from "@/components/blog/brush"
import { site } from "@/lib/site"

/** L'ouverture : le titre au pinceau au-dessus du bandeau 3D (TiltedGridHero). */
export function Hero() {
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
    </section>
  )
}
