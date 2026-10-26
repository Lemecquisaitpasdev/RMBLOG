import Image from "next/image"
import Link from "next/link"
import { ArchiveTable } from "@/components/blog/archive-table"
import { Badges } from "@/components/blog/badges"
import { Brush } from "@/components/blog/brush"
import { Guestbook } from "@/components/blog/guestbook"
import { Hero } from "@/components/blog/hero"
import { Marquee } from "@/components/blog/marquee"
import { PostSection } from "@/components/blog/post-section"
import { AsciiArt } from "@/components/ui/kaaba"
import { formatShort } from "@/lib/format"
import { getPosts, getPostsByDate, lastUpdate } from "@/lib/posts"
import { site } from "@/lib/site"

export default function Home() {
  const posts = getPosts()
  const byDate = getPostsByDate()
  const latest = byDate[0]
  const updated = lastUpdate()

  return (
    <>
      <Hero lastUpdate={updated} firstDate={byDate.at(-1)?.date ?? updated} />

      <div className="mt-6 lg:mt-24">
        <Marquee
          items={[
            `Nouvel article : ${latest.title} (${formatShort(latest.date)})`,
            "Le livre d'or est ouvert, signez-le",
            "Ce site est optimisé pour Netscape Navigator 4.0 et tous les navigateurs de 2026",
            "Aucun cookie, aucun traceur, aucun algorithme",
            `Dernière mise à jour : ${formatShort(updated)}`,
          ]}
        />
      </div>

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

      <section id="archives" aria-labelledby="archives-titre" className="px-4 py-16 md:py-24">
        <h2 id="archives-titre" className="text-center font-sans text-[clamp(2.1rem,5.2vw,4.4rem)] leading-none font-bold tracking-[-0.02em]">
          ARCHIVES.PHP
        </h2>
        <p className="mx-auto mt-6 mb-10 max-w-3xl text-center font-italic text-[clamp(1.2rem,2vw,1.6rem)] italic">
          Tout le carnet, du plus récent au plus ancien. Rien n&apos;est supprimé, tout est daté.
        </p>
        <ArchiveTable posts={byDate} />
      </section>

      <section id="livre-dor" aria-labelledby="livre-dor-titre" className="px-4 py-16 md:py-24">
        <h2 id="livre-dor-titre" className="text-center font-sans text-[clamp(2.1rem,5.2vw,4.4rem)] leading-none font-bold tracking-[-0.02em]">
          LIVRE D&apos;OR
        </h2>
        <p className="mx-auto mt-6 mb-12 max-w-3xl text-center font-italic text-[clamp(1.2rem,2vw,1.6rem)] italic">
          Un mot, une correction, une vidéo qui vous a servi de mentor : signez, c&apos;est gratuit.
        </p>
        <div className="mx-auto max-w-6xl">
          <Guestbook />
        </div>
      </section>

      <section id="a-propos" aria-labelledby="a-propos-titre" className="px-4 pt-16 pb-28 md:pt-24">
        <h2 id="a-propos-titre" className="text-center font-sans text-[clamp(2.1rem,5.2vw,4.4rem)] leading-none font-bold tracking-[-0.02em]">
          À PROPOS
        </h2>
        <div className="mx-auto mt-10 grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div>
            <p className="font-sans text-[1.15rem] leading-[1.2] font-bold md:text-[1.35rem]">
              {site.name} est le carnet personnel de {site.author}. On y trouve des notes, des essais et des archives, publiés
              au rythme d&apos;un article par mois, à peu près. Le design rend hommage au site « Free Game » de Virgil Abloh et
              aux pages perso en PHP du début des années 2000.
            </p>
            <p className="mt-6 font-mono text-[15px] leading-[1.3]">
              Pour écrire : <Link href="/#livre-dor" className="retro-link">le livre d&apos;or</Link>, ou{" "}
              <a href={`mailto:${site.email}`} className="retro-link">
                {site.email}
              </a>
              . Pour suivre : le{" "}
              <a href="/feed.xml" className="retro-link">
                flux RSS
              </a>{" "}
              ou la lettre « Post-Scriptum ».
            </p>
          </div>
          <figure>
            <div className="relative aspect-[3/2] w-full overflow-hidden border-4 border-link bg-[#e8f3ee]">
              <AsciiArt className="absolute inset-0" />
            </div>
            <figcaption className="mt-2 font-mono text-[14px] leading-[1.3]">
              La Kaaba, La Mecque — en art ASCII animé (recette « kaaba », 21st.dev).
            </figcaption>
          </figure>
        </div>
        <div className="mx-auto mt-12 max-w-6xl font-mono text-[14px] leading-[1.3]">
          <p className="font-bold">colophon.txt</p>
          <p className="mt-1 max-w-[80ch]">
            Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4 et shadcn/ui. Bandeau 3D : TiltedGridHero.
            Pied de page : WildHuntFooter. Art ASCII : AsciiEffect (Canvas2D) et la vidéo « kaaba ». Polices : Helvetica,
            Courier, Times — et Permanent Marker pour le pinceau.
          </p>
          <div className="mt-5">
            <Badges />
          </div>
        </div>
      </section>
    </>
  )
}
