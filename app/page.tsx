import Image from "next/image"
import { Brush } from "@/components/blog/brush"
import { CoverSection } from "@/components/blog/cover-section"
import { Hero } from "@/components/blog/hero"
import { PostSection } from "@/components/blog/post-section"
import { AsciiEffect } from "@/components/ui/ascii-effect"
import { AsciiArt } from "@/components/ui/kaaba"
import { getPosts } from "@/lib/posts"
import { site } from "@/lib/site"

export default function Home() {
  const posts = getPosts()

  return (
    <>
      <Hero />

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
          fig. 2 — « All about the Benjamins » · B. Franklin d&apos;après Duplessis (v. 1785)
        </p>
      </CoverSection>

      <section id="introduction" aria-labelledby="introduction-titre" className="px-4 pt-20 pb-10 text-center md:pt-28">
        <div className="relative mx-auto h-3 max-w-[1320px] overflow-hidden">
          <Image src="/images/hero/447.jpg" alt="" fill sizes="1320px" className="object-cover object-[50%_62%]" />
        </div>
        <h2 id="introduction-titre" className="mt-4 font-sans text-[clamp(2.4rem,5.4vw,4.6rem)] leading-none font-bold tracking-[-0.02em]">
          INTRODUCTION
        </h2>
        <p className="mx-auto mt-6 max-w-[1500px] font-italic text-[clamp(1.35rem,2.5vw,2.1rem)] leading-[1.22] italic">
          Une introduction, et une tentative de tenir un journal à voix haute : partager ce que j&apos;apprends, avec les
          erreurs, les détours et les sources — pour que chacun·e puisse y piocher un guide pas à pas, construit à partir de
          mon expérience.
        </p>
        <Brush as="p" className="mx-auto mt-10 text-[clamp(4rem,14vw,12.5rem)]">
          Penser à
          <br />
          voix haute
        </Brush>
        <p className="mx-auto mt-8 max-w-4xl font-sans text-[clamp(1rem,1.5vw,1.3rem)] font-bold">
          dans le cadre des programmes « notes publiques » et « web lent » de {site.name}™.
        </p>
      </section>

      {posts.map((post) => (
        <PostSection key={post.slug} post={post} />
      ))}

      <CoverSection id="kaaba" aria-labelledby="kaaba-titre" className="relative h-svh w-full scroll-mt-0 overflow-hidden bg-[#e8f3ee]">
        <h2 id="kaaba-titre" className="sr-only">
          La Kaaba, La Mecque
        </h2>
        <AsciiArt className="absolute inset-0" />
        <p className="pointer-events-none absolute bottom-4 left-4 bg-black px-2 py-1 font-mono text-[12px] text-white">
          fig. 3 — La Kaaba, La Mecque · art ASCII animé (21st.dev)
        </p>
      </CoverSection>
    </>
  )
}
