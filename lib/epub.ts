import { strFromU8, unzipSync, type Unzipped } from "fflate"
import type { ReaderBook, ReaderSection, ReaderTocEntry } from "@/lib/reader"

/* ------------------------------------------------------------------ */
/*  Lire un EPUB dans le navigateur : le fichier ne quitte jamais      */
/*  l'appareil. Le contenu est recopié balise par balise depuis une    */
/*  liste fermée (texte, titres, listes, tableaux, images) : ni        */
/*  script, ni style, ni lien vers l'extérieur.                        */
/* ------------------------------------------------------------------ */

export class EpubError extends Error {}

type Item = { id: string; path: string; type: string; properties: string }

const IMAGE_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
}

const BLOCKS = new Set([
  "p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "ul", "ol", "li", "dl", "dt", "dd",
  "table", "thead", "tbody", "tfoot", "tr", "td", "th", "caption", "figure", "figcaption",
])
const INLINE = new Set(["i", "em", "b", "strong", "sup", "sub", "small", "span", "u", "s", "cite", "q", "abbr", "code"])
const VOID = new Set(["br", "hr"])
const DROP = new Set([
  "head", "script", "style", "link", "meta", "title", "iframe", "object", "embed", "form", "input", "button",
  "select", "textarea", "video", "audio", "canvas", "noscript", "template", "math",
])
const OPS = "http://www.idpf.org/2007/ops"
const XLINK = "http://www.w3.org/1999/xlink"

