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
        <AsciiEffect
          src="/images/portrait.jpg"
          alt="Portrait en noir et blanc d'un jeune homme aux cheveux bouclés, redessiné en trame binaire verte qui scintille"
          position="50% 25%"
          className="absolute inset-0"
        />
        <p className="pointer-events-none absolute bottom-4 left-4 bg-black px-2 py-1 font-mono text-[12px] text-[#00ff66]">
          fig. 2 — portrait, en trame binaire
        </p>
      </CoverSection>

      <CoverSection id="benjamins" aria-labelledby="benjamins-titre" className="relative h-svh w-full scroll-mt-0 overflow-hidden bg-black">
        <h2 id="benjamins-titre" className="sr-only">
          All about the Benjamins
        </h2>
        <AsciiEffect
          src="/images/franklin.jpg"
          alt="Portrait de Benjamin Franklin redessiné en trame binaire verte qui scintille"
          position="50% 22%"
          className="absolute inset-0"
        />
        <p className="pointer-events-none absolute bottom-4 left-4 bg-black px-2 py-1 font-mono text-[12px] text-[#00ff66]">
          fig. 3 — « All about the Benjamins » · B. Franklin d&apos;après Duplessis (v. 1785)
        </p>
      </CoverSection>

      <CoverSection id="kaaba" aria-labelledby="kaaba-titre" className="relative h-svh w-full scroll-mt-0 overflow-hidden bg-[#e8f3ee]">
        <h2 id="kaaba-titre" className="sr-only">
          La Kaaba, La Mecque
        </h2>
        <AsciiArt className="absolute inset-0" />
        <p className="pointer-events-none absolute bottom-4 left-4 bg-black px-2 py-1 font-mono text-[12px] text-white">
          fig. 4 — La Kaaba, La Mecque · art ASCII animé (21st.dev)
        </p>
      </CoverSection>
    </>
  )
}
