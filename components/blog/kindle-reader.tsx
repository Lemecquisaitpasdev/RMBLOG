"use client"

import * as React from "react"
import Link from "next/link"
import type { Book } from "@/lib/books"

/* ------------------------------------------------------------------ */
/*  La liseuse : une page à la fois, comme une Kindle. On tourne en    */
/*  touchant les bords, au clavier ou d'un glissé ; « Aa » règle la    */
/*  police, la taille, la mise en page, le thème et la lumière.        */
/* ------------------------------------------------------------------ */

type ThemeKey = "blanc" | "sepia" | "vert" | "noir"

const THEMES: Record<ThemeKey, { label: string; bg: string; fg: string; muted: string; line: string }> = {
  blanc: { label: "Blanc", bg: "#ffffff", fg: "#141414", muted: "#6e6e6e", line: "rgba(0,0,0,.12)" },
  sepia: { label: "Sépia", bg: "#f6efdf", fg: "#4b3b27", muted: "#8b765a", line: "rgba(75,59,39,.18)" },
  vert: { label: "Vert", bg: "#dcebd5", fg: "#1f2d1e", muted: "#58704f", line: "rgba(31,45,30,.16)" },
  noir: { label: "Noir", bg: "#000000", fg: "#d4d4d4", muted: "#8a8a8a", line: "rgba(255,255,255,.16)" },
}

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
const SPACINGS = [{ label: "Serré", value: 1.35 }, { label: "Normal", value: 1.6 }, { label: "Aéré", value: 1.9 }]
const MARGINS = [{ label: "Étroites", value: 14 }, { label: "Normales", value: 32 }, { label: "Larges", value: 60 }]
const WORDS_PER_MINUTE = 230

type Settings = {
  font: FontKey
  size: number
  spacing: number
  margins: number
  align: "left" | "justify"
  theme: ThemeKey
  brightness: number
  warmth: number
}

const DEFAULTS: Settings = { font: "literata", size: 3, spacing: 1, margins: 1, align: "justify", theme: "blanc", brightness: 1, warmth: 0 }
const SETTINGS_KEY = "liseuse:reglages"
const positionKey = (slug: string) => `liseuse:${slug}`

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

