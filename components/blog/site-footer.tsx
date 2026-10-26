import WildHuntFooter from "@/components/ui/wild-hunt-footer"
import { site } from "@/lib/site"

const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif'
const MONO = '"Courier New", Courier, monospace'

/** Le pied de page : le composant Wild Hunt, réglé pour le carnet. */
export function SiteFooter() {
  return (
    <div id="site-footer">
      <WildHuntFooter
        wordmark={site.wordmark}
        tagline="Écrit à la main · publié sans algorithme · archivé pour dans dix ans"
        sideNote="Ouvert en 2026 · mi-rétro, mi-futuriste · page perso propulsée par Next.js"
        columns={[
          {
            title: "Lire",
            links: [
              { label: "Sommaire", href: "/#sommaire" },
              { label: "Archives", href: "/#archives" },
              { label: "Flux RSS", href: "/feed.xml" },
            ],
          },
          {
            title: "Carnet",
            links: [
              { label: "Introduction", href: "/#introduction" },
              { label: "Livre d'or", href: "/#livre-dor" },
              { label: "À propos", href: "/#a-propos" },
            ],
          },
          { title: "Ailleurs", links: site.social.map((s) => ({ ...s })) },
          {
            title: "Contact",
            links: [
              { label: site.email, href: `mailto:${site.email}` },
              { label: "index.php?id=1", href: "/index.php?id=1" },
            ],
          },
        ]}
        colophon="Peinture : Peter Nicolai Arbo, Åsgårdsreien (La Chasse sauvage d'Odin), 1872, Nasjonalmuseet, Oslo — domaine public, via Wikimedia Commons. Photos du carnet : Unsplash, via Lorem Picsum. Le mot du bas est dessiné cellule par cellule, sans police."
        legal={`© 2026 ${site.name} · carnet personnel`}
        fontFamily={SANS}
        monoFamily={MONO}
      />
    </div>
  )
}
