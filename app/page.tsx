import { existsSync } from "node:fs"
import path from "node:path"
import Image from "next/image"
import { AspirationsList } from "@/components/blog/aspirations-list"
import { CoverSection } from "@/components/blog/cover-section"
import { DreamGallery } from "@/components/blog/dream-gallery"
import { GameShelf } from "@/components/blog/game-shelf"
import { Hero } from "@/components/blog/hero"
import { Portfolio } from "@/components/blog/portfolio"
import { WorksGallery } from "@/components/blog/works-gallery"
import { AsciiEffect } from "@/components/ui/ascii-effect"
import { FerrisWheelGallery } from "@/components/ui/ferris-wheel-gallery"
import { AsciiArt } from "@/components/ui/kaaba"
import { aspirations } from "@/lib/aspirations"
import { dreamImages } from "@/lib/dream"
import { monthly, wheelItems } from "@/lib/monthly"
import { site } from "@/lib/site"
import { paintings } from "@/lib/works"

// Un tableau ne s'accroche que si son fichier est dans public/images/oeuvres.
const works = paintings.filter((p) => existsSync(path.join(process.cwd(), "public", p.src)))

const soundcloudPlayer = `https://w.soundcloud.com/player/?${new URLSearchParams({
  url: site.soundcloud,
  color: "#000000",
  auto_play: "false",
  hide_related: "true",
  show_comments: "false",
  show_user: "true",
  show_reposts: "false",
  show_teaser: "false",
})}`

