"use client"

import * as React from "react"
import Link from "next/link"
import type { ReaderBook } from "@/lib/reader"

/* ------------------------------------------------------------------ */
/*  La liseuse : une Kindle posée sur la table, une page à la fois.    */
/*  On tourne en touchant les bords, au clavier ou d'un glissé ; un    */
/*  toucher en haut montre les menus ; « Aa » règle la police, la      */
/*  taille, la mise en page, le thème et la lumière. Les appels de     */
/*  note s'ouvrent dans une bulle, les liens mènent dans le livre.     */
/* ------------------------------------------------------------------ */

type ThemeKey = "blanc" | "sepia" | "vert" | "noir"

const THEMES: Record<ThemeKey, { label: string; bg: string; fg: string; muted: string; line: string }> = {
  blanc: { label: "Blanc", bg: "#fbfbf9", fg: "#141414", muted: "#6b6b6b", line: "rgba(0,0,0,.12)" },
  sepia: { label: "Sépia", bg: "#f6efdf", fg: "#4b3b27", muted: "#8b765a", line: "rgba(75,59,39,.18)" },
  vert: { label: "Vert", bg: "#dcebd5", fg: "#1f2d1e", muted: "#58704f", line: "rgba(31,45,30,.16)" },
  noir: { label: "Noir", bg: "#000000", fg: "#d4d4d4", muted: "#8a8a8a", line: "rgba(255,255,255,.16)" },
}

const DEVICES = { noire: "Noire", jade: "Jade" } as const
type DeviceKey = keyof typeof DEVICES

const FONTS = [
  { key: "literata", label: "Literata", hint: "comme Bookerly", css: "var(--font-literata), Georgia, serif" },
  { key: "baskerville", label: "Baskerville", css: "var(--font-baskerville), Baskerville, Georgia, serif" },
  { key: "merriweather", label: "Merriweather", hint: "comme Caecilia", css: "var(--font-merriweather), Georgia, serif" },
  { key: "georgia", label: "Georgia", css: "Georgia, 'Times New Roman', serif" },
  { key: "palatino", label: "Palatino", css: "'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif" },
  { key: "helvetica", label: "Helvetica", css: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { key: "atkinson", label: "Atkinson", hint: "lisibilité", css: "var(--font-atkinson), 'Helvetica Neue', Arial, sans-serif" },
] as const

type FontKey = (typeof FONTS)[number]["key"]

const SIZES = [14, 16, 18, 20, 22, 25, 28, 32, 36]
const SPACINGS = [{ label: "Serré", value: 1.35 }, { label: "Normal", value: 1.55 }, { label: "Aéré", value: 1.85 }]
const MARGINS = [{ label: "Étroites", value: 16 }, { label: "Normales", value: 30 }, { label: "Larges", value: 54 }]
const CHARS_PER_MINUTE = 230 * 6 // 230 mots par minute, environ six signes par mot

type FooterMode = "page" | "chapter" | "book"

type Settings = {
  font: FontKey
  size: number
  spacing: number
  margins: number
  align: "left" | "justify"
  theme: ThemeKey
  brightness: number
  warmth: number
  footer: FooterMode
  device: DeviceKey
}

const DEFAULTS: Settings = {
  font: "literata",
  size: 2,
  spacing: 1,
  margins: 1,
  align: "justify",
  theme: "blanc",
  brightness: 1,
  warmth: 0,
  footer: "page",
  device: "noire",
}
const SETTINGS_KEY = "liseuse:reglages"
const positionKey = (key: string) => `liseuse:${key}`

function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // navigation privée : les réglages valent pour cette visite
  }
}

