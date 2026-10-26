import Image from "next/image"
import { MediaFrame } from "@/components/blog/media-frame"
import { RichText } from "@/components/blog/rich-text"
import type { Block } from "@/lib/posts"

/** Le corps d'un article : du Times comme une page HTML sans CSS, mais soigné. */
export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="font-serif text-[1.25rem] leading-[1.55] text-black md:text-[1.35rem]">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return (
              <p key={i} className="mt-6 first:mt-0">
                <RichText text={block.text} />
              </p>
            )
          case "h2":
            return (
              <h2
                key={i}
                className="mt-14 mb-2 font-sans text-[clamp(1.6rem,3vw,2.3rem)] leading-none font-bold tracking-[-0.02em] uppercase"
              >
                {block.text}
              </h2>
            )
          case "quote":
            return (
              <figure key={i} className="my-12 border-l-[6px] border-link pl-6">
                <blockquote className="font-sans text-[clamp(1.5rem,2.8vw,2.2rem)] leading-[1.08] font-bold uppercase">
                  &quot;{block.text}&quot;
                </blockquote>
                {block.cite ? <figcaption className="mt-3 font-mono text-[14px]">— {block.cite}</figcaption> : null}
              </figure>
            )
          case "list": {
            const List = block.ordered ? "ol" : "ul"
            return (
              <List
                key={i}
                className={
                  block.ordered
                    ? "mt-6 list-decimal space-y-2 pl-8 marker:font-sans marker:font-bold marker:text-link"
                    : "mt-6 list-[square] space-y-2 pl-8 marker:text-link"
                }
              >
                {block.items.map((item) => (
                  <li key={item}>
                    <RichText text={item} />
                  </li>
                ))}
              </List>
            )
          }
          case "image":
            return (
              <figure key={i} className="my-10">
                <div className="relative aspect-video overflow-hidden border-4 border-link">
                  <Image src={block.src} alt={block.alt} fill sizes="(min-width: 1024px) 720px, 100vw" className="object-cover" />
                </div>
                {block.caption ? <figcaption className="mt-2 font-mono text-[14px]">{block.caption}</figcaption> : null}
              </figure>
            )
          case "video":
            return (
              <figure key={i} className="my-10">
                <MediaFrame
                  image={{ src: `https://i.ytimg.com/vi/${block.youtubeId}/hqdefault.jpg`, alt: block.title }}
                  video={{ youtubeId: block.youtubeId, title: block.title }}
                  sizes="(min-width: 1024px) 720px, 100vw"
                />
                {block.caption ? <figcaption className="mt-2 font-mono text-[14px]">{block.caption}</figcaption> : null}
              </figure>
            )
        }
      })}
    </div>
  )
}