const words = (text: string) => text.split(/\s+/).filter(Boolean).length
const minutes = (count: number) => {
  const m = Math.max(1, Math.round(count / WORDS_PER_MINUTE))
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`
}

type Layout = { pages: number; stride: number; chapterStarts: number[] }
type FooterMode = "chapter" | "book" | "page"

/** Rendue côté client seulement (voir reader-client.tsx) : elle lit ses réglages dès le premier rendu. */
export function KindleReader({ book }: { book: Book }) {
  const [settings, setSettings] = React.useState<Settings>(() => load(SETTINGS_KEY, DEFAULTS))
  const [page, setPage] = React.useState(0)
  const [layout, setLayout] = React.useState<Layout>({ pages: 1, stride: 0, chapterStarts: [] })
  const [chrome, setChrome] = React.useState(true)
  const [panel, setPanel] = React.useState<null | "aa" | "toc">(null)
  const [tab, setTab] = React.useState<"police" | "page" | "theme" | "lumiere">("police")
  const [footer, setFooter] = React.useState<FooterMode>("chapter")
  const viewport = React.useRef<HTMLDivElement>(null)
  const flow = React.useRef<HTMLDivElement>(null)
  const chapterRefs = React.useRef<(HTMLElement | null)[]>([])
  // Part du livre déjà lue : sert à retrouver sa place quand la mise en page change.
  const progress = React.useRef(load(positionKey(book.slug), { progress: 0 }).progress)
  const pointer = React.useRef<{ x: number; y: number } | null>(null)

  const theme = THEMES[settings.theme]
  const font = FONTS.find((f) => f.key === settings.font) ?? FONTS[0]
  const margin = MARGINS[settings.margins].value
  const chapterWords = React.useMemo(() => book.chapters.map((c) => words(c.paragraphs.join(" "))), [book])
  const totalWords = chapterWords.reduce((a, b) => a + b, 0)

  // Réglages enregistrés dans ce navigateur.
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

  // Mise en page : le texte coule dans des colonnes de la largeur de l'écran ; une colonne = une page.
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
    const stride = width + gap
    // Tout se mesure depuis la première page : le décalage de la page courante s'annule.
    const origin = fl.firstElementChild?.getBoundingClientRect().left ?? 0
    const end = fl.querySelector("[data-end]")?.getBoundingClientRect().left ?? origin
    const pages = Math.max(1, Math.floor((end - origin) / stride + 0.001) + 1)
    const chapterStarts = chapterRefs.current.map((el) =>
      el ? Math.max(0, Math.round((el.getBoundingClientRect().left - origin) / stride)) : 0,
    )
    setLayout({ pages, stride, chapterStarts })
    setPage(Math.min(pages - 1, Math.round(progress.current * (pages - 1))))
  }, [margin])

  React.useLayoutEffect(() => {
    measure()
    let timer = 0
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(measure, 80)
    })
    if (viewport.current) ro.observe(viewport.current)
    document.fonts?.ready.then(measure)
    return () => {
      ro.disconnect()
      window.clearTimeout(timer)
    }
  }, [measure, settings.font, settings.size, settings.spacing, settings.align])

  const goTo = React.useCallback(
    (next: number) => {
      const target = Math.max(0, Math.min(layout.pages - 1, next))
      setPage(target)
      setChrome(false) // comme sur Kindle, tourner la page range les menus
      progress.current = layout.pages > 1 ? target / (layout.pages - 1) : 0
      save(positionKey(book.slug), { progress: progress.current })
    },
    [layout.pages, book.slug],
  )

  // Clavier : flèches, Page suivante / précédente, espace ; Échap ferme le menu ouvert.
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return
      if (event.key === "Escape") {
        if (panel) setPanel(null)
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
  }, [page, panel, goTo])

  // Un glissé tourne la page ; un toucher en haut montre les menus, à gauche recule, ailleurs avance.
  const onPointerDown = (event: React.PointerEvent) => {
    pointer.current = { x: event.clientX, y: event.clientY }
  }
  const onPointerUp = (event: React.PointerEvent) => {
    const start = pointer.current
    pointer.current = null
    if (!start) return
    if (panel) {
      setPanel(null)
      return
    }
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      goTo(page + (dx < 0 ? 1 : -1))
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    if (y < 0.18) setChrome((c) => !c)
    else if (x < 0.3) goTo(page - 1)
    else goTo(page + 1)
  }

  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }))

  // Où en est-on : chapitre courant, temps restant.
  const chapterIndex = layout.chapterStarts.reduce((current, start, i) => (start <= page ? i : current), 0)
  const wordsPerPage = totalWords / Math.max(1, layout.pages)
  const chapterEnd = layout.chapterStarts[chapterIndex + 1] ?? layout.pages
  const percent = Math.round(((page + 1) / layout.pages) * 100)
  const footerText = {
    chapter: `Temps restant dans le chapitre : ${minutes(Math.max(0, chapterEnd - page - 1) * wordsPerPage)}`,
    book: `Temps restant dans le livre : ${minutes(Math.max(0, layout.pages - page - 1) * wordsPerPage)}`,
    page: `Page ${page + 1} sur ${layout.pages}`,
  }[footer]

  const textStyle: React.CSSProperties = {
    fontFamily: font.css,
    fontSize: SIZES[settings.size],
    lineHeight: SPACINGS[settings.spacing].value,
    textAlign: settings.align,
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col select-none"
      style={{ background: theme.bg, color: theme.fg, filter: settings.brightness < 1 ? `brightness(${settings.brightness})` : undefined }}
      role="region"
      aria-roledescription="liseuse"
      aria-label={`${book.title}, ${book.author}`}
    >
      {/* Lumière chaude : un voile ambré, comme sur une Kindle Paperwhite. */}
      {settings.warmth > 0 ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30 mix-blend-multiply"
          style={{ background: "#ff9d42", opacity: settings.warmth * 0.32 }}
        />
      ) : null}

      {/* Barre du haut */}
      <header
        className={`relative z-40 flex h-14 shrink-0 items-center gap-2 border-b px-2 transition-opacity duration-200 sm:px-4 ${chrome ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ borderColor: theme.line, background: theme.bg }}
      >
        <Link href="/livres" className="flex h-10 items-center gap-1.5 rounded-md px-2 text-[14px] hover:opacity-70" aria-label="Retour à la bibliothèque">
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">Bibliothèque</span>
        </Link>
        <p className="min-w-0 flex-1 truncate text-center font-sans text-[14px] font-medium">{book.title}</p>
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

      {/* La page */}
      <div
        data-page-area
        className="relative min-h-0 flex-1 cursor-default"
        style={{ paddingLeft: margin, paddingRight: margin, paddingTop: 28, paddingBottom: 12 }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div ref={viewport} className="mx-auto h-full max-w-[44rem] overflow-hidden">
          <div
            ref={flow}
            className="h-full [column-fill:auto] hyphens-auto"
            style={{ ...textStyle, transform: `translateX(${-page * layout.stride}px)` }}
            lang="fr"
          >
            {/* Page de titre */}
            <section className="flex h-full flex-col items-center justify-center text-center [-webkit-column-break-after:always] [break-after:column]">
              {book.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={book.cover} alt={`Couverture de ${book.title}`} className="mb-8 max-h-[58%] max-w-[70%] object-contain shadow-[0_12px_30px_-14px_rgba(0,0,0,.5)]" />
              ) : null}
              <h1 className="text-[1.6em] leading-tight font-semibold">{book.title}</h1>
              <p className="mt-3 text-[1em] italic" style={{ color: theme.muted }}>
                {book.author}
                {book.year ? `, ${book.year}` : ""}
              </p>
              {book.edition === "Extraits" ? (
                <p className="mt-6 text-[0.7em] tracking-[0.12em] uppercase" style={{ color: theme.muted }}>
                  Extraits choisis
                </p>
              ) : null}
            </section>

            {book.chapters.map((chapter, i) => (
              <section
                key={i}
                ref={(el) => {
                  chapterRefs.current[i] = el
                }}
                className="[-webkit-column-break-before:always] [break-before:column]"
              >
                <h2 className="mt-[2.4em] mb-[1.6em] text-center text-[1.15em] leading-snug font-semibold">
                  {chapter.title}
                </h2>
                {chapter.paragraphs.map((paragraph, k) => (
                  <p key={k} className={`m-0 [orphans:2] [widows:2] ${k === 0 ? "" : "indent-[1.4em]"}`}>
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
            <span data-end className="block h-px" />
          </div>
        </div>
      </div>

      {/* Bas de page : comme sur Kindle, un toucher change l'indication. */}
      <footer className="relative z-20 flex h-9 shrink-0 items-center justify-between gap-4 px-4 font-sans text-[12px] sm:px-6" style={{ color: theme.muted }}>
        <button
          type="button"
          onClick={() => setFooter(footer === "chapter" ? "book" : footer === "book" ? "page" : "chapter")}
          className="truncate rounded-sm text-left hover:opacity-70"
          aria-label={`${footerText}. Changer l'indication`}
        >
          {footerText}
        </button>
        <span className="tabular-nums">{percent} %</span>
      </footer>

      {/* Barre du bas avec le curseur, quand les menus sont visibles. */}
      <div
        className={`absolute inset-x-0 bottom-9 z-40 border-t px-4 py-3 transition-opacity duration-200 sm:px-6 ${chrome && !panel ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ borderColor: theme.line, background: theme.bg }}
      >
        <p className="mb-2 truncate font-sans text-[12px]" style={{ color: theme.muted }}>
          {book.chapters[chapterIndex]?.title}
        </p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={Math.max(0, layout.pages - 1)}
            value={page}
            onChange={(event) => goTo(Number(event.target.value))}
            aria-label="Aller à la page"
            className="h-1 flex-1 cursor-pointer"
            style={{ accentColor: theme.fg }}
          />
          <span className="font-sans text-[12px] tabular-nums" style={{ color: theme.muted }}>
            {page + 1} / {layout.pages}
          </span>
        </div>
      </div>

      {/* Table des matières */}
      {panel === "toc" ? (
        <div
          role="dialog"
          aria-label="Table des matières"
          className="absolute top-14 right-0 bottom-0 z-50 w-full max-w-sm overflow-y-auto border-l font-sans shadow-[-20px_0_40px_-30px_rgba(0,0,0,.5)]"
          style={{ background: theme.bg, borderColor: theme.line }}
        >
          <p className="px-5 pt-5 pb-3 text-[12px] tracking-[0.12em] uppercase" style={{ color: theme.muted }}>
            Table des matières
          </p>
          <ol>
            {book.chapters.map((chapter, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    goTo(layout.chapterStarts[i] ?? 0)
                    setPanel(null)
                  }}
                  className="flex w-full items-baseline justify-between gap-4 border-t px-5 py-3 text-left text-[14px] hover:opacity-70"
                  style={{ borderColor: theme.line, fontWeight: i === chapterIndex ? 600 : 400 }}
                >
                  <span>{chapter.title}</span>
                  <span className="tabular-nums" style={{ color: theme.muted }}>
                    {(layout.chapterStarts[i] ?? 0) + 1}
                  </span>
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
          className="absolute inset-x-0 bottom-0 z-50 mx-auto max-w-xl rounded-t-2xl border font-sans shadow-[0_-20px_50px_-30px_rgba(0,0,0,.6)] sm:bottom-auto sm:top-16 sm:right-4 sm:left-auto sm:w-[26rem] sm:rounded-2xl"
          style={{ background: theme.bg, borderColor: theme.line }}
        >
          <div className="flex border-b text-[13px]" style={{ borderColor: theme.line }} role="tablist">
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

          <div className="max-h-[60svh] overflow-y-auto p-5 text-[14px]">
            {tab === "police" ? (
              <>
                <ul className="grid grid-cols-2 gap-2">
                  {FONTS.map((f) => (
                    <li key={f.key}>
                      <button
                        type="button"
                        aria-pressed={settings.font === f.key}
                        onClick={() => update({ font: f.key })}
                        className="w-full rounded-lg border px-3 py-2 text-left"
                        style={{ borderColor: settings.font === f.key ? theme.fg : theme.line, borderWidth: settings.font === f.key ? 2 : 1 }}
                      >
                        <span className="block text-[17px]" style={{ fontFamily: f.css }}>
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
                <p className="mt-5 mb-2 text-[12px] tracking-[0.1em] uppercase" style={{ color: theme.muted }}>
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
              <div className="grid gap-5">
                {(
                  [
                    ["Interligne", SPACINGS, "spacing"],
                    ["Marges", MARGINS, "margins"],
                  ] as const
                ).map(([label, options, key]) => (
                  <div key={key}>
                    <p className="mb-2 text-[12px] tracking-[0.1em] uppercase" style={{ color: theme.muted }}>
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
                  <p className="mb-2 text-[12px] tracking-[0.1em] uppercase" style={{ color: theme.muted }}>
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
                      className="grid aspect-[3/4] w-full place-items-center rounded-md border font-serif text-[18px]"
                      style={{ background: THEMES[key].bg, color: THEMES[key].fg, borderColor: THEMES[key].line }}
                    >
                      Aa
                    </span>
                    <span className="text-[12px]">{THEMES[key].label}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {tab === "lumiere" ? (
              <div className="grid gap-5">
                <label className="grid gap-2">
                  <span className="text-[12px] tracking-[0.1em] uppercase" style={{ color: theme.muted }}>
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
                  <span className="text-[12px] tracking-[0.1em] uppercase" style={{ color: theme.muted }}>
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
  )
}
