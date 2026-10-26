import WildHuntFooter from "@/components/ui/wild-hunt-footer"
import { CoverSection } from "@/components/blog/cover-section"
import { site } from "@/lib/site"

const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif'
const MONO = '"Courier New", Courier, monospace'

/** Le pied de page : le composant Wild Hunt, réglé pour le carnet. */
export function SiteFooter() {
  return (
    <CoverSection as="div" id="site-footer" threshold={0.12}>
      <WildHuntFooter
        wordmark={site.wordmark}
        tagline="Écrit à la main · publié sans algorithme · archivé pour dans dix ans"
        sideNote="Ouvert en 2026 · mi-rétro, mi-futuriste · page perso propulsée par Next.js"
        columns={[
          {
            title: "Lire",
            links: [
              { label: "Sommaire", href: "/#sommaire" },
              { label: "Flux RSS", href: "/feed.xml" },
            ],
          },
          {
            title: "Images",
            links: [
              { label: "Portrait", href: "/#portrait" },
              { label: "Les Benjamins", href: "/#benjamins" },
              { label: "La Kaaba", href: "/#kaaba" },
              { label: "Le portefeuille", href: "/#portefeuille" },
              { label: "Mon rêve", href: "/#reve" },
              { label: "Mes jeux vidéo", href: "/#jeux" },
              { label: "Mes aspirations", href: "/#aspirations" },
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
    </CoverSection>
  )
}