const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const attr = (value: string) => escape(value).replace(/"/g, "&quot;")
const all = (node: Document | Element, name: string) => Array.from(node.getElementsByTagNameNS("*", name))
const epubType = (el: Element) => el.getAttributeNS(OPS, "type") ?? el.getAttribute("epub:type") ?? ""

function decode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/** Chemin dans l'archive d'un lien écrit depuis le fichier `from`. */
function resolve(from: string, href: string) {
  const path = decode(href.split("#")[0])
  if (!path) return from
  const parts = path.startsWith("/") ? [] : from.split("/").slice(0, -1)
  for (const segment of path.split("/")) {
    if (segment === "..") parts.pop()
    else if (segment && segment !== ".") parts.push(segment)
  }
  return parts.join("/")
}

const fragment = (href: string) => {
  const i = href.indexOf("#")
  return i < 0 ? undefined : decode(href.slice(i + 1)) || undefined
}

function parse(source: string, type: DOMParserSupportedType) {
  const doc = new DOMParser().parseFromString(source, type)
  // Beaucoup d'EPUB écrivent du HTML qui n'est pas du XML valide : on le relit en HTML.
  if (type !== "text/html" && doc.getElementsByTagName("parsererror").length) {
    return new DOMParser().parseFromString(source, "text/html")
  }
  return doc
}

function unpack(bytes: Uint8Array): Unzipped {
  try {
    return unzipSync(bytes, { filter: (file) => !/\.(ttf|otf|woff2?|css|js|mp3|mp4|m4a)$/i.test(file.name) })
  } catch {
    throw new EpubError("Ce fichier n'est pas un EPUB lisible.")
  }
}

/** Le paquet : métadonnées, fichiers et ordre de lecture. */
function readPackage(archive: Unzipped) {
  const read = (path: string) => (archive[path] ? strFromU8(archive[path]) : null)

  // Un livre sous DRM chiffre ses pages ; seules les polices peuvent l'être dans un EPUB libre.
  const encryption = read("META-INF/encryption.xml")
  if (encryption) {
    const locked = all(parse(encryption, "application/xml"), "CipherReference").some(
      (ref) => !/\.(ttf|otf|woff2?)$/i.test(ref.getAttribute("URI") ?? ""),
    )
    if (locked) throw new EpubError("Ce livre est protégé (DRM) : la liseuse ne peut pas l'ouvrir.")
  }

  const container = read("META-INF/container.xml")
  const opfPath = container ? all(parse(container, "application/xml"), "rootfile")[0]?.getAttribute("full-path") : null
  const opfSource = opfPath ? read(opfPath) : null
  if (!opfPath || !opfSource) throw new EpubError("Ce fichier n'est pas un EPUB lisible.")
  const opf = parse(opfSource, "application/xml")

  const meta = (name: string) => all(opf, name)[0]?.textContent?.trim() || undefined
  const manifest = new Map<string, Item>()
  for (const el of all(opf, "item")) {
    const id = el.getAttribute("id")
    const href = el.getAttribute("href")
    if (!id || !href) continue
    manifest.set(id, {
      id,
      path: resolve(opfPath, href),
      type: el.getAttribute("media-type") ?? "",
      properties: el.getAttribute("properties") ?? "",
    })
  }

  const coverId = all(opf, "meta").find((el) => el.getAttribute("name") === "cover")?.getAttribute("content")
  const cover =
    [...manifest.values()].find((item) => item.properties.split(/\s+/).includes("cover-image")) ??
    (coverId ? manifest.get(coverId) : undefined)

  return {
    read,
    opf,
    manifest,
    title: meta("title"),
    // « Clarke,Arthur C. » (forme de classement) redevient « Arthur C. Clarke ».
    author:
      all(opf, "creator")
        .map((el) => el.textContent?.trim().replace(/^([^,]+),\s*([^,]+)$/, "$2 $1"))
        .filter(Boolean)
        .join(", ") || undefined,
    lang: meta("language")?.slice(0, 2).toLowerCase(),
    coverPath: cover && cover.type.startsWith("image/") ? cover.path : undefined,
  }
}

/**
 * Les EPUB tirés d'un PDF gardent les numéros de page en paragraphes et coupent les phrases en bas
 * de page : on retire les numéros, et là seulement, on recoud la phrase coupée avec la suivante.
 */
function repair(body: Element) {
  let pageNumbers = 0
  for (const p of all(body, "p")) {
    const text = p.textContent?.trim() ?? ""
    const media = all(p, "img").length + all(p, "image").length
    if (/^\d{1,4}$/.test(text)) pageNumbers++
    if (/^\d{1,4}$/.test(text) || (!text && !media)) p.remove()
  }
  if (!pageNumbers) return
  for (const p of all(body, "p")) {
    if (!p.parentNode) continue
    let next = p.nextElementSibling
    while (next?.localName === "p") {
      const end = p.textContent?.trimEnd() ?? ""
      const start = next.textContent?.trimStart() ?? ""
      if (!end || /[.!?…:;»"”)\]]$/.test(end) || !/^\p{Ll}/u.test(start)) break
      p.append(" ", ...Array.from(next.childNodes))
      next.remove()
      next = p.nextElementSibling
    }
  }
}

/** La langue annoncée par le fichier se trompe parfois (« EN » pour un roman français) : le texte tranche. */
function guessLang(sample: string, declared?: string) {
  const count = (re: RegExp) => sample.match(re)?.length ?? 0
  const fr = count(/\b(le|la|les|des|une|est|que|qui|dans|pour|avec|elle|nous|vous)\b/gi)
  const en = count(/\b(the|and|of|to|is|that|with|was|for|he|she|you)\b/gi)
  const enough = sample.length / 400
  if (fr > enough && fr > en * 2) return "fr"
  if (en > enough && en > fr * 2) return "en"
  return declared ?? "fr"
}

const imageType = (path: string) => IMAGE_TYPES[path.split(".").pop()?.toLowerCase() ?? ""]

/** Titre, auteur et couverture : de quoi ranger le livre sur l'étagère de l'appareil. */
export async function epubInfo(file: Blob) {
  const archive = unpack(new Uint8Array(await file.arrayBuffer()))
  const pkg = readPackage(archive)
  const type = pkg.coverPath ? imageType(pkg.coverPath) : undefined
  return {
    title: pkg.title,
    author: pkg.author,
    cover: pkg.coverPath && type && archive[pkg.coverPath] ? new Blob([archive[pkg.coverPath] as BlobPart], { type }) : undefined,
  }
}

/** Le livre entier, prêt pour la liseuse. Les images deviennent des adresses blob: à libérer avec `urls`. */
export async function readEpub(file: Blob, key: string, fallbackTitle: string): Promise<{ book: ReaderBook; urls: string[] }> {
  const archive = unpack(new Uint8Array(await file.arrayBuffer()))
  const pkg = readPackage(archive)
  const urls: string[] = []
  const images = new Map<string, string>()
  const image = (path: string) => {
    if (images.has(path)) return images.get(path)
    const type = imageType(path)
    if (!type || !archive[path]) return undefined
    const url = URL.createObjectURL(new Blob([archive[path] as BlobPart], { type }))
    urls.push(url)
    images.set(path, url)
    return url
  }

  // Ordre de lecture.
  const spineEl = all(pkg.opf, "spine")[0]
  const spine = (spineEl ? all(spineEl, "itemref") : [])
    .filter((ref) => ref.getAttribute("linear") !== "no")
    .map((ref) => pkg.manifest.get(ref.getAttribute("idref") ?? ""))
    .filter((item): item is Item => !!item && /html/.test(item.type) && !!archive[item.path])
  if (!spine.length) throw new EpubError("Ce livre ne contient aucune page lisible.")
  const sectionOf = new Map(spine.map((item, i) => [item.path, i]))

  // Pages de l'édition papier : page-map (EPUB 2) ou page-list (EPUB 3).
  const pageLabels = new Map<string, string>()
  const addPage = (from: string, href: string | null, label: string | null | undefined) => {
    if (href && label?.trim()) pageLabels.set(`${resolve(from, href)}#${fragment(href) ?? ""}`, label.trim())
  }
  const pageMap = pkg.manifest.get(spineEl?.getAttribute("page-map") ?? "")
  const pageMapSource = pageMap ? pkg.read(pageMap.path) : null
  if (pageMap && pageMapSource) {
    for (const el of all(parse(pageMapSource, "application/xml"), "page")) addPage(pageMap.path, el.getAttribute("href"), el.getAttribute("name"))
  }

  // Table des matières : nav (EPUB 3) ou toc.ncx (EPUB 2).
  const toc: ReaderTocEntry[] = []
  const addEntry = (from: string, href: string | null, label: string | null | undefined, depth: number) => {
    const section = href ? sectionOf.get(resolve(from, href)) : undefined
    const text = label?.replace(/\s+/g, " ").trim()
    if (section !== undefined && text) toc.push({ label: text, depth, section, anchor: fragment(href!) })
  }
  const nav = [...pkg.manifest.values()].find((item) => item.properties.split(/\s+/).includes("nav"))
  const navSource = nav ? pkg.read(nav.path) : null
  if (nav && navSource) {
    const doc = parse(navSource, "application/xhtml+xml")
    const navs = all(doc, "nav")
    const walk = (list: Element, depth: number) => {
      for (const li of Array.from(list.children).filter((el) => el.localName === "li")) {
        const a = Array.from(li.children).find((el) => el.localName === "a" || el.localName === "span")
        addEntry(nav.path, a?.getAttribute("href") ?? null, a?.textContent, depth)
        const sub = Array.from(li.children).find((el) => el.localName === "ol")
        if (sub) walk(sub, depth + 1)
      }
    }
    const tocNav = navs.find((el) => epubType(el).includes("toc")) ?? navs[0]
    const tocList = tocNav ? Array.from(tocNav.children).find((el) => el.localName === "ol") : undefined
    if (tocList) walk(tocList, 0)
    for (const pageNav of navs.filter((el) => epubType(el).includes("page-list"))) {
      for (const a of all(pageNav, "a")) addPage(nav.path, a.getAttribute("href"), a.textContent)
    }
  }
  const ncx = pkg.manifest.get(spineEl?.getAttribute("toc") ?? "") ?? [...pkg.manifest.values()].find((item) => item.type === "application/x-dtbncx+xml")
  const ncxSource = ncx ? pkg.read(ncx.path) : null
  if (!toc.length && ncx && ncxSource) {
    const doc = parse(ncxSource, "application/xml")
    const walk = (parent: Element, depth: number) => {
      for (const point of Array.from(parent.children).filter((el) => el.localName === "navPoint")) {
        const label = Array.from(point.children).find((el) => el.localName === "navLabel")?.textContent
        const content = Array.from(point.children).find((el) => el.localName === "content")
        addEntry(ncx.path, content?.getAttribute("src") ?? null, label, depth)
        walk(point, depth + 1)
      }
    }
    const navMap = all(doc, "navMap")[0]
    if (navMap) walk(navMap, 0)
  }

  // Table des matières trop maigre (un EPUB converti à la hâte) : on la refait avec les titres des chapitres.
  const sparse = toc.length < 3 && spine.length > 5
  const headings: ReaderTocEntry[] = []
  let sample = ""
  const sections: ReaderSection[] = spine.map((item, index) => {
    const doc = parse(pkg.read(item.path) ?? "", /\.html?$/i.test(item.path) && !/xhtml/.test(item.type) ? "text/html" : "application/xhtml+xml")
    const body = doc.body ?? all(doc, "body")[0] ?? doc.documentElement
    repair(body)
    const heading = Array.from(body.getElementsByTagNameNS("*", "*"))
      .find((el) => /^h[1-3]$/i.test(el.localName))
      ?.textContent?.replace(/\s+/g, " ")
      .trim()
    const named = heading && heading.length <= 80 ? heading : undefined
    const docTitle = all(doc, "title")[0]?.textContent?.trim()
    if (named) headings.push({ label: named, depth: 0, section: index })
    const text = (body.textContent ?? "").replace(/\s+/g, " ")
    if (sample.length < 20000) sample += text.slice(0, 20000 - sample.length)
    const title =
      toc.find((entry) => entry.section === index)?.label ??
      named ??
      (docTitle && !/^(index|untitled|unknown|cover)$/i.test(docTitle) ? docTitle : undefined) ??
      `Partie ${index + 1}`
    return { title, html: sanitize(body, item.path), chars: text.length }
  })
  if (sparse && headings.length > toc.length) toc.splice(0, toc.length, ...headings)

  function sanitize(body: Element, path: string) {
    let headings = 0
    let lettrine = false
    let quoted = 0
    const startLabel = pageLabels.get(`${path}#`)

    const link = (href: string) => {
      if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return null // pas de lien vers l'extérieur
      const section = sectionOf.get(href.startsWith("#") ? path : resolve(path, href))
      return section === undefined ? null : { section, anchor: fragment(href), local: section === sectionOf.get(path) }
    }

    const walk = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return escape(node.nodeValue ?? "")
      if (node.nodeType !== Node.ELEMENT_NODE) return ""
      const el = node as Element
      const tag = el.localName.toLowerCase()
      if (DROP.has(tag)) return ""

      const id = el.getAttribute("id")
      const type = epubType(el)
      const pageLabel = id ? pageLabels.get(`${path}#${id}`) : undefined
      const breakLabel = type.includes("pagebreak") ? (el.getAttribute("title") ?? el.getAttribute("aria-label") ?? el.textContent) : null
      const label = pageLabel ?? breakLabel?.trim()
      // Les ancres (renvois, table des matières) : posées sur la balise gardée, sinon sur un repère vide.
      const page = label ? `<span data-page="${attr(label)}"></span>` : ""
      const named = id ? ` data-a="${attr(id)}"` : ""
      const marker = page + (id ? `<span${named}></span>` : "")
      if (breakLabel !== null) return marker

      if (tag === "img" || tag === "svg") {
        const source =
          tag === "img"
            ? el.getAttribute("src")
            : (() => {
                const inner = all(el, "image")[0]
                return inner?.getAttributeNS(XLINK, "href") ?? inner?.getAttribute("href") ?? inner?.getAttribute("xlink:href")
              })()
        const url = source ? image(resolve(path, source)) : undefined
        return url ? `${page}<img${named} src="${attr(url)}" alt="${attr(el.getAttribute("alt") ?? "")}">` : marker
      }
      if (VOID.has(tag)) return `${page}<${tag}${named}>`

      if (/^h[1-3]$/.test(tag)) headings++
      let extra = ""
      if (tag === "p" && headings && !lettrine && !quoted) {
        // La lettrine des débuts de chapitre : premier vrai paragraphe après le titre.
        const text = el.textContent?.trim() ?? ""
        // Une épigraphe tient souvent tout entière dans un gras ou un italique ; un simple <span> ne compte pas.
        const only = el.children.length === 1 ? el.children[0] : null
        const wrapped = !!only && ["b", "strong", "i", "em"].includes(only.localName) && only.textContent?.trim() === text
        if (text.length > 120 && !wrapped && /^\p{L}/u.test(text)) {
          extra = " data-lettrine"
          lettrine = true
        }
      }
      if (tag === "blockquote") quoted++
      const inner = Array.from(el.childNodes, walk).join("")
      if (tag === "blockquote") quoted--

      if (tag === "a") {
        const href = el.getAttribute("href")
        const target = href ? link(href) : null
        if (!target) return marker + inner
        const text = el.textContent?.trim() ?? ""
        const block = el.closest("p, div, li, td, dd, aside")
        // Appel de note : un chiffre ou un astérisque renvoyant plus bas dans le même fichier.
        const isNote =
          type.includes("noteref") ||
          (target.local && /^[[(]?(\d{1,3}|[*†‡]{1,3}|[a-z])[\])]?$/i.test(text) && !block?.textContent?.trimStart().startsWith(text))
        const body = isNote && !/<sup/.test(inner) ? `<sup>${inner}</sup>` : inner
        const to = target.anchor ? ` data-to="${attr(target.anchor)}"` : ""
        return `${page}<a${named} data-go="${target.section}"${to}${isNote ? " data-note" : ""}>${body}</a>`
      }

      if (BLOCKS.has(tag) || INLINE.has(tag)) {
        // Les blocs vides servent d'espacements dans la mise en page de l'éditeur : on les retire.
        const empty = !/\S/.test(inner.replace(/<span data-(?:a|page)="[^"]*"><\/span>/g, ""))
        if (empty && tag !== "td" && tag !== "th") return marker + inner
        let cells = ""
        if (tag === "td" || tag === "th") {
          for (const name of ["colspan", "rowspan"]) {
            const value = Number(el.getAttribute(name))
            if (Number.isInteger(value) && value > 1 && value < 100) cells += ` ${name}="${value}"`
          }
        }
        return `${page}<${tag}${named}${extra}${cells}>${inner}</${tag}>`
      }

      // Balise inconnue (section, article, font, center…) : on garde son contenu.
      return marker + inner
    }

    const start = startLabel ? `<span data-page="${attr(startLabel)}"></span>` : ""
    return start + Array.from(body.childNodes, walk).join("")
  }

  const numericPages = [...pageLabels.values()].map(Number).filter(Number.isFinite)
  return {
    urls,
    book: {
      key,
      title: pkg.title ?? fallbackTitle,
      author: pkg.author ?? "",
      cover: pkg.coverPath ? image(pkg.coverPath) : undefined,
      lang: guessLang(sample, pkg.lang),
      printPages: numericPages.length ? Math.max(...numericPages) : undefined,
      sections,
      toc,
    },
  }
}
