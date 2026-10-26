import Image from "next/image"
import { CoverSection } from "@/components/blog/cover-section"
import { DreamGallery } from "@/components/blog/dream-gallery"
import { Hero } from "@/components/blog/hero"
import { Portfolio } from "@/components/blog/portfolio"
import { AsciiEffect } from "@/components/ui/ascii-effect"
import { AsciiArt } from "@/components/ui/kaaba"
import { dreamImages } from "@/lib/dream"

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
          fig. 6 — galerie 3D infinie (21st.dev) · paysages de la démo et images choisies
        </p>
      </CoverSection>
    </>
  )
}