const duration = (chars: number) => {
  const m = Math.max(1, Math.round(chars / CHARS_PER_MINUTE))
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`
}

/** Où aller après la prochaine mise en page : une part du chapitre, une ancre, ou sa dernière page. */
type Target = { fraction?: number; anchor?: string; end?: boolean }
type Layout = { pages: number; stride: number; tocPages: Record<number, number>; printPages: [number, string][]; perPage: number }
type Spot = { section: number; fraction: number; label: string }

const INLINE = new Set(["SPAN", "A", "B", "I", "EM", "STRONG", "SUP", "SUB", "SMALL", "U", "S", "CITE", "Q", "ABBR", "CODE"])
const byAnchor = (root: HTMLElement, anchor: string) => root.querySelector(`[data-a="${CSS.escape(anchor)}"]`)

/** Rendue côté client seulement (voir reader-client.tsx) : elle lit ses réglages dès le premier rendu. */
export function KindleReader({ book, backHref = "/livres" }: { book: ReaderBook; backHref?: string }) {
  const last = book.sections.length - 1
  const [settings, setSettings] = React.useState<Settings>(() => load(SETTINGS_KEY, DEFAULTS))
  const [saved] = React.useState(() => load(positionKey(book.key), { section: 0, fraction: 0 }))
  const [section, setSection] = React.useState(() => Math.min(last, Math.max(0, Math.floor(saved.section) || 0)))
  const [page, setPage] = React.useState(0)
  const [layout, setLayout] = React.useState<Layout>({ pages: 1, stride: 0, tocPages: {}, printPages: [], perPage: 1500 })
  const [chrome, setChrome] = React.useState(false)
  const [panel, setPanel] = React.useState<null | "aa" | "toc">(null)
  const [tab, setTab] = React.useState<"police" | "page" | "theme" | "lumiere">("police")
  const [note, setNote] = React.useState<null | { html: string; section: number; anchor: string }>(null)
  const [back, setBack] = React.useState<Spot | null>(null)
  const [scrub, setScrub] = React.useState<number | null>(null)
  const viewport = React.useRef<HTMLDivElement>(null)
  const flow = React.useRef<HTMLDivElement>(null)
  const target = React.useRef<Target>({ fraction: saved.fraction })
  const perPage = React.useRef(1500)
  const measured = React.useRef(false)
  const pointer = React.useRef<{ x: number; y: number } | null>(null)

  const theme = THEMES[settings.theme]
  const font = FONTS.find((f) => f.key === settings.font) ?? FONTS[0]
  const margin = MARGINS[settings.margins].value
  const current = book.sections[section]

  // Signes lus avant chaque chapitre : situe la lecture dans tout le livre.
  const before = React.useMemo(() => {
    const sums = [0]
    for (const s of book.sections) sums.push(sums[sums.length - 1] + s.chars)
    return sums
  }, [book])
  const total = before[before.length - 1]

  React.useEffect(() => {
    save(SETTINGS_KEY, settings)
  }, [settings])

  // La liseuse prend tout l'écran : la page derrière ne défile plus.
  React.useEffect(() => {
    const html = document.documentElement
    const previous = html.style.overflow
    html.style.overflow = "hidden"
    return () => {
      html.style.overflow = previous
    }
  }, [])

  // Mise en page : le chapitre coule dans des colonnes de la largeur de l'écran ; une colonne = une page.
  const measure = React.useCallback(() => {
    const vp = viewport.current
    const fl = flow.current
    if (!vp || !fl) return
    const width = vp.clientWidth
    const height = vp.clientHeight
    const gap = margin * 2
    fl.style.width = `${width}px`
    fl.style.height = `${height}px`
    fl.style.columnWidth = `${width}px`
    fl.style.columnGap = `${gap}px`
    fl.style.setProperty("--page-h", `${height}px`)
    const stride = width + gap
    // Tout se mesure depuis le bord de la première page : le décalage de la page courante s'annule.
    const origin = fl.getBoundingClientRect().left
    const pageOf = (el: Element) => Math.max(0, Math.floor((el.getBoundingClientRect().left - origin + 1) / stride))
    const end = fl.querySelector("[data-end]")
    const pages = end ? pageOf(end) + 1 : 1

    const tocPages: Record<number, number> = {}
    book.toc.forEach((entry, i) => {
      if (entry.section !== section) return
      const el = entry.anchor ? byAnchor(fl, entry.anchor) : null
      tocPages[i] = el ? pageOf(el) : 0
    })
    const printPages = Array.from(fl.querySelectorAll("[data-page]"), (el) => [pageOf(el), el.getAttribute("data-page") ?? ""] as [number, string])
    const chars = book.sections[section].chars
    if (chars > 400 && pages > 1) perPage.current = chars / pages

    const t = target.current
    const anchored = t.anchor ? byAnchor(fl, t.anchor) : null
    const wanted = anchored ? pageOf(anchored) : t.end ? pages - 1 : Math.round((t.fraction ?? 0) * (pages - 1))
    const next = Math.min(pages - 1, Math.max(0, wanted))
    target.current = { fraction: pages > 1 ? next / (pages - 1) : 0 }
    measured.current = true
    setLayout({ pages, stride, tocPages, printPages, perPage: perPage.current })
    setPage(next)
  }, [margin, section, book])

  React.useLayoutEffect(() => {
    measure()
    let timer = 0
    const later = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(measure, 80)
    }
    const ro = new ResizeObserver(later)
    if (viewport.current) ro.observe(viewport.current)
    // Les images du chapitre changent la mise en page en arrivant.
    const fl = flow.current
    fl?.addEventListener("load", later, true)
    document.fonts?.ready.then(measure)
    return () => {
      ro.disconnect()
      fl?.removeEventListener("load", later, true)
      window.clearTimeout(timer)
    }
  }, [measure, settings.font, settings.size, settings.spacing, settings.align])

  /** Va à un chapitre (et un endroit de ce chapitre) ; la mise en page dira quelle page. */
  const show = React.useCallback(
    (next: number, where: Target) => {
      target.current = where
      setNote(null)
      setChrome(false)
      if (next === section) measure()
      else setSection(Math.min(last, Math.max(0, next)))
    },
    [section, last, measure],
  )

  const goTo = React.useCallback(
    (next: number) => {
      if (next >= layout.pages) {
        if (section < last) show(section + 1, { fraction: 0 })
        return
      }
      if (next < 0) {
        if (section > 0) show(section - 1, { end: true })
        return
      }
      target.current = { fraction: layout.pages > 1 ? next / (layout.pages - 1) : 0 }
      setPage(next)
      setNote(null)
      setChrome(false) // comme sur Kindle, tourner la page range les menus
    },
    [layout.pages, section, last, show],
  )

  // Où en est-on : page de l'édition papier si le livre la donne, sinon page estimée ; pourcentage.
  const fractionOf = (p: number) => (layout.pages > 1 ? p / (layout.pages - 1) : 0)
  const position = before[section] + current.chars * (page / layout.pages)
  const read = before[section] + current.chars * ((page + 1) / layout.pages)
  const percent = total ? Math.min(100, Math.round((read / total) * 100)) : 100
  const estimated = Math.floor(position / layout.perPage) + 1
  const printed = layout.printPages.filter(([p]) => p <= page).at(-1)?.[1]
  const pageLabel = printed ?? String(estimated)
  const pageCount = book.printPages ?? Math.max(estimated, Math.ceil(total / layout.perPage))
  const tocIndex = book.toc.reduce(
    (found, entry, i) => (entry.section < section || (entry.section === section && (layout.tocPages[i] ?? 0) <= page) ? i : found),
    -1,
  )
  const chapterTitle = book.toc[tocIndex]?.label ?? current.title
  const footerText = {
    page: `Page ${pageLabel}`,
    chapter: `Temps restant dans le chapitre : ${duration(current.chars * (1 - (page + 1) / layout.pages))}`,
    book: `Temps restant dans le livre : ${duration(total - read)}`,
  }[settings.footer]

  // La page en cours est retenue dans ce navigateur.
  React.useEffect(() => {
    if (!measured.current) return
    save(positionKey(book.key), { section, fraction: layout.pages > 1 ? page / (layout.pages - 1) : 0, percent })
  }, [book.key, section, page, layout.pages, percent])

  /** Suit un lien du livre ; un appel de note s'ouvre dans une bulle, sans quitter la page. */
  const follow = (link: Element) => {
    const to = link.getAttribute("data-to") ?? undefined
    const next = Number(link.getAttribute("data-go"))
    if (!Number.isInteger(next)) return
    if (link.hasAttribute("data-note") && next === section && to && flow.current) {
      const el = byAnchor(flow.current, to)
      const box = el && INLINE.has(el.tagName) ? el.closest("p, div, li, dd, blockquote, td") : el
      if (box && flow.current.contains(box) && box.textContent?.trim()) {
        setNote({ html: box.innerHTML, section: next, anchor: to })
        return
      }
    }
    setBack({ section, fraction: fractionOf(page), label: pageLabel })
    show(next, to ? { anchor: to } : { fraction: 0 })
  }

  // Clavier : flèches, Page suivante / précédente, espace ; Échap ferme ce qui est ouvert.
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return
      if (event.key === "Escape") {
        if (note) setNote(null)
        else if (panel) setPanel(null)
        else setChrome(false)
        return
      }
      if (panel) return
      if (["ArrowRight", "PageDown", " "].includes(event.key)) {
        event.preventDefault()
        goTo(page + 1)
      } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
        event.preventDefault()
        goTo(page - 1)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [page, panel, note, goTo])

  // Un glissé tourne la page ; un toucher en haut montre les menus, à gauche recule, ailleurs avance.
  const onPointerDown = (event: React.PointerEvent) => {
    pointer.current = { x: event.clientX, y: event.clientY }
  }
  const onPointerUp = (event: React.PointerEvent) => {
    const start = pointer.current
    pointer.current = null
    if (!start) return
    if (panel || note) {
      setPanel(null)
      setNote(null)
      return
    }
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      goTo(page + (dx < 0 ? 1 : -1))
      return
    }
    const link = event.target instanceof Element ? event.target.closest("a[data-go]") : null
    if (link) {
      follow(link)
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    if (y < 0.15) setChrome((c) => !c)
    else if (x < 0.3) goTo(page - 1)
    else goTo(page + 1)
  }

  // Le curseur parcourt tout le livre ; on y va en le relâchant.
  const slider = scrub ?? (total ? Math.round((position / total) * 1000) : 0)
  const sectionAt = (value: number) => {
    const goal = (value / 1000) * total
    let s = 0
    while (s < last && before[s + 1] <= goal) s++
    return { section: s, fraction: book.sections[s].chars ? Math.min(1, (goal - before[s]) / book.sections[s].chars) : 0 }
  }
  const commitScrub = () => {
    if (scrub === null) return
    const spot = sectionAt(scrub)
    setScrub(null)
    setBack({ section, fraction: fractionOf(page), label: pageLabel })
    show(spot.section, { fraction: spot.fraction })
    setChrome(true)
  }

  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }))

  // La table des matières s'ouvre sur le chapitre en cours.
  const tocList = React.useRef<HTMLOListElement>(null)
  React.useEffect(() => {
    if (panel === "toc") tocList.current?.querySelector("[aria-current]")?.scrollIntoView({ block: "center" })
  }, [panel])

  const textStyle: React.CSSProperties = {
    fontFamily: font.css,
    fontSize: SIZES[settings.size],
    lineHeight: SPACINGS[settings.spacing].value,
    textAlign: settings.align,
  }

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-paper select-none"
      role="region"
      aria-roledescription="liseuse"
      aria-label={`${book.title}${book.author ? `, ${book.author}` : ""}`}
    >
      <Link
        href={backHref}
        className="liseuse-sortie absolute top-5 left-6 items-center gap-2 font-mono text-[12px] tracking-[0.08em] text-black/70 uppercase hover:text-black"
      >
        ← Mes livres
      </Link>

      <div className="liseuse-appareil" data-device={settings.device}>
        <div
          className="liseuse-ecran relative flex flex-col overflow-hidden"
          style={{
            background: theme.bg,
            color: theme.fg,
            filter: settings.brightness < 1 ? `brightness(${settings.brightness})` : undefined,
          }}
        >
          {/* Lumière chaude : un voile ambré, comme sur une Kindle Paperwhite. */}
          {settings.warmth > 0 ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[60] mix-blend-multiply"
              style={{ background: "#ff9d42", opacity: settings.warmth * 0.32 }}
            />
          ) : null}

          {/* La page */}
          <div
            data-page-area
            className="relative min-h-0 flex-1 cursor-default touch-none"
            style={{ paddingLeft: margin, paddingRight: margin, paddingTop: 30, paddingBottom: 6 }}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            <div ref={viewport} className="h-full overflow-hidden">
              <div
                ref={flow}
                className="liseuse-texte h-full"
                lang={book.lang}
                style={{ ...textStyle, transform: `translateX(${-page * layout.stride}px)` }}
              >
                {current.titlePage ? (
                  <section className="flex h-full flex-col items-center justify-center text-center">
                    {book.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={book.cover} alt={`Couverture de ${book.title}`} className="mt-0 mb-8 max-h-[58%] max-w-[70%] shadow-[0_12px_30px_-14px_rgba(0,0,0,.5)]" />
                    ) : null}
                    <h1 className="m-0 text-[1.6em]">{book.title}</h1>
                    <p className="mt-3 indent-0 italic" style={{ color: theme.muted }}>
                      {book.author}
                      {book.year ? `, ${book.year}` : ""}
                    </p>
                    {book.extracts ? (
                      <p className="mt-6 indent-0 text-[0.7em] tracking-[0.12em] uppercase" style={{ color: theme.muted }}>
                        Extraits choisis
                      </p>
                    ) : null}
                  </section>
                ) : current.html !== undefined ? (
                  <div dangerouslySetInnerHTML={{ __html: current.html }} />
                ) : (
                  <>
                    <header className="liseuse-chapitre">
                      {current.number ? <p className="liseuse-chapitre-numero">{current.number}</p> : null}
                      <h2>{current.title}</h2>
                    </header>
                    {current.paragraphs?.map((paragraph, k) => (
                      <p key={k} data-lettrine={k === 0 && /^\p{L}/u.test(paragraph) ? "" : undefined}>
                        {paragraph}
                      </p>
                    ))}
                  </>
                )}
                <span data-end className="block h-px" />
              </div>
            </div>
          </div>

          {/* Bas de page, comme sur Kindle : « Page 32 » à gauche, le pourcentage à droite. Un toucher change l'indication. */}
          <footer
            className="relative z-20 flex h-8 shrink-0 items-start justify-between gap-4 font-sans text-[11px] tabular-nums"
            style={{ color: theme.muted, paddingLeft: margin, paddingRight: margin }}
          >
            <button
              type="button"
              onClick={() => update({ footer: settings.footer === "page" ? "chapter" : settings.footer === "chapter" ? "book" : "page" })}
              className="truncate rounded-sm text-left hover:opacity-70"
              aria-label={`${footerText}. Changer l'indication`}
            >
              {footerText}
            </button>
            <span>{percent}%</span>
          </footer>

          {/* Retour après un lien suivi */}
          {back && !chrome && !panel ? (
            <button
              type="button"
              onClick={() => {
                setBack(null)
                show(back.section, { fraction: back.fraction })
              }}
              className="absolute bottom-9 left-1/2 z-30 -translate-x-1/2 rounded-full border px-4 py-1.5 font-sans text-[12px] shadow-[0_8px_20px_-12px_rgba(0,0,0,.5)]"
              style={{ background: theme.bg, borderColor: theme.line }}
            >
              ← Revenir à la page {back.label}
            </button>
          ) : null}

          {/* Barre du haut, quand on touche le haut de l'écran */}
          <header
            className={`absolute inset-x-0 top-0 z-40 flex h-12 items-center gap-1 border-b px-1.5 font-sans transition-opacity duration-150 ${chrome ? "opacity-100" : "pointer-events-none opacity-0"}`}
            style={{ borderColor: theme.line, background: theme.bg }}
          >
            <Link href={backHref} className="grid size-10 place-items-center rounded-md hover:opacity-70" aria-label="Retour à mes livres">
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <p className="min-w-0 flex-1 truncate text-center text-[13px] font-medium">{book.title}</p>
            <button
              type="button"
              onClick={() => setPanel(panel === "toc" ? null : "toc")}
              aria-expanded={panel === "toc"}
              aria-label="Table des matières"
              className="grid size-10 place-items-center rounded-md hover:opacity-70"
            >
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 6h16M4 12h16M4 18h11" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setPanel(panel === "aa" ? null : "aa")}
              aria-expanded={panel === "aa"}
              aria-label="Affichage : police, mise en page, thème et lumière"
              className="grid h-10 min-w-10 place-items-center rounded-md px-2 font-serif text-[18px] hover:opacity-70"
            >
              <span aria-hidden>
                A<span className="text-[13px]">a</span>
              </span>
            </button>
          </header>

          {/* Barre du bas : chapitre, curseur, page */}
          <div
            className={`absolute inset-x-0 bottom-0 z-40 border-t px-4 pt-3 pb-3 font-sans transition-opacity duration-150 ${chrome && !panel ? "opacity-100" : "pointer-events-none opacity-0"}`}
            style={{ borderColor: theme.line, background: theme.bg }}
          >
            <p className="mb-2 truncate text-[12px] font-medium">
              {scrub === null ? chapterTitle : book.sections[sectionAt(scrub).section].title}
            </p>
            <input
              type="range"
              min={0}
              max={1000}
              value={slider}
              disabled={!total}
              onChange={(event) => setScrub(Number(event.target.value))}
              onPointerUp={commitScrub}
              onKeyUp={commitScrub}
              onBlur={commitScrub}
              aria-label="Aller dans le livre"
              aria-valuetext={`${percent} %`}
              className="h-1 w-full cursor-pointer"
              style={{ accentColor: theme.fg }}
            />
            <p className="mt-2 flex justify-between text-[11px] tabular-nums" style={{ color: theme.muted }}>
              <span>
                Page {pageLabel} sur {pageCount}
              </span>
              <span>{scrub === null ? percent : Math.round(scrub / 10)}%</span>
            </p>
          </div>

          {/* Note de bas de page, dans une bulle */}
          {note ? (
            <div
              role="dialog"
              aria-label="Note"
              className="absolute inset-x-3 bottom-3 z-50 flex max-h-[48%] flex-col rounded-lg border font-sans shadow-[0_18px_40px_-20px_rgba(0,0,0,.6)]"
              style={{ background: theme.bg, borderColor: theme.line }}
            >
              <div
                className="liseuse-texte min-h-0 overflow-y-auto px-4 pt-4 pb-2 text-[0.9em]"
                style={{ fontFamily: font.css, fontSize: Math.max(14, SIZES[settings.size] - 3), lineHeight: 1.45 }}
                lang={book.lang}
                dangerouslySetInnerHTML={{ __html: note.html }}
              />
              <div className="flex justify-end gap-1 border-t px-2 py-1.5 text-[12px]" style={{ borderColor: theme.line }}>
                <button
                  type="button"
                  className="rounded-md px-3 py-1.5 hover:opacity-70"
                  onClick={() => {
                    setBack({ section, fraction: fractionOf(page), label: pageLabel })
                    show(note.section, { anchor: note.anchor })
                  }}
                >
                  Aller à la note
                </button>
                <button type="button" className="rounded-md px-3 py-1.5 font-medium hover:opacity-70" onClick={() => setNote(null)}>
                  Fermer
                </button>
              </div>
            </div>
          ) : null}

          {/* Table des matières */}
          {panel === "toc" ? (
            <div
              role="dialog"
              aria-label="Table des matières"
              className="absolute inset-x-0 top-12 bottom-0 z-50 overflow-y-auto font-sans"
              style={{ background: theme.bg }}
            >
              <p className="px-5 pt-5 pb-3 text-[11px] tracking-[0.12em] uppercase" style={{ color: theme.muted }}>
                Table des matières
              </p>
              <ol ref={tocList}>
                {book.toc.map((entry, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      aria-current={i === tocIndex ? "location" : undefined}
                      onClick={() => {
                        setPanel(null)
                        show(entry.section, entry.anchor ? { anchor: entry.anchor } : { fraction: 0 })
                      }}
                      className="flex w-full items-baseline gap-4 border-t py-3 pr-5 text-left text-[13px] leading-snug hover:opacity-70"
                      style={{
                        borderColor: theme.line,
                        paddingLeft: 20 + Math.min(entry.depth, 4) * 14,
                        fontWeight: i === tocIndex ? 600 : entry.depth ? 400 : 500,
                      }}
                    >
                      {entry.label}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {/* Le menu « Aa » */}
          {panel === "aa" ? (
            <div
              role="dialog"
              aria-label="Affichage"
              className="absolute inset-x-0 bottom-0 z-50 flex max-h-[78%] flex-col rounded-t-xl border-t font-sans shadow-[0_-20px_50px_-30px_rgba(0,0,0,.6)]"
              style={{ background: theme.bg, borderColor: theme.line }}
            >
              <div className="flex shrink-0 border-b text-[12px]" style={{ borderColor: theme.line }} role="tablist">
                {(
                  [
                    ["police", "Police"],
                    ["page", "Mise en page"],
                    ["theme", "Thème"],
                    ["lumiere", "Lumière"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={tab === key}
                    onClick={() => setTab(key)}
                    className="flex-1 border-b-2 py-3"
                    style={{ borderColor: tab === key ? theme.fg : "transparent", fontWeight: tab === key ? 600 : 400 }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="min-h-0 overflow-y-auto p-4 text-[13px]">
                {tab === "police" ? (
                  <>
                    <ul className="grid grid-cols-2 gap-2">
                      {FONTS.map((f) => (
                        <li key={f.key}>
                          <button
                            type="button"
                            aria-pressed={settings.font === f.key}
                            onClick={() => update({ font: f.key })}
                            className="h-full w-full rounded-lg border px-3 py-2 text-left"
                            style={{ borderColor: settings.font === f.key ? theme.fg : theme.line, borderWidth: settings.font === f.key ? 2 : 1 }}
                          >
                            <span className="block text-[16px]" style={{ fontFamily: f.css }}>
                              {f.label}
                            </span>
                            {"hint" in f ? (
                              <span className="text-[11px]" style={{ color: theme.muted }}>
                                {f.hint}
                              </span>
                            ) : null}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 mb-2 text-[11px] tracking-[0.1em] uppercase" style={{ color: theme.muted }}>
                      Taille
                    </p>
                    <div className="flex items-center gap-3">
                      <button type="button" aria-label="Plus petit" onClick={() => update({ size: Math.max(0, settings.size - 1) })} className="grid size-10 place-items-center rounded-lg border text-[13px]" style={{ borderColor: theme.line, fontFamily: font.css }}>
                        A
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={SIZES.length - 1}
                        value={settings.size}
                        onChange={(event) => update({ size: Number(event.target.value) })}
                        aria-label="Taille du texte"
                        className="flex-1"
                        style={{ accentColor: theme.fg }}
                      />
                      <button type="button" aria-label="Plus grand" onClick={() => update({ size: Math.min(SIZES.length - 1, settings.size + 1) })} className="grid size-10 place-items-center rounded-lg border text-[21px]" style={{ borderColor: theme.line, fontFamily: font.css }}>
                        A
                      </button>
                    </div>
                  </>
                ) : null}

                {tab === "page" ? (
                  <div className="grid gap-4">
                    {(
                      [
                        ["Interligne", SPACINGS, "spacing"],
                        ["Marges", MARGINS, "margins"],
                      ] as const
                    ).map(([label, options, key]) => (
                      <div key={key}>
                        <p className="mb-2 text-[11px] tracking-[0.1em] uppercase" style={{ color: theme.muted }}>
                          {label}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {options.map((option, i) => (
                            <button
                              key={option.label}
                              type="button"
                              aria-pressed={settings[key] === i}
                              onClick={() => update({ [key]: i })}
                              className="rounded-lg border py-2"
                              style={{ borderColor: settings[key] === i ? theme.fg : theme.line, borderWidth: settings[key] === i ? 2 : 1 }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div>
                      <p className="mb-2 text-[11px] tracking-[0.1em] uppercase" style={{ color: theme.muted }}>
                        Alignement
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            ["left", "À gauche"],
                            ["justify", "Justifié"],
                          ] as const
                        ).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            aria-pressed={settings.align === value}
                            onClick={() => update({ align: value })}
                            className="rounded-lg border py-2"
                            style={{ borderColor: settings.align === value ? theme.fg : theme.line, borderWidth: settings.align === value ? 2 : 1 }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {tab === "theme" ? (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-4 gap-2">
                      {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={settings.theme === key}
                          onClick={() => update({ theme: key })}
                          className="flex flex-col items-center gap-2 rounded-lg border p-2"
                          style={{ borderColor: settings.theme === key ? theme.fg : theme.line, borderWidth: settings.theme === key ? 2 : 1 }}
                        >
                          <span
                            className="grid aspect-[3/4] w-full place-items-center rounded-md border font-serif text-[17px]"
                            style={{ background: THEMES[key].bg, color: THEMES[key].fg, borderColor: THEMES[key].line }}
                          >
                            Aa
                          </span>
                          <span className="text-[12px]">{THEMES[key].label}</span>
                        </button>
                      ))}
                    </div>
                    <div>
                      <p className="mb-2 text-[11px] tracking-[0.1em] uppercase" style={{ color: theme.muted }}>
                        Couleur de la liseuse <span className="normal-case tracking-normal">(grand écran)</span>
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(DEVICES) as DeviceKey[]).map((key) => (
                          <button
                            key={key}
                            type="button"
                            aria-pressed={settings.device === key}
                            onClick={() => update({ device: key })}
                            className="flex items-center justify-center gap-2 rounded-lg border py-2"
                            style={{ borderColor: settings.device === key ? theme.fg : theme.line, borderWidth: settings.device === key ? 2 : 1 }}
                          >
                            <span className="size-3.5 rounded-full" style={{ background: key === "jade" ? "#8bb0a7" : "#141415" }} aria-hidden />
                            {DEVICES[key]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {tab === "lumiere" ? (
                  <div className="grid gap-4">
                    <label className="grid gap-2">
                      <span className="text-[11px] tracking-[0.1em] uppercase" style={{ color: theme.muted }}>
                        Luminosité
                      </span>
                      <span className="flex items-center gap-3">
                        <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="currentColor"><circle cx="12" cy="12" r="4" /></svg>
                        <input
                          type="range"
                          min={35}
                          max={100}
                          value={Math.round(settings.brightness * 100)}
                          onChange={(event) => update({ brightness: Number(event.target.value) / 100 })}
                          className="flex-1"
                          style={{ accentColor: theme.fg }}
                        />
                        <svg viewBox="0 0 24 24" className="size-6" aria-hidden fill="currentColor"><circle cx="12" cy="12" r="5" /><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                      </span>
                    </label>
                    <label className="grid gap-2">
                      <span className="text-[11px] tracking-[0.1em] uppercase" style={{ color: theme.muted }}>
                        Lumière chaude
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="size-4 rounded-full border" style={{ background: "#ffffff", borderColor: theme.line }} aria-hidden />
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={Math.round(settings.warmth * 100)}
                          onChange={(event) => update({ warmth: Number(event.target.value) / 100 })}
                          className="flex-1"
                          style={{ accentColor: "#e0892f" }}
                        />
                        <span className="size-4 rounded-full" style={{ background: "#ffb067" }} aria-hidden />
                      </span>
                    </label>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
        <span className="liseuse-logo" aria-hidden>
          liseuse
        </span>
      </div>
    </div>
  )
}
