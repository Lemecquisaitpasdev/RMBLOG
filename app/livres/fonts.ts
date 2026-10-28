import { Atkinson_Hyperlegible, Libre_Baskerville, Literata, Merriweather } from "next/font/google"

// Les polices de la liseuse, sous licence libre : Literata tient le rôle de Bookerly (la police
// d'Amazon, qui ne se redistribue pas), Merriweather celui de Caecilia, Atkinson celui des polices
// pensées pour la lisibilité. Georgia, Palatino et Helvetica viennent du système, comme sur Kindle.
const literata = Literata({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-literata" })
const merriweather = Merriweather({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-merriweather" })
const baskerville = Libre_Baskerville({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-baskerville" })
const atkinson = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-atkinson" })

export const readerFonts = [literata, merriweather, baskerville, atkinson].map((font) => font.variable).join(" ")
