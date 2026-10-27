import type { Metadata } from "next"
import { Archivo, Cormorant_Garamond, Courier_Prime, Permanent_Marker, Playfair_Display } from "next/font/google"
import { BrushFilter } from "@/components/blog/brush"
import { SiteFooter } from "@/components/blog/site-footer"
import { TabRail } from "@/components/blog/notebook-tabs"
import { SiteHeader } from "@/components/blog/site-header"
import { site } from "@/lib/site"
import "./globals.css"

// Le logo : une grotesque très grasse qu'on peut condenser (axe wdth).
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo" })
// Le pinceau.
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--font-marker" })
// Le titre du carnet et les onglets : une Garamond à grand contraste, de 300 à 700.
const cormorant = Cormorant_Garamond({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-cormorant" })
// Les sous-titres en italique.
const playfair = Playfair_Display({ subsets: ["latin"], style: "italic", variable: "--font-playfair" })
// Repli pour Courier New quand le système ne l'a pas.
const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-courier-prime" })

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — carnet personnel`, template: `%s — ${site.name}` },
  description: site.description,
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
  openGraph: { siteName: site.name, locale: "fr_FR", type: "website" },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={site.lang}
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${cormorant.variable} ${marker.variable} ${playfair.variable} ${courier.variable} antialiased`}
    >
      <body>
        <BrushFilter />
        <SiteHeader intro={site.intro} wordmark={site.wordmark} />
        <TabRail />
        <main id="contenu">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
