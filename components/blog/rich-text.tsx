import Link from "next/link"
import type { ReactNode } from "react"

// [libellé](lien) ou **gras**
const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g

/** Transforme le mini-markdown des articles en liens et en gras. */
export function RichText({ text }: { text: string }) {
  const out: ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(TOKEN)) {
    const at = match.index ?? 0
    if (at > last) out.push(text.slice(last, at))
    const [, label, href, bold] = match
    if (bold) {
      out.push(<strong key={at}>{bold}</strong>)
    } else if (href.startsWith("/")) {
      out.push(
        <Link key={at} href={href} className="retro-link">
          {label}
        </Link>,
      )
    } else {
      out.push(
        <a key={at} href={href} className="retro-link" target="_blank" rel="noopener noreferrer">
          {label}
        </a>,
      )
    }
    last = at + match[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return <>{out}</>
}
