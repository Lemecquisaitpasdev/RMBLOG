import Link from "next/link"
import { cn } from "@/lib/utils"

/**
 * Le logo qui tourne sur lui-même, comme celui de free-game.virgilabloh.com :
 * une rotation Y sans perspective, donc il s'écrase, se retourne en miroir
 * puis revient.
 */
export function Wordmark({ text, className }: { text: string; className?: string }) {
  return (
    <Link href="/" aria-label={`${text}, retour à l'accueil`} className={cn("group inline-block", className)}>
      <span
        aria-hidden
        className="animate-spin-y inline-flex items-start font-wordmark leading-[0.8] font-black tracking-[-0.04em] text-black group-hover:[animation-play-state:paused]"
        style={{ fontVariationSettings: '"wdth" 72' }}
      >
        <span className="text-[clamp(3.25rem,8.2vw,7.25rem)]">{text}</span>
        <span className="mt-[0.1em] ml-[0.04em] text-[clamp(1.1rem,2.4vw,2.1rem)] tracking-[-0.06em]">TM</span>
      </span>
    </Link>
  )
}
