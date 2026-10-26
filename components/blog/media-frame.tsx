"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

type MediaFrameProps = {
  image: { src: string; alt: string }
  /** Une vidéo YouTube : on montre l'image, l'iframe ne se charge qu'au clic. */
  video?: { youtubeId: string; title: string }
  /** Lien de l'image quand il n'y a pas de vidéo. */
  href?: string
  sizes?: string
  priority?: boolean
  className?: string
}

/** Le cadre bleu de l'original : une image, ou une vidéo qui démarre au clic. */
export function MediaFrame({ image, video, href, sizes = "(min-width: 1024px) 680px, 100vw", priority, className }: MediaFrameProps) {
  const [playing, setPlaying] = React.useState(false)

  const picture = (
    <Image
      src={image.src}
      alt={video ? "" : image.alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
    />
  )

  return (
    <div className={cn("group relative aspect-video w-full overflow-hidden border-4 border-link bg-black", className)}>
      {video && playing ? (
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : video ? (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="absolute inset-0 size-full cursor-pointer text-left"
          aria-label={`Lire la vidéo : ${video.title}`}
        >
          {picture}
          <span className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/75 to-transparent px-4 pt-3 pb-8 font-sans text-[clamp(0.95rem,1.6vw,1.35rem)] font-bold text-white">
            {video.title}
          </span>
          <span className="absolute top-1/2 left-1/2 grid h-[60px] w-[86px] -translate-1/2 place-items-center rounded-[18px] bg-[#ff0000] shadow-lg transition-transform group-hover:scale-110">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="#fff" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="absolute right-3 bottom-3 rounded-full bg-black/70 px-4 py-2 font-sans text-sm font-bold text-white">
            Regarder (youtube-nocookie)
          </span>
        </button>
      ) : href ? (
        <Link href={href} className="absolute inset-0" aria-label={image.alt}>
          {picture}
        </Link>
      ) : (
        picture
      )}
    </div>
  )
}
