import Link from "next/link"
import { Brush } from "@/components/blog/brush"
import { MediaFrame } from "@/components/blog/media-frame"
import { formatShort } from "@/lib/format"
import { readingTime, type Post } from "@/lib/posts"

/**
 * Une rubrique de l'accueil, comme « HOW TO NAME YOUR BRAND » sur l'original :
 * grand titre, paragraphe en gras, puis le chiffre au pinceau, le média
 * encadré de bleu et la notice en Courier.
 */
export function PostSection({ post }: { post: Post }) {
  const href = `/articles/${post.slug}`
  return (
    <section id={post.slug} aria-labelledby={`${post.slug}-titre`} className="px-4 py-16 md:py-24">
      <h2
        id={`${post.slug}-titre`}
        className="mx-auto max-w-6xl text-center font-sans text-[clamp(2.1rem,5.2vw,4.4rem)] leading-[0.95] font-bold tracking-[-0.02em] uppercase"
      >
        <Link href={href} className="hover:text-link">
          {post.title}
        </Link>
      </h2>
      <p className="mx-auto mt-8 max-w-[1400px] font-sans text-[1.15rem] leading-[1.18] font-bold md:px-[7%] md:text-[1.4rem]">
        {post.excerpt}
      </p>

      <div className="mx-auto mt-10 grid max-w-[1640px] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,680px)_minmax(0,1fr)] lg:gap-8">
        <div className="flex lg:justify-center" aria-hidden>
          <Brush className="text-[clamp(7rem,17vw,17.5rem)] leading-[0.8]">{post.id}</Brush>
        </div>

        <MediaFrame image={post.cover} video={post.video} href={href} />

        <aside className="max-w-[46ch] font-mono text-[15px] leading-[1.25]">
          <Link href={href} className="retro-link">
            {post.title} | {post.category}
          </Link>
          <p className="mt-0.5">{post.note}</p>
          <p className="mt-0.5">
            Publié le {formatShort(post.date)} · {readingTime(post)} min de lecture
          </p>
          <p className="mt-4">
            →{" "}
            <Link href={href} className="retro-link font-bold">
              Lire l&apos;article
            </Link>
          </p>
          <p className="text-muted-foreground">
            alias :{" "}
            <Link href={`/index.php?id=${post.id}`} prefetch={false} className="retro-link">
              index.php?id={post.id}
            </Link>
          </p>
        </aside>
      </div>
    </section>
  )
}
