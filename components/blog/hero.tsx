import { TiltedGridHero } from "@/components/ui/tilted-grid-hero"
import { projects } from "@/lib/projects"
import { site } from "@/lib/site"

/** L'ouverture : le titre du carnet, en Garamond, au-dessus du bandeau 3D (TiltedGridHero) des projets lancés. */
export function Hero() {
  const [first, ...rest] = site.heroTitle.split(" ")
  return (
    <section aria-label="Accueil" className="relative">
      <TiltedGridHero
        images={projects.map((project) => ({ src: project.image, alt: project.alt }))}
        className="h-[clamp(460px,82vw,600px)] w-full bg-background lg:h-[700px]"
        axis={66}
        tileHeight={30}
        curve={76}
        speed={4.5}
        fade={14}
      >
        <div className="pointer-events-none relative z-10 flex h-full flex-col items-center px-2 pt-4 text-center lg:pt-2">
          <h1 className="font-display text-[clamp(4rem,19vw,13rem)] leading-[0.8] font-light tracking-[-0.035em] text-black sm:whitespace-nowrap">
            {first} <em className="font-normal">{rest.join(" ")}</em>
          </h1>
          <p className="mt-4 flex items-center gap-3 font-mono text-[11px] tracking-[0.14em] text-black/70 uppercase">
            <span aria-hidden className="h-px w-10 bg-black/60" />
            {site.dateline}
            <span aria-hidden className="h-px w-10 bg-black/60" />
          </p>
          <p className="mt-auto mb-4 max-w-xl font-mono text-[12px] leading-snug text-black/70">
            fig. 1 — les projets lancés, en rotation continue (3D en CSS, aucun plug-in Flash requis).
          </p>
        </div>
      </TiltedGridHero>
    </section>
  )
}
