import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArticleBody } from "@/components/blog/article-body"
import { Brush } from "@/components/blog/brush"
import { MediaFrame } from "@/components/blog/media-frame"
import { RetroWindow } from "@/components/blog/retro-window"
import { formatLong, formatShort, pad } from "@/lib/format"
import { getNeighbours, getPost, getPosts, readingTime } from "@/lib/posts"

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.dek,
    alternates: { canonical: `/articles/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.dek,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      images: [{ url: post.cover.src, alt: post.cover.alt }],
    },
  }
}

export default async function ArticlePage({ params }: PageProps<"/articles/[slug]">) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()
  const { prev, next } = getNeighbours(post.slug)

  return (
    <article className="pb-24">
      <p className="px-4 pt-8 font-mono text-[14px]">
        <Link href="/" className="retro-link">
          index.php
        </Link>{" "}
        ›{" "}
        <Link href="/#sommaire" className="retro-link">
          articles
        </Link>{" "}
        › ?id={post.id}
      </p>

      <header className="px-4 pt-10 text-center md:pt-14">
        <p className="font-mono text-[15px]">
          N° {pad(post.id)} — {post.category}
        </p>
        <h1 className="mx-auto mt-3 max-w-6xl font-sans text-[clamp(2.4rem,6.4vw,5.6rem)] leading-[0.92] font-bold tracking-[-0.025em] uppercase">
          {post.title}
        </h1>
        <p className="mx-auto mt-6 max-w-4xl font-italic text-[clamp(1.3rem,2.4vw,2rem)] leading-[1.2] italic">{post.dek}</p>
      </header>

      <div className="mx-auto mt-12 grid max-w-[1640px] gap-8 px-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,720px)_minmax(0,1fr)] lg:gap-10">
        <div aria-hidden className="hidden lg:block">
          <div className="sticky top-[var(--sticky-offset)] flex justify-center">
            <Brush reveal={false} className="text-[clamp(10rem,17vw,18rem)] leading-[0.8]">{post.id}</Brush>
          </div>
        </div>

        <div className="min-w-0">
          <MediaFrame image={post.cover} video={post.video} priority sizes="(min-width: 1024px) 720px, 100vw" />
          <div className="mt-12">
            <ArticleBody blocks={post.body} />
          </div>
        </div>

        <aside className="order-first font-mono text-[14px] leading-[1.3] lg:order-none">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 lg:sticky lg:top-[var(--sticky-offset)]">
            <dt>Publié</dt>
            <dd>
              <time dateTime={post.date}>{formatLong(post.date)}</time>
            </dd>
            {post.updated ? (
              <>
                <dt>Modifié</dt>
                <dd>
                  <time dateTime={post.updated}>{formatLong(post.updated)}</time>
                </dd>
              </>
            ) : null}
            <dt>Lecture</dt>
            <dd>{readingTime(post)} min</dd>
            <dt>Rubrique</dt>
            <dd>{post.category}</dd>
            <dt>Mots-clés</dt>
            <dd>{post.tags.join(", ")}</dd>
            <dt>Alias</dt>
            <dd>
              <Link href={`/index.php?id=${post.id}`} prefetch={false} className="retro-link">
                index.php?id={post.id}
              </Link>
            </dd>
          </dl>
        </aside>
      </div>

      <div className="mx-auto mt-20 max-w-[560px] px-4">
        <RetroWindow title="FIN_DE_L_ARTICLE.EXE" draggable={false} closable={false} bodyClassName="bg-win-face px-4 pt-4 pb-3">
          <div className="flex gap-4">
            <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden className="shrink-0">
              <circle cx="16" cy="16" r="14" fill="#1414ff" stroke="#000" />
              <rect x="14" y="13" width="4" height="11" fill="#fff" />
              <rect x="14" y="7" width="4" height="4" fill="#fff" />
            </svg>
            <p className="font-sans text-[14px] text-black">
              Vous avez atteint la fin de l&apos;article n° {pad(post.id)}, publié le {formatShort(post.date)}. Que voulez-vous
              faire ?
            </p>
          </div>
          <nav aria-label="Navigation entre articles" className="mt-5 flex flex-wrap justify-end gap-2">
            {prev ? (
              <Link href={`/articles/${prev.slug}`} className="win-btn" title={prev.title}>
                « Précédent
              </Link>
            ) : null}
            <Link href="/#sommaire" className="win-btn">
              Sommaire
            </Link>
            {next ? (
              <Link href={`/articles/${next.slug}`} className="win-btn font-bold" title={next.title}>
                Suivant »
              </Link>
            ) : null}
          </nav>
        </RetroWindow>
      </div>
    </article>
  )
}
