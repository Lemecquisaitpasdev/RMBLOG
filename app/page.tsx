import Image from "next/image"
import { CoverSection } from "@/components/blog/cover-section"
import { Hero } from "@/components/blog/hero"
import { AsciiEffect } from "@/components/ui/ascii-effect"
import { AsciiArt } from "@/components/ui/kaaba"

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
    </>
  )
}