export default function Home() {
  return (
    <>
      <Hero />

      <CoverSection id="portrait" aria-labelledby="portrait-titre" className="relative h-svh w-full scroll-mt-0 overflow-hidden bg-black">
        <h2 id="portrait-titre" className="sr-only">
          Portrait
        </h2>
        <Image
          src="/images/portrait.jpg"
          alt="Portrait en noir et blanc d'un jeune homme aux cheveux bouclés, en débardeur blanc et veste à capuche"
          fill
          sizes="100vw"
          className="object-cover object-[50%_25%]"
        />
        <p className="pointer-events-none absolute bottom-4 left-4 bg-black px-2 py-1 font-mono text-[12px] text-white">
          fig. 2 — portrait
        </p>
      </CoverSection>

      <CoverSection id="benjamins" aria-labelledby="benjamins-titre" className="relative h-svh w-full scroll-mt-0 overflow-hidden bg-black">
        <AsciiEffect
          src="/images/franklin.jpg"
          alt="Portrait de Benjamin Franklin redessiné en trame binaire verte qui scintille"
          position="50% 22%"
          className="absolute inset-0"
        />
        <div className="absolute inset-x-4 bottom-24 z-10 max-w-[600px] lg:inset-x-auto lg:top-[12%] lg:bottom-auto lg:left-[4%]">
          <h2
            id="benjamins-titre"
            className="font-sans text-[clamp(2rem,4vw,3.6rem)] leading-[1.08] font-bold tracking-[-0.02em] text-white uppercase"
          >
            <span className="bg-black px-2 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
              Le centre de l&apos;humain, mais pas de l&apos;humanité
            </span>
          </h2>
          <p className="mt-6 max-w-[52ch] font-mono text-[15px] leading-[1.6] text-[#00ff66] md:text-[17px]">
            <span className="bg-black px-1.5 py-0.5 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
              La chose la plus convoitée depuis sa création, une drogue obligatoire à tous. D&apos;abord, décortiquons la
              définition de la drogue : j&apos;ai du temps, et j&apos;espère que vous aussi. Les liens étroits avec la
              drogue…
            </span>
          </p>
        </div>
        <p className="pointer-events-none absolute bottom-4 left-4 bg-black px-2 py-1 font-mono text-[12px] text-[#00ff66]">
          fig. 3 — « All about the Benjamins » · B. Franklin d&apos;après Duplessis (v. 1785)
        </p>
      </CoverSection>

      <CoverSection id="kaaba" aria-labelledby="kaaba-titre" className="relative h-svh w-full scroll-mt-0 overflow-hidden bg-[#e8f3ee]">
        <AsciiArt className="absolute inset-0" />
        <div className="absolute inset-x-4 top-[10%] z-10 max-w-[640px] lg:inset-x-auto lg:top-[12%] lg:left-[4%]">
          <h2
            id="kaaba-titre"
            className="font-sans text-[clamp(2rem,4vw,3.6rem)] leading-[1.08] font-bold tracking-[-0.02em] text-white uppercase"
          >
            <span className="bg-black px-2 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
              Un chemin d&apos;obligation ou de foi&nbsp;?
            </span>
          </h2>
        </div>
        <p className="pointer-events-none absolute bottom-4 left-4 bg-black px-2 py-1 font-mono text-[12px] text-white">
          fig. 4 — La Kaaba, La Mecque · art ASCII animé (21st.dev)
        </p>
      </CoverSection>

      <CoverSection
        id="portefeuille"
        aria-labelledby="portefeuille-titre"
        threshold={0.3}
        className="relative w-full scroll-mt-0 bg-black px-2 pt-6 pb-6 sm:px-6 sm:pt-10"
      >
        <h2 id="portefeuille-titre" className="sr-only">
          50 000 000 $, revalorisés chaque seconde au cours du marché
        </h2>
        <Portfolio className="max-md:empty:min-h-[2870px] md:max-[1199px]:empty:min-h-[1840px] min-[1200px]:empty:min-h-[1140px]" />
        <p className="mt-6 font-mono text-[12px] text-white">
          fig. 5 — 50 000 000 $ fictifs, revalorisés chaque seconde au cours du marché · tableau de bord de vasnev.art
          (21st.dev)
        </p>
      </CoverSection>

      <CoverSection id="reve" aria-labelledby="reve-titre" className="relative h-svh w-full scroll-mt-0 overflow-hidden bg-white">
        <DreamGallery className="absolute inset-0" />
        <ul className="sr-only">
          {dreamImages.map((image) => (
            <li key={image.src}>{image.alt}</li>
          ))}
        </ul>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-3 text-center text-white mix-blend-exclusion">
          <h2 id="reve-titre" className="max-w-[16ch] font-serif text-4xl tracking-tight md:text-7xl">
            <span className="italic">Mon rêve,</span> sûrement fabriqué par les autres
          </h2>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-16 text-center font-mono text-[11px] font-semibold text-white uppercase mix-blend-exclusion">
          <p>Faites défiler la page pour traverser les images</p>
          <p className="opacity-60">Lecture automatique après 3 secondes d&apos;inactivité</p>
        </div>
        <p className="pointer-events-none absolute bottom-4 left-4 bg-black px-2 py-1 font-mono text-[12px] text-white">
          fig. 6 — galerie 3D infinie (21st.dev) · images choisies
        </p>
      </CoverSection>

      <CoverSection
        id="jeux"
        aria-labelledby="jeux-titre"
        threshold={0.35}
        className="relative w-full scroll-mt-0 overflow-hidden bg-[#0a0a0c] px-4 pt-14 pb-20 sm:px-8 lg:pt-20"
      >
        <GameShelf />
      </CoverSection>

      <CoverSection
        id="aspirations"
        aria-labelledby="aspirations-titre"
        threshold={0.18}
        className="relative w-full scroll-mt-0 bg-white px-4 pt-14 pb-20 text-black sm:px-8 lg:pt-20"
      >
        <div className="mx-auto max-w-[1320px]">
          <h2
            id="aspirations-titre"
            className="font-sans text-[clamp(2rem,4vw,3.6rem)] leading-[1.08] font-bold tracking-[-0.02em] text-white uppercase"
          >
            <span className="bg-black px-2 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
              Mes aspirations préférées
            </span>
          </h2>
          <p className="mt-4 font-mono text-[13px] text-black/70">
            {aspirations.length} noms, de A à Z
            <span className="hidden md:inline"> · survolez un nom</span>
          </p>
          <div className="mt-10">
            <AspirationsList />
          </div>
          <p className="mt-8 max-w-[110ch] font-mono text-[11px] leading-[1.6] text-black/60">
            Photos —{" "}
            {aspirations
              .filter((a) => a.credit)
              .map((a) => `${a.name} : ${a.credit}`)
              .join(" · ")}
            .
          </p>
        </div>
        <p className="pointer-events-none absolute bottom-4 left-4 bg-black px-2 py-1 font-mono text-[12px] text-white">
          fig. 8 — mes aspirations préférées
        </p>
      </CoverSection>

      <CoverSection
        id="oeuvres"
        aria-labelledby="oeuvres-titre"
        threshold={0.3}
        className="relative w-full scroll-mt-0 overflow-hidden bg-paper pt-14 pb-24 text-black lg:pt-20"
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-8">
          <h2
            id="oeuvres-titre"
            className="font-sans text-[clamp(2rem,4vw,3.6rem)] leading-[1.08] font-bold tracking-[-0.02em] text-white uppercase"
          >
            <span className="bg-black px-2 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">Mes œuvres</span>
          </h2>
          <p className="mt-4 font-mono text-[13px] text-black/70">
            {works.length} tableaux signés Riyane, puis ma musique
          </p>
        </div>

        <WorksGallery paintings={works} className="mt-10" />

        <div className="mx-auto mt-20 grid max-w-[1320px] gap-8 px-4 sm:px-8 md:grid-cols-[minmax(0,22rem)_1fr] md:gap-12">
          <div>
            <h3 className="font-display text-[clamp(2.4rem,4.4vw,3.6rem)] leading-[0.95] font-normal italic">Ma musique</h3>
            <p className="mt-4 font-mono text-[13px] leading-[1.6] text-black/75">
              La musique que j&apos;ai créée, à écouter ici ou sur SoundCloud.
            </p>
            <a href={site.soundcloud} target="_blank" rel="noopener" className="retro-link mt-3 inline-block font-mono text-[13px]">
              {site.soundcloud.replace("https://", "")} ↗
            </a>
          </div>
          <iframe
            title="Ma musique sur SoundCloud"
            src={soundcloudPlayer}
            loading="lazy"
            allow="autoplay"
            className="h-[450px] w-full border border-black bg-white"
          />
        </div>

        <p className="pointer-events-none absolute bottom-4 left-4 bg-black px-2 py-1 font-mono text-[12px] text-white">
          fig. 9 — mes œuvres · tableaux et musique
        </p>
      </CoverSection>

      {wheelItems.length ? (
        <CoverSection
          id="contenus"
          aria-labelledby="contenus-titre"
          threshold={0.35}
          className="relative w-full scroll-mt-0 bg-white px-4 pt-14 pb-20 text-black sm:px-8 lg:pt-20"
        >
          <div className="mx-auto max-w-[1100px]">
            <h2
              id="contenus-titre"
              className="font-sans text-[clamp(2rem,4vw,3.6rem)] leading-[1.08] font-bold tracking-[-0.02em] text-white uppercase"
            >
              <span className="bg-black px-2 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                Les contenus du mois
              </span>
            </h2>
            <p className="mt-3 font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-none italic">{monthly.month}</p>
            <FerrisWheelGallery
              className="mt-10"
              items={wheelItems}
              autoplay
              interval={3600}
              scrollToTurn={false}
              aria-label={`Les contenus du mois, ${monthly.month}`}
              labels={{
                onView: "À L'AFFICHE",
                count: "CONTENUS",
                item: "N°",
                help: "Faites glisser la roue ou utilisez ← →",
                unavailable: "Image indisponible",
              }}
            />
          </div>
          <p className="pointer-events-none absolute bottom-4 left-4 bg-black px-2 py-1 font-mono text-[12px] text-white">
            fig. 10 — les contenus du mois · grande roue (21st.dev)
          </p>
        </CoverSection>
      ) : null}
    </>
  )
}
