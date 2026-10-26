"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/* ── AsciiEffect ─────────────────────────────────────────────────
 * A Canvas2D re-implementation of the 21st.dev ASCII editor pipeline
 * (https://21st.dev/community/ascii). A photo is cut into a grid of
 * `cellSize` cells; each cell is sampled once (average colour and
 * luminance) and redrawn every frame as a primitive picked by
 * `renderMode`, then tinted, blurred, run through post-effects, lit
 * and masked:
 *
 *   1. background   bgMode / bgBlur / bgOpacity
 *   2. grid         sample + colour adjustments, Sobel edges
 *   3. primitives   renderMode, coverage, density, invert, edgeEmphasis
 *   4. colour       brightness → contrast → saturation → grayscale
 *                   (+ toneCurve), tint via overlayBlend, blurType
 *   5. post fx      pfx.* where enabled, at intensity 0–100
 *   6. lights       glow at each normalised point
 *   7. mask         reveal back to the plain photo
 *   8. motion       animStyle × animSpeed × animIntensity
 *
 * Everything heavy (resampling, edges, background) happens once per size;
 * a frame only loops over the cells and a handful of full-canvas blits.
 * The loop throttles to `fps`, stops off-screen, and draws a single still
 * frame when the visitor prefers reduced motion.
 * ─────────────────────────────────────────────────────────────── */

export type AsciiFx = { enabled: boolean; intensity: number }

export type AsciiRenderMode =
  | "characters"
  | "dither"
  | "mosaic"
  | "pixel"
  | "dots"
  | "cross"
  | "diamond"
  | "voxel"
  | "lego"
  | "mixed"
  | "lines"
  | "diagonal"
  | "braille"
  | "disco"
  | "hexdump"
  | "matrix"
  | "rings"
  | "hearts"
  | "stars"
  | "hexagons"
  | "triangles"
  | "bubbles"
  | "hatch"
  | "contour"
  | "halfblocks"

export type AsciiAnimStyle = "wave" | "pulse" | "shimmer" | "ripple" | "flicker"
export type AsciiBlurType = "off" | "gaussian" | "motion" | "radial" | "tilt" | "lens" | "progressive"
export type AsciiBgMode = "blur" | "solid" | "original" | "none"
export type AsciiPostFx =
  | "scanLines"
  | "vignette"
  | "bloom"
  | "chromatic"
  | "filmGrain"
  | "glitch"
  | "halftone"
  | "pixelate"
  | "filmDust"

/** A light: x/y are 0–1 across the frame; radius ≤ 1 is a share of the short side, above 1 it is px. */
export type AsciiLight = { x: number; y: number; radius: number; intensity: number; color?: string }

export type AsciiParams = {
  renderMode: AsciiRenderMode
  cellSize: number
  /** A named set (standard, binary, blocks, detailed, simple, hex, katakana, arrows), "custom", or the glyphs themselves. */
  charSet: string
  customChars: string
  /** % of cells drawn. */
  coverage: number
  /** −100…100, scales how much each primitive fills its cell. */
  density: number
  invert: boolean
  /** 0–100, how much Sobel edges are lifted. */
  edgeEmphasis: number
  /** −100…100. */
  brightness: number
  /** %, 100 is neutral. */
  contrast: number
  /** %, 100 is neutral. */
  saturation: number
  /** %. */
  grayscale: number
  toneCurve: { x: number; y: number }[]
  tint: string
  tintOpacity: number
  overlayBlend: GlobalCompositeOperation
  styleBlend: GlobalCompositeOperation
  bgMode: AsciiBgMode
  bgBlur: number
  bgOpacity: number
  /** Colour for bgMode "solid". Defaults to black. */
  bgColor?: string
  blurType: AsciiBlurType
  blurAmount: number
  blurAngle: number
  blurCenterX: number
  blurCenterY: number
  lensFocus: number
  tiltFocus: number
  tiltFeather: number
  tiltPosition: number
  progressivePosition: number
  progressiveReverse: boolean
  directionalBothSides: boolean
  pfx: Record<AsciiPostFx, AsciiFx>
  lights: { enabled: boolean; points: AsciiLight[] }
  mask: {
    enabled: boolean
    invert: boolean
    dataUrl: string | null
    tool?: string
    shapes?: unknown[]
    brushSize?: number
    showOverlay?: boolean
  }
  animated: boolean
  animStyle: AsciiAnimStyle
  animSpeed: AsciiFx
  animIntensity: AsciiFx
}

/** "All about the Benjamins": binary-green dither with a CRT finish. */
export const BENJAMINS: AsciiParams = {
  pfx: {
    bloom: { enabled: true, intensity: 60 },
    glitch: { enabled: true, intensity: 20 },
    filmDust: { enabled: false, intensity: 20 },
    halftone: { enabled: false, intensity: 20 },
    pixelate: { enabled: false, intensity: 15 },
    vignette: { enabled: true, intensity: 38 },
    chromatic: { enabled: true, intensity: 40 },
    filmGrain: { enabled: true, intensity: 40 },
    scanLines: { enabled: true, intensity: 28 },
  },
  mask: {
    tool: "freehand",
    invert: false,
    shapes: [],
    dataUrl: null,
    enabled: false,
    brushSize: 30,
    showOverlay: false,
  },
  tint: "#00ff66",
  bgBlur: 12,
  bgMode: "solid",
  invert: false,
  lights: { points: [], enabled: false },
  charSet: "binary",
  density: 0,
  animated: true,
  blurType: "off",
  cellSize: 14,
  contrast: 115,
  coverage: 96,
  animSpeed: { enabled: true, intensity: 100 },
  animStyle: "flicker",
  bgOpacity: 90,
  blurAngle: 0,
  grayscale: 0,
  lensFocus: 40,
  tiltFocus: 35,
  toneCurve: [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  ],
  blurAmount: 35,
  brightness: 0,
  renderMode: "dither",
  saturation: 100,
  styleBlend: "source-over",
  blurCenterX: 50,
  blurCenterY: 50,
  customChars: "",
  tiltFeather: 15,
  tintOpacity: 45,
  edgeEmphasis: 40,
  overlayBlend: "overlay",
  tiltPosition: 50,
  animIntensity: { enabled: true, intensity: 60 },
  progressiveReverse: false,
  progressivePosition: 55,
  directionalBothSides: false,
}

/** Partial settings: any key, and any single post-effect, can be overridden on its own. */
export type AsciiOverrides = Partial<Omit<AsciiParams, "pfx">> & { pfx?: Partial<AsciiParams["pfx"]> }

export type AsciiEffectProps = {
  /** Same-origin photo (its pixels are read). */
  src: string
  alt: string
  /** Overrides merged over the Benjamins recipe. */
  params?: AsciiOverrides
  /** Focal point of the cover-fit photo, like CSS object-position. */
  position?: string
  /** Frame cap. @default 30 */
  fps?: number
  className?: string
}

// ── constants ───────────────────────────────────────────────────

const CHARSETS: Record<string, string> = {
  standard: " .:-=+*#%@",
  binary: "01",
  blocks: " ░▒▓█",
  detailed: " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  simple: " .oO@",
  hex: "0123456789ABCDEF",
  katakana: " ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ",
  arrows: " ←↙↓↘→↗↑↖",
}
const HEX = "0123456789ABCDEF"
const RAIN = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ0123456789Z:."
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
const BRAILLE = [0, 4, 6, 2, 5, 1, 7, 3]
const MONO = 'ui-monospace, "Courier New", monospace'
// Device pixels a canvas may hold; a full-screen effect lowers its pixel ratio to stay under it.
const PIXEL_BUDGET = 2_400_000
// Marching-squares edge pairs (0 top, 1 right, 2 bottom, 3 left) per corner code.
const MARCH: number[][] = [[], [3, 2], [2, 1], [3, 1], [0, 1], [0, 1, 3, 2], [0, 2], [0, 3], [0, 3], [0, 2], [0, 3, 2, 1], [0, 1], [3, 1], [2, 1], [3, 2], []]

const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v)
const byte = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v | 0)
const rgb = (r: number, g: number, b: number, k = 1) => `rgb(${byte(r * k)},${byte(g * k)},${byte(b * k)})`
const luma = (r: number, g: number, b: number) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

/** Deterministic noise in [0, 1). */
function hash(a: number, b: number, c = 0) {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 1440662683)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas")
  c.width = Math.max(1, Math.round(w))
  c.height = Math.max(1, Math.round(h))
  return c
}

function context(c: HTMLCanvasElement, opts?: CanvasRenderingContext2DSettings) {
  const x = c.getContext("2d", opts)
  if (!x) throw new Error("Canvas 2D unavailable")
  return x
}

function merge(params?: AsciiOverrides): AsciiParams {
  return {
    ...BENJAMINS,
    ...params,
    pfx: { ...BENJAMINS.pfx, ...params?.pfx },
    lights: { ...BENJAMINS.lights, ...params?.lights },
    mask: { ...BENJAMINS.mask, ...params?.mask },
    animSpeed: { ...BENJAMINS.animSpeed, ...params?.animSpeed },
    animIntensity: { ...BENJAMINS.animIntensity, ...params?.animIntensity },
  }
}

function glyphs(p: AsciiParams) {
  if (p.charSet === "custom") return p.customChars || CHARSETS.standard
  return CHARSETS[p.charSet] ?? (p.charSet || CHARSETS.standard)
}

/** brightness → contrast → saturation → grayscale → tone curve, on 0–255 channels. */
function makeAdjust(p: AsciiParams) {
  const lut = new Uint8ClampedArray(256)
  const pts = [...p.toneCurve].sort((a, b) => a.x - b.x)
  for (let v = 0; v < 256; v++) {
    const x = v / 255
    if (pts.length < 2) {
      lut[v] = v
      continue
    }
    let k = 0
    while (k < pts.length - 2 && x > pts[k + 1].x) k++
    const a = pts[k]
    const b = pts[k + 1]
    const t = b.x === a.x ? 0 : clamp((x - a.x) / (b.x - a.x))
    lut[v] = (a.y + (b.y - a.y) * t) * 255
  }
  const add = p.brightness * 2.55
  const con = p.contrast / 100
  const sat = p.saturation / 100
  const gray = p.grayscale / 100
  return (r: number, g: number, b: number): [number, number, number] => {
    r = (r + add - 128) * con + 128
    g = (g + add - 128) * con + 128
    b = (b + add - 128) * con + 128
    let l = 0.2126 * r + 0.7152 * g + 0.0722 * b
    r = l + (r - l) * sat
    g = l + (g - l) * sat
    b = l + (b - l) * sat
    l = 0.2126 * r + 0.7152 * g + 0.0722 * b
    r += (l - r) * gray
    g += (l - g) * gray
    b += (l - b) * gray
    return [lut[byte(r)], lut[byte(g)], lut[byte(b)]]
  }
}

function cssAdjust(p: AsciiParams) {
  return `brightness(${1 + p.brightness / 100}) contrast(${p.contrast}%) saturate(${p.saturation}%) grayscale(${p.grayscale}%)`
}

// ── setup: everything that only changes with size or params ─────

type Setup = {
  W: number
  H: number
  dpr: number
  cs: number
  cols: number
  rows: number
  photo: HTMLCanvasElement
  bg: HTMLCanvasElement | null
  layer: HTMLCanvasElement
  lctx: CanvasRenderingContext2D
  tmp: HTMLCanvasElement
  tctx: CanvasRenderingContext2D
  tmp2: HTMLCanvasElement
  t2ctx: CanvasRenderingContext2D
  snap: HTMLCanvasElement
  /** Quarter-size buffer the bloom is blurred in. */
  bloom: HTMLCanvasElement
  bloomCtx: CanvasRenderingContext2D
  sctx: CanvasRenderingContext2D
  chans: [HTMLCanvasElement, HTMLCanvasElement, HTMLCanvasElement]
  grain: HTMLCanvasElement[]
  scan: HTMLCanvasElement
  dotScreen: HTMLCanvasElement
  /** Dither: one pixel per dot, scaled up in one blit, then the gaps cut out. */
  dots: HTMLCanvasElement
  dotsCtx: CanvasRenderingContext2D
  dotData: ImageData
  gapTile: HTMLCanvasElement
  /** Adjusted cell colours (r, g, b per cell), their luminance, and the halves for halfblocks. */
  rgbs: Float32Array
  lum: Float32Array
  top: Float32Array
  bot: Float32Array
  edge: Float32Array
}

function parsePosition(position: string): [number, number] {
  const parts = position.trim().split(/\s+/)
  const one = (s: string | undefined) => {
    if (!s) return 0.5
    if (s === "left" || s === "top") return 0
    if (s === "right" || s === "bottom") return 1
    if (s === "center") return 0.5
    const n = parseFloat(s)
    return Number.isFinite(n) ? clamp(n / 100) : 0.5
  }
  return [one(parts[0]), one(parts[1] ?? parts[0])]
}

/** Canvas pixels per CSS pixel: the screen's own ratio divided by a whole number, so a canvas
 * scaled down for the budget or for speed (`down`) still lands on crisp device pixels. */
function pixelRatio(cssW: number, cssH: number, down: number) {
  const native = window.devicePixelRatio || 1
  const fit = Math.min(native, 2, Math.sqrt(PIXEL_BUDGET / Math.max(1, cssW * cssH)))
  return native / (Math.ceil(native / fit - 1e-6) + down)
}

function build(img: HTMLImageElement, cssW: number, cssH: number, p: AsciiParams, position: string, down = 0): Setup {
  const dpr = pixelRatio(cssW, cssH, down)
  const W = Math.max(1, Math.round(cssW * dpr))
  const H = Math.max(1, Math.round(cssH * dpr))
  // A whole number of device pixels per dither dot (four dots per cell side).
  const cs = Math.max(4, Math.round((p.cellSize * dpr) / 4) * 4)
  const cols = Math.max(1, Math.ceil(W / cs))
  const rows = Math.max(1, Math.ceil(H / cs))

  // The photo, cover-fitted to the whole grid (a hair wider than the frame).
  const photo = makeCanvas(cols * cs, rows * cs)
  const pctx = context(photo)
  const [fx, fy] = parsePosition(position)
  const scale = Math.max(photo.width / img.naturalWidth, photo.height / img.naturalHeight)
  const dw = img.naturalWidth * scale
  const dh = img.naturalHeight * scale
  pctx.imageSmoothingQuality = "high"
  pctx.drawImage(img, (photo.width - dw) * fx, (photo.height - dh) * fy, dw, dh)

  // One pixel per half cell: the average colour of each half.
  const sample = makeCanvas(cols, rows * 2)
  const sctx0 = context(sample, { willReadFrequently: true })
  sctx0.imageSmoothingQuality = "high"
  sctx0.drawImage(photo, 0, 0, photo.width, photo.height, 0, 0, cols, rows * 2)
  const data = sctx0.getImageData(0, 0, cols, rows * 2).data
  const adjust = makeAdjust(p)
  const n = cols * rows
  const rgbs = new Float32Array(n * 3)
  const top = new Float32Array(n * 3)
  const bot = new Float32Array(n * 3)
  const lum = new Float32Array(n)
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i
      const a = ((j * 2) * cols + i) * 4
      const b = ((j * 2 + 1) * cols + i) * 4
      const t = adjust(data[a], data[a + 1], data[a + 2])
      const u = adjust(data[b], data[b + 1], data[b + 2])
      for (let c = 0; c < 3; c++) {
        top[k * 3 + c] = t[c]
        bot[k * 3 + c] = u[c]
        rgbs[k * 3 + c] = (t[c] + u[c]) / 2
      }
      lum[k] = luma(rgbs[k * 3], rgbs[k * 3 + 1], rgbs[k * 3 + 2])
    }
  }

  // Sobel on the luminance grid.
  const edge = new Float32Array(n)
  const L = (i: number, j: number) => lum[clamp(j, 0, rows - 1) * cols + clamp(i, 0, cols - 1)]
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const gx = -L(i - 1, j - 1) - 2 * L(i - 1, j) - L(i - 1, j + 1) + L(i + 1, j - 1) + 2 * L(i + 1, j) + L(i + 1, j + 1)
      const gy = -L(i - 1, j - 1) - 2 * L(i, j - 1) - L(i + 1, j - 1) + L(i - 1, j + 1) + 2 * L(i, j + 1) + L(i + 1, j + 1)
      edge[j * cols + i] = clamp(Math.hypot(gx, gy) / 2)
    }
  }

  // Background layer.
  let bg: HTMLCanvasElement | null = null
  if (p.bgMode !== "none") {
    bg = makeCanvas(W, H)
    const b = context(bg)
    if (p.bgMode === "solid") {
      b.fillStyle = p.bgColor ?? "#000"
      b.fillRect(0, 0, W, H)
    } else {
      b.filter = `${p.bgMode === "blur" ? `blur(${p.bgBlur * dpr}px) ` : ""}${cssAdjust(p)}`
      b.drawImage(photo, 0, 0)
      b.filter = "none"
    }
  }

  // Film grain tiles and the two screens.
  const grain = [0, 1, 2].map(() => {
    const c = makeCanvas(160, 160)
    const g = context(c)
    const id = g.createImageData(160, 160)
    for (let i = 0; i < id.data.length; i += 4) {
      const v = 128 + (Math.random() - 0.5) * 255
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v
      id.data[i + 3] = 255
    }
    g.putImageData(id, 0, 0)
    return c
  })
  const period = Math.max(2, Math.round(3 * dpr))
  const scan = makeCanvas(1, period)
  const sc = context(scan)
  sc.fillStyle = "#000"
  sc.fillRect(0, 0, 1, Math.max(1, Math.round(dpr)))
  const step = Math.max(3, Math.round(5 * dpr))
  const dotScreen = makeCanvas(step, step)
  const dc = context(dotScreen)
  dc.fillStyle = "rgb(96,96,96)"
  dc.fillRect(0, 0, step, step)
  dc.fillStyle = "#fff"
  dc.beginPath()
  dc.arc(step / 2, step / 2, step * 0.36, 0, Math.PI * 2)
  dc.fill()

  const dots = makeCanvas(cols * 4, rows * 4)
  const dotsCtx = context(dots)
  const d4 = cs / 4
  // Dots of one or two pixels keep no gap, or the gap would eat half the dot.
  const gap = d4 >= 3 ? Math.max(1, Math.round(d4 * 0.14)) : 0
  const gapTile = makeCanvas(d4, d4)
  const gt = context(gapTile)
  gt.fillStyle = "#000"
  if (gap) {
    gt.fillRect(d4 - gap, 0, gap, d4)
    gt.fillRect(0, d4 - gap, d4, gap)
  }

  const layer = makeCanvas(W, H)
  const tmp = makeCanvas(W, H)
  const tmp2 = makeCanvas(W, H)
  const snap = makeCanvas(W, H)
  const bloom = makeCanvas(Math.ceil(W / 4), Math.ceil(H / 4))
  return {
    W,
    H,
    dpr,
    cs,
    cols,
    rows,
    photo,
    bg,
    layer,
    lctx: context(layer),
    tmp,
    tctx: context(tmp),
    tmp2,
    t2ctx: context(tmp2),
    snap,
    bloom,
    bloomCtx: context(bloom),
    sctx: context(snap),
    chans: [makeCanvas(W, H), makeCanvas(W, H), makeCanvas(W, H)],
    grain,
    scan,
    dotScreen,
    dots,
    dotsCtx,
    dotData: dotsCtx.createImageData(cols * 4, rows * 4),
    gapTile,
    rgbs,
    lum,
    top,
    bot,
    edge,
  }
}

// ── motion ──────────────────────────────────────────────────────

function animate(style: AsciiAnimStyle, v: number, i: number, j: number, cols: number, rows: number, tt: number, amp: number) {
  switch (style) {
    case "wave":
      return v + Math.sin(i * 0.32 + j * 0.18 + tt * 2.4) * 0.22 * amp
    case "pulse":
      return v * (1 + Math.sin(tt * 2.6) * 0.3 * amp)
    case "shimmer": {
      const d = (i / cols + j / rows) / 2
      const at = ((tt * 0.22) % 1.5) - 0.25
      return v + Math.exp(-(((d - at) / 0.06) ** 2)) * 0.55 * amp
    }
    case "ripple":
      return v + Math.sin(Math.hypot(i - cols / 2, j - rows / 2) * 0.6 - tt * 3.2) * 0.22 * amp
    case "flicker": {
      const k = Math.floor(tt * 6)
      const r = hash(i, j, k)
      if (r > 1 - 0.035 * amp) return v * 0.15
      return v + (r - 0.5) * 0.4 * amp + (hash(k, 3, 9) - 0.5) * 0.12 * amp
    }
  }
  return v
}

// ── the primitives ──────────────────────────────────────────────

type Cell = { x: number; y: number; s: number; v: number; base: number; r: number; g: number; b: number; i: number; j: number }

function star(c: CanvasRenderingContext2D, cx: number, cy: number, outer: number) {
  c.beginPath()
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / 5
    const rad = k % 2 ? outer * 0.42 : outer
    c.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad)
  }
  c.closePath()
  c.fill()
}

function heart(c: CanvasRenderingContext2D, cx: number, cy: number, z: number) {
  c.beginPath()
  c.moveTo(cx, cy + z * 0.7)
  c.bezierCurveTo(cx - z * 1.2, cy - z * 0.1, cx - z * 0.55, cy - z * 0.95, cx, cy - z * 0.35)
  c.bezierCurveTo(cx + z * 0.55, cy - z * 0.95, cx + z * 1.2, cy - z * 0.1, cx, cy + z * 0.7)
  c.fill()
}

function hexagon(c: CanvasRenderingContext2D, cx: number, cy: number, rad: number) {
  c.beginPath()
  for (let k = 0; k < 6; k++) {
    const a = Math.PI / 6 + (k * Math.PI) / 3
    c.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad)
  }
  c.closePath()
  c.fill()
}

function drawCell(c: CanvasRenderingContext2D, mode: AsciiRenderMode, cell: Cell, st: Setup, p: AsciiParams, chars: string, tt: number, t: number) {
  const { x, y, s, v, base, r, g, b, i, j } = cell
  const cx = x + s / 2
  const cy = y + s / 2
  // Fill modes keep the cell's colour and carry the motion as brightness.
  const k = clamp(v / Math.max(base, 0.04), 0, 2)
  const ink = rgb(r, g, b, 0.55 + 0.6 * v)
  switch (mode) {
    case "characters": {
      const ch = chars[Math.min(chars.length - 1, Math.floor(v * chars.length))]
      if (!ch || ch === " ") return
      c.font = `bold ${Math.round(s * (0.7 + 0.15 * Math.round(v * 3)))}px ${MONO}`
      c.fillStyle = ink
      c.fillText(ch, cx, cy)
      return
    }
    case "dither":
      // Drawn in bulk by drawCells (see ditherCell).
      return
    case "mosaic": {
      const gap = Math.max(1, s * 0.06)
      c.fillStyle = rgb(r, g, b, k)
      c.fillRect(x + gap, y + gap, s - gap * 2, s - gap * 2)
      return
    }
    case "pixel": {
      const z = s * 0.95 * v
      c.fillStyle = ink
      c.fillRect(cx - z / 2, cy - z / 2, z, z)
      return
    }
    case "dots": {
      c.fillStyle = ink
      c.beginPath()
      c.arc(cx, cy, (s / 2) * v, 0, Math.PI * 2)
      c.fill()
      return
    }
    case "cross": {
      if (v < 0.05) return
      const th = Math.max(1, s * 0.34 * v)
      const len = s * 0.86
      c.fillStyle = ink
      c.fillRect(cx - len / 2, cy - th / 2, len, th)
      c.fillRect(cx - th / 2, cy - len / 2, th, len)
      return
    }
    case "diamond": {
      const h = s * 0.56 * v
      c.fillStyle = ink
      c.beginPath()
      c.moveTo(cx, cy - h)
      c.lineTo(cx + h, cy)
      c.lineTo(cx, cy + h)
      c.lineTo(cx - h, cy)
      c.closePath()
      c.fill()
      return
    }
    case "voxel": {
      const f = s * 0.72
      const o = s * 0.28 * v
      c.fillStyle = rgb(r, g, b, k)
      c.fillRect(x, y + o, f, f)
      c.fillStyle = rgb(r, g, b, k * 1.3)
      c.beginPath()
      c.moveTo(x, y + o)
      c.lineTo(x + o, y)
      c.lineTo(x + o + f, y)
      c.lineTo(x + f, y + o)
      c.closePath()
      c.fill()
      c.fillStyle = rgb(r, g, b, k * 0.6)
      c.beginPath()
      c.moveTo(x + f, y + o)
      c.lineTo(x + f + o, y)
      c.lineTo(x + f + o, y + f)
      c.lineTo(x + f, y + o + f)
      c.closePath()
      c.fill()
      return
    }
    case "lego": {
      c.fillStyle = rgb(r, g, b, k)
      c.fillRect(x + 0.5, y + 0.5, s - 1, s - 1)
      c.fillStyle = rgb(r, g, b, k * 0.7)
      c.fillRect(x + 0.5, y + s - Math.max(1, s * 0.08), s - 1, Math.max(1, s * 0.08))
      c.beginPath()
      c.arc(cx, cy, s * 0.27, 0, Math.PI * 2)
      c.fillStyle = rgb(r, g, b, k * 1.15)
      c.fill()
      c.lineWidth = Math.max(1, s * 0.05)
      c.strokeStyle = rgb(r, g, b, k * 0.7)
      c.stroke()
      return
    }
    case "mixed": {
      const pick = hash(i, j, 5)
      const sub: AsciiRenderMode = v > 0.72 && pick < 0.4 ? "characters" : pick < 0.33 ? "dots" : pick < 0.66 ? "pixel" : "cross"
      drawCell(c, sub, cell, st, p, chars, tt, t)
      return
    }
    case "lines": {
      const th = s * 0.85 * v
      c.fillStyle = ink
      c.fillRect(x, cy - th / 2, s, th)
      return
    }
    case "diagonal": {
      if (v < 0.04) return
      c.strokeStyle = ink
      c.lineWidth = s * 0.5 * v
      c.beginPath()
      c.moveTo(x, y + s)
      c.lineTo(x + s, y)
      c.stroke()
      return
    }
    case "braille": {
      c.fillStyle = ink
      for (let q = 0; q < 8; q++) {
        if (v <= (BRAILLE[q] + 0.5) / 8) continue
        const bx = x + s * (0.3 + 0.4 * (q % 2))
        const by = y + s * (0.14 + 0.24 * Math.floor(q / 2))
        c.beginPath()
        c.arc(bx, by, s * 0.1, 0, Math.PI * 2)
        c.fill()
      }
      return
    }
    case "disco": {
      const gap = Math.max(1, s * 0.07)
      c.fillStyle = rgb(r, g, b, k * 0.85)
      c.fillRect(x + gap, y + gap, s - gap * 2, s - gap * 2)
      c.fillStyle = rgb(r, g, b, k * 1.3)
      c.fillRect(x + gap, y + gap, s * 0.38, s * 0.38)
      if (hash(i, j, Math.floor(tt * 4)) > 0.93) {
        const z = s * 0.4 * (0.4 + v)
        c.fillStyle = "#fff"
        c.beginPath()
        c.moveTo(cx, cy - z)
        c.lineTo(cx + z * 0.25, cy)
        c.lineTo(cx, cy + z)
        c.lineTo(cx - z * 0.25, cy)
        c.closePath()
        c.moveTo(cx - z, cy)
        c.lineTo(cx, cy - z * 0.25)
        c.lineTo(cx + z, cy)
        c.lineTo(cx, cy + z * 0.25)
        c.closePath()
        c.fill()
      }
      return
    }
    case "hexdump": {
      c.font = `bold ${Math.round(s * 0.9)}px ${MONO}`
      c.fillStyle = ink
      c.fillText(HEX[Math.min(15, Math.floor(v * 16))], cx, cy)
      return
    }
    case "matrix": {
      // Code rain runs on its own clock; the photo shows through its brightness.
      const speed = 5 + hash(i, 1, 3) * 11
      const len = 6 + hash(i, 2, 4) * 14
      const head = (t * speed + hash(i, 4, 5) * st.rows * 2) % (st.rows + len + 8)
      const dist = head - j
      const trail = dist >= 0 && dist < len ? 1 - dist / len : 0
      const bright = trail * 0.85 + v * 0.45
      if (bright < 0.06) return
      const glyph = RAIN[Math.floor(hash(i, j, Math.floor(t * 7 + hash(i, j, 1) * 7)) * RAIN.length)]
      c.font = `bold ${Math.round(s * 0.95)}px ${MONO}`
      c.fillStyle = dist >= 0 && dist < 1 ? "rgb(210,255,220)" : `rgb(0,${byte(70 + 185 * bright)},${byte(30 + 60 * bright)})`
      c.fillText(glyph, cx, cy)
      return
    }
    case "rings": {
      const count = 1 + Math.floor(v * 2.999)
      const max = s * 0.47 * v
      c.strokeStyle = ink
      c.lineWidth = Math.max(1, s * 0.07)
      for (let q = 0; q < count; q++) {
        c.beginPath()
        c.arc(cx, cy, (max * (q + 1)) / count, 0, Math.PI * 2)
        c.stroke()
      }
      return
    }
    case "hearts":
      c.fillStyle = ink
      heart(c, cx, cy, s * 0.5 * v)
      return
    case "stars":
      c.fillStyle = ink
      star(c, cx, cy, s * 0.55 * v)
      return
    case "hexagons":
      c.fillStyle = rgb(r, g, b, k)
      hexagon(c, cx + (j % 2 ? s / 2 : 0), cy, s * 0.577 * (0.6 + 0.4 * v))
      return
    case "triangles": {
      const n = j * st.cols + i
      const right = i < st.cols - 1 ? n + 1 : n
      const down = j < st.rows - 1 ? n + st.cols : n
      const tone = (m: number) => {
        let rr = (st.rgbs[n * 3] + st.rgbs[m * 3]) / 2
        let gg = (st.rgbs[n * 3 + 1] + st.rgbs[m * 3 + 1]) / 2
        let bb = (st.rgbs[n * 3 + 2] + st.rgbs[m * 3 + 2]) / 2
        if (p.invert) {
          rr = 255 - rr
          gg = 255 - gg
          bb = 255 - bb
        }
        return rgb(rr, gg, bb, k)
      }
      const tri = (pts: number[], fill: string) => {
        c.fillStyle = fill
        c.strokeStyle = fill
        c.lineWidth = 1
        c.beginPath()
        c.moveTo(pts[0], pts[1])
        c.lineTo(pts[2], pts[3])
        c.lineTo(pts[4], pts[5])
        c.closePath()
        c.fill()
        c.stroke()
      }
      if ((i + j) % 2) {
        tri([x, y, x + s, y, x + s, y + s], tone(right))
        tri([x, y, x, y + s, x + s, y + s], tone(down))
      } else {
        tri([x, y, x + s, y, x, y + s], tone(right))
        tri([x + s, y, x + s, y + s, x, y + s], tone(down))
      }
      return
    }
    case "bubbles": {
      const rad = s * 0.47 * v
      if (rad < 0.5) return
      c.beginPath()
      c.arc(cx, cy, rad, 0, Math.PI * 2)
      c.fillStyle = `rgba(${byte(r)},${byte(g)},${byte(b)},0.25)`
      c.fill()
      c.strokeStyle = ink
      c.lineWidth = Math.max(1, s * 0.06)
      c.stroke()
      c.beginPath()
      c.arc(cx - rad * 0.35, cy - rad * 0.35, rad * 0.18, 0, Math.PI * 2)
      c.fillStyle = "rgba(255,255,255,0.8)"
      c.fill()
      return
    }
    case "hatch": {
      const strokes = Math.floor(v * 4.999)
      if (!strokes) return
      const jit = (q: number) => (hash(i, j, q) - 0.5) * s * 0.16
      c.strokeStyle = rgb(r, g, b, 0.9)
      c.lineWidth = Math.max(1, s * 0.07)
      c.beginPath()
      if (strokes > 0) {
        c.moveTo(x, y + s + jit(1))
        c.lineTo(x + s, y + jit(2))
      }
      if (strokes > 1) {
        c.moveTo(x, y + jit(3))
        c.lineTo(x + s, y + s + jit(4))
      }
      if (strokes > 2) {
        c.moveTo(x, cy + jit(5))
        c.lineTo(x + s, cy + jit(6))
      }
      if (strokes > 3) {
        c.moveTo(cx + jit(7), y)
        c.lineTo(cx + jit(8), y + s)
      }
      c.stroke()
      return
    }
    case "halfblocks": {
      const n = j * st.cols + i
      const delta = v - base
      const half = (arr: Float32Array, yy: number) => {
        let rr = arr[n * 3]
        let gg = arr[n * 3 + 1]
        let bb = arr[n * 3 + 2]
        if (p.invert) {
          rr = 255 - rr
          gg = 255 - gg
          bb = 255 - bb
        }
        const l = luma(rr, gg, bb)
        c.fillStyle = rgb(rr, gg, bb, clamp((l + delta) / Math.max(l, 0.04), 0, 2))
        c.fillRect(x, yy, s, s / 2 + 0.5)
      }
      half(st.top, y)
      half(st.bot, y + s / 2)
      return
    }
    case "contour":
      return
  }
}

/** Topographic iso-lines by marching squares over the luminance grid. */
function drawContour(c: CanvasRenderingContext2D, st: Setup, p: AsciiParams, tt: number) {
  const { cols, rows, cs: s } = st
  const levels = Math.round(clamp(8 * (1 + p.density / 100), 3, 20))
  const phase = p.animated ? (tt * 0.08) % (1 / levels) : 0
  const emph = p.edgeEmphasis / 100
  const val = (i: number, j: number) => {
    const n = j * cols + i
    const l = p.invert ? 1 - st.lum[n] : st.lum[n]
    return clamp(l + st.edge[n] * emph * 0.5)
  }
  c.lineWidth = Math.max(1, s * 0.08)
  c.lineJoin = "round"
  for (let q = 0; q < levels; q++) {
    const L = (q + 0.5) / levels + phase
    c.strokeStyle = `rgba(255,255,255,${0.35 + 0.65 * L})`
    c.beginPath()
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        if (hash(i, j, 7) > p.coverage / 100) continue
        const a = val(i, j)
        const b = val(i + 1, j)
        const cc = val(i + 1, j + 1)
        const d = val(i, j + 1)
        const code = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (cc > L ? 2 : 0) | (d > L ? 1 : 0)
        const segs = MARCH[code]
        if (!segs.length) continue
        const x0 = i * s + s / 2
        const y0 = j * s + s / 2
        const f = (u: number, w: number) => (w === u ? 0.5 : clamp((L - u) / (w - u)))
        const pt = (e: number): [number, number] =>
          e === 0 ? [x0 + s * f(a, b), y0] : e === 1 ? [x0 + s, y0 + s * f(b, cc)] : e === 2 ? [x0 + s * f(d, cc), y0 + s] : [x0, y0 + s * f(a, d)]
        for (let e = 0; e < segs.length; e += 2) {
          const [ax, ay] = pt(segs[e])
          const [bx, by] = pt(segs[e + 1])
          c.moveTo(ax, ay)
          c.lineTo(bx, by)
        }
      }
    }
    c.stroke()
  }
}

// ── stages ──────────────────────────────────────────────────────

function drawCells(st: Setup, p: AsciiParams, t: number) {
  const c = st.lctx
  const { cols, rows, cs: s } = st
  const speed = p.animSpeed.enabled ? 0.15 + (p.animSpeed.intensity / 100) * 1.85 : 1
  const amp = p.animIntensity.enabled ? p.animIntensity.intensity / 100 : 0.5
  const tt = t * speed
  c.clearRect(0, 0, st.W, st.H)
  c.textAlign = "center"
  c.textBaseline = "middle"
  if (p.renderMode === "contour") return drawContour(c, st, p, tt)
  const chars = glyphs(p)
  const cover = p.coverage / 100
  const emph = p.edgeEmphasis / 100
  const dens = 1 + p.density / 100
  const dither = p.renderMode === "dither"
  if (dither) st.dotData.data.fill(0)
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      if (cover < 1 && hash(i, j, 7) > cover) continue
      const n = j * cols + i
      let r = st.rgbs[n * 3]
      let g = st.rgbs[n * 3 + 1]
      let b = st.rgbs[n * 3 + 2]
      let base = st.lum[n]
      if (p.invert) {
        r = 255 - r
        g = 255 - g
        b = 255 - b
        base = 1 - base
      }
      let v = base + st.edge[n] * emph
      if (p.animated) v = animate(p.animStyle, v, i, j, cols, rows, tt, amp)
      v = clamp(v * dens)
      if (dither) ditherCell(st, i, j, v, r, g, b)
      else drawCell(c, p.renderMode, { x: i * s, y: j * s, s, v, base, r, g, b, i, j }, st, p, chars, tt, t)
    }
  }
  if (dither) {
    st.dotsCtx.putImageData(st.dotData, 0, 0)
    c.imageSmoothingEnabled = false
    c.drawImage(st.dots, 0, 0, cols * s, rows * s)
    c.imageSmoothingEnabled = true
    const gaps = c.createPattern(st.gapTile, "repeat")
    if (gaps) {
      c.globalCompositeOperation = "destination-out"
      c.fillStyle = gaps
      c.fillRect(0, 0, st.W, st.H)
      c.globalCompositeOperation = "source-over"
    }
  }
}

/** A cell as a 4×4 ordered-dither block, one pixel per dot. */
function ditherCell(st: Setup, i: number, j: number, v: number, r: number, g: number, b: number) {
  const data = st.dotData.data
  const k = 0.55 + 0.6 * v
  const R = byte(r * k)
  const G = byte(g * k)
  const B = byte(b * k)
  const row = st.cols * 4
  for (let sy = 0; sy < 4; sy++) {
    let o = ((j * 4 + sy) * row + i * 4) * 4
    for (let sx = 0; sx < 4; sx++, o += 4) {
      if (v <= (BAYER4[sy * 4 + sx] + 0.5) / 16) continue
      data[o] = R
      data[o + 1] = G
      data[o + 2] = B
      data[o + 3] = 255
    }
  }
}

/** The tint, shaped by what was drawn, laid over it with `overlayBlend`. */
function tint(st: Setup, p: AsciiParams) {
  if (p.tintOpacity <= 0) return
  const { tctx, lctx } = st
  tctx.clearRect(0, 0, st.W, st.H)
  tctx.drawImage(st.layer, 0, 0)
  tctx.globalCompositeOperation = "source-in"
  tctx.fillStyle = p.tint
  tctx.fillRect(0, 0, st.W, st.H)
  tctx.globalCompositeOperation = "source-over"
  lctx.globalCompositeOperation = p.overlayBlend
  lctx.globalAlpha = p.tintOpacity / 100
  lctx.drawImage(st.tmp, 0, 0)
  lctx.globalAlpha = 1
  lctx.globalCompositeOperation = "source-over"
}

/** Blur mask for tilt / lens / progressive: opaque where the blur shows. */
function blurMask(c: CanvasRenderingContext2D, st: Setup, p: AsciiParams) {
  const { W, H } = st
  if (p.blurType === "lens") {
    const cx = (p.blurCenterX / 100) * W
    const cy = (p.blurCenterY / 100) * H
    const inner = (p.lensFocus / 100) * Math.min(W, H) * 0.5
    const g = c.createRadialGradient(cx, cy, inner, cx, cy, inner + Math.max(W, H) * 0.25)
    g.addColorStop(0, "rgba(0,0,0,0)")
    g.addColorStop(1, "#000")
    return g
  }
  if (p.blurType === "tilt") {
    const g = c.createLinearGradient(0, 0, 0, H)
    const mid = p.tiltPosition / 100
    const half = p.tiltFocus / 200
    const feather = Math.max(0.001, p.tiltFeather / 100)
    g.addColorStop(clamp(mid - half - feather), "#000")
    g.addColorStop(clamp(mid - half), "rgba(0,0,0,0)")
    g.addColorStop(clamp(mid + half), "rgba(0,0,0,0)")
    g.addColorStop(clamp(mid + half + feather), "#000")
    return g
  }
  const a = (p.blurAngle * Math.PI) / 180
  const dx = Math.cos(a) * W
  const dy = Math.sin(a) * H
  const g = c.createLinearGradient(W / 2 - dx / 2, H / 2 - dy / 2, W / 2 + dx / 2, H / 2 + dy / 2)
  const start = p.progressivePosition / 100
  if (p.directionalBothSides) {
    g.addColorStop(0, "#000")
    g.addColorStop(clamp(0.5 - (1 - start) / 2), "rgba(0,0,0,0)")
    g.addColorStop(clamp(0.5 + (1 - start) / 2), "rgba(0,0,0,0)")
    g.addColorStop(1, "#000")
  } else {
    const [from, to] = p.progressiveReverse ? ["#000", "rgba(0,0,0,0)"] : ["rgba(0,0,0,0)", "#000"]
    g.addColorStop(p.progressiveReverse ? 0 : start, from)
    g.addColorStop(p.progressiveReverse ? 1 - start : 1, to)
  }
  return g
}

function blur(st: Setup, p: AsciiParams) {
  if (p.blurType === "off" || p.blurAmount <= 0) return
  const { W, H, lctx, tctx, t2ctx } = st
  const px = (p.blurAmount / 100) * 12 * st.dpr
  tctx.clearRect(0, 0, W, H)
  tctx.drawImage(st.layer, 0, 0)
  if (p.blurType === "gaussian") {
    lctx.clearRect(0, 0, W, H)
    lctx.filter = `blur(${px}px)`
    lctx.drawImage(st.tmp, 0, 0)
    lctx.filter = "none"
    return
  }
  if (p.blurType === "motion" || p.blurType === "radial") {
    // A running average of shifted (motion) or scaled (radial) copies.
    const steps = 10
    const a = (p.blurAngle * Math.PI) / 180
    const cx = (p.blurCenterX / 100) * W
    const cy = (p.blurCenterY / 100) * H
    lctx.clearRect(0, 0, W, H)
    for (let k = 0; k < steps; k++) {
      const f = p.directionalBothSides || p.blurType === "radial" ? k / (steps - 1) - 0.5 : k / (steps - 1)
      lctx.globalAlpha = 1 / (k + 1)
      if (p.blurType === "motion") {
        lctx.drawImage(st.tmp, Math.cos(a) * f * px * 3, Math.sin(a) * f * px * 3)
      } else {
        const z = 1 + (f * px * 4) / Math.max(W, H)
        lctx.setTransform(z, 0, 0, z, cx * (1 - z), cy * (1 - z))
        lctx.drawImage(st.tmp, 0, 0)
        lctx.setTransform(1, 0, 0, 1, 0, 0)
      }
    }
    lctx.globalAlpha = 1
    return
  }
  // tilt / lens / progressive: sharp × (1 − m) + blurred × m.
  t2ctx.clearRect(0, 0, W, H)
  t2ctx.filter = `blur(${px}px)`
  t2ctx.drawImage(st.tmp, 0, 0)
  t2ctx.filter = "none"
  t2ctx.globalCompositeOperation = "destination-in"
  t2ctx.fillStyle = blurMask(t2ctx, st, p)
  t2ctx.fillRect(0, 0, W, H)
  t2ctx.globalCompositeOperation = "source-over"
  tctx.globalCompositeOperation = "destination-out"
  tctx.fillStyle = blurMask(tctx, st, p)
  tctx.fillRect(0, 0, W, H)
  tctx.globalCompositeOperation = "source-over"
  lctx.clearRect(0, 0, W, H)
  lctx.drawImage(st.tmp, 0, 0)
  lctx.globalCompositeOperation = "lighter"
  lctx.drawImage(st.tmp2, 0, 0)
  lctx.globalCompositeOperation = "source-over"
}

function snapshot(ctx: CanvasRenderingContext2D, st: Setup) {
  st.sctx.clearRect(0, 0, st.W, st.H)
  st.sctx.drawImage(ctx.canvas, 0, 0)
}

function postFx(ctx: CanvasRenderingContext2D, st: Setup, p: AsciiParams, t: number) {
  const { W, H, dpr } = st
  const fx = p.pfx
  const on = (key: AsciiPostFx) => fx[key]?.enabled && fx[key].intensity > 0
  const I = (key: AsciiPostFx) => fx[key].intensity / 100

  if (on("bloom")) {
    // Blurred at a quarter of the size: the same glow for a sixteenth of the pixels.
    const b = st.bloomCtx
    const { width: bw, height: bh } = st.bloom
    b.clearRect(0, 0, bw, bh)
    b.filter = `blur(${((4 + I("bloom") * 10) * dpr) / 4}px) brightness(1.25)`
    b.drawImage(ctx.canvas, 0, 0, bw, bh)
    b.filter = "none"
    ctx.globalCompositeOperation = "screen"
    ctx.globalAlpha = I("bloom") * 0.85
    ctx.drawImage(st.bloom, 0, 0, W, H)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = "source-over"
  }

  if (on("chromatic")) {
    snapshot(ctx, st)
    const d = I("chromatic") * 5 * dpr
    const colours = ["#f00", "#0f0", "#00f"]
    st.chans.forEach((ch, k) => {
      const c = context(ch)
      c.globalCompositeOperation = "source-over"
      c.clearRect(0, 0, W, H)
      c.drawImage(st.snap, 0, 0)
      c.globalCompositeOperation = "multiply"
      c.fillStyle = colours[k]
      c.fillRect(0, 0, W, H)
      c.globalCompositeOperation = "destination-in"
      c.drawImage(st.snap, 0, 0)
      c.globalCompositeOperation = "source-over"
    })
    ctx.clearRect(0, 0, W, H)
    ctx.globalCompositeOperation = "lighter"
    ctx.drawImage(st.chans[0], -d, 0)
    ctx.drawImage(st.chans[1], 0, 0)
    ctx.drawImage(st.chans[2], d, 0)
    ctx.globalCompositeOperation = "destination-in"
    ctx.drawImage(st.snap, 0, 0)
    ctx.globalCompositeOperation = "source-over"
  }

  if (on("glitch") && Math.random() < 0.15 + I("glitch") * 0.5) {
    snapshot(ctx, st)
    const slices = 1 + Math.floor(Math.random() * (1 + I("glitch") * 6))
    for (let q = 0; q < slices; q++) {
      const y = Math.random() * H
      const h = (2 + Math.random() * H * 0.06) * (0.5 + I("glitch"))
      const dx = (Math.random() - 0.5) * W * 0.14 * I("glitch")
      ctx.clearRect(0, y, W, h)
      ctx.drawImage(st.snap, 0, y, W, h, dx, y, W, h)
    }
    if (Math.random() < I("glitch") * 0.4) {
      ctx.globalCompositeOperation = "screen"
      // Coloured flashes, unless the picture is meant to stay black and white.
      ctx.fillStyle =
        p.grayscale >= 100 && p.tintOpacity <= 0
          ? "rgba(255,255,255,0.18)"
          : Math.random() < 0.5
            ? "rgba(255,0,80,0.18)"
            : "rgba(0,255,220,0.18)"
      ctx.fillRect(0, Math.random() * H, W, (4 + Math.random() * 18) * dpr)
      ctx.globalCompositeOperation = "source-over"
    }
  }

  if (on("pixelate")) {
    snapshot(ctx, st)
    const block = Math.max(2, Math.round((2 + I("pixelate") * 14) * dpr))
    const w = Math.ceil(W / block)
    const h = Math.ceil(H / block)
    st.t2ctx.clearRect(0, 0, W, H)
    st.t2ctx.imageSmoothingEnabled = true
    st.t2ctx.drawImage(st.snap, 0, 0, W, H, 0, 0, w, h)
    ctx.clearRect(0, 0, W, H)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(st.tmp2, 0, 0, w, h, 0, 0, w * block, h * block)
    ctx.imageSmoothingEnabled = true
  }

  if (on("halftone")) {
    const pattern = ctx.createPattern(st.dotScreen, "repeat")
    if (pattern) {
      ctx.globalCompositeOperation = "multiply"
      ctx.globalAlpha = I("halftone")
      ctx.fillStyle = pattern
      ctx.fillRect(0, 0, W, H)
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = "source-over"
    }
  }

  if (on("scanLines")) {
    const pattern = ctx.createPattern(st.scan, "repeat")
    if (pattern) {
      const off = (t * 12 * dpr) % st.scan.height
      ctx.save()
      ctx.translate(0, off)
      ctx.globalAlpha = I("scanLines") * 0.75
      ctx.fillStyle = pattern
      ctx.fillRect(0, -off, W, H + off)
      ctx.restore()
    }
  }

  if (on("filmGrain")) {
    const pattern = ctx.createPattern(st.grain[Math.floor(Math.random() * st.grain.length)], "repeat")
    if (pattern) {
      const ox = Math.random() * 160
      const oy = Math.random() * 160
      ctx.save()
      ctx.translate(ox, oy)
      ctx.globalCompositeOperation = "overlay"
      ctx.globalAlpha = I("filmGrain") * 0.55
      ctx.fillStyle = pattern
      ctx.fillRect(-ox, -oy, W, H)
      ctx.restore()
    }
  }

  if (on("filmDust")) {
    const count = Math.round(I("filmDust") * 14 * Math.random())
    for (let q = 0; q < count; q++) {
      ctx.fillStyle = Math.random() < 0.5 ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.7)"
      ctx.beginPath()
      ctx.arc(Math.random() * W, Math.random() * H, (0.5 + Math.random() * 1.8) * dpr, 0, Math.PI * 2)
      ctx.fill()
    }
    if (Math.random() < I("filmDust") * 0.3) {
      ctx.strokeStyle = "rgba(255,255,255,0.5)"
      ctx.lineWidth = dpr * 0.8
      const x = Math.random() * W
      const y = Math.random() * H
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 60 * dpr, y + 20 * dpr, x + (Math.random() - 0.5) * 40 * dpr, y + (20 + Math.random() * 50) * dpr)
      ctx.stroke()
    }
  }

  if (on("vignette")) {
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.hypot(W, H) / 2)
    g.addColorStop(0, "rgba(0,0,0,0)")
    g.addColorStop(1, `rgba(0,0,0,${I("vignette") * 0.95})`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }
}

function lights(ctx: CanvasRenderingContext2D, st: Setup, p: AsciiParams) {
  if (!p.lights.enabled) return
  ctx.globalCompositeOperation = "screen"
  for (const pt of p.lights.points) {
    const x = pt.x * st.W
    const y = pt.y * st.H
    const rad = pt.radius <= 1 ? pt.radius * Math.min(st.W, st.H) : pt.radius * st.dpr
    const a = clamp(pt.intensity > 1 ? pt.intensity / 100 : pt.intensity)
    const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, rad))
    g.addColorStop(0, pt.color ?? "#fff")
    g.addColorStop(1, "rgba(0,0,0,0)")
    ctx.globalAlpha = a
    ctx.fillStyle = g
    ctx.fillRect(0, 0, st.W, st.H)
  }
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = "source-over"
}

function mask(ctx: CanvasRenderingContext2D, st: Setup, p: AsciiParams, img: HTMLImageElement | null) {
  if (!p.mask.enabled || !img || !img.naturalWidth) return
  const { tctx, W, H } = st
  tctx.clearRect(0, 0, W, H)
  tctx.drawImage(st.photo, 0, 0)
  tctx.globalCompositeOperation = p.mask.invert ? "destination-out" : "destination-in"
  tctx.drawImage(img, 0, 0, W, H)
  tctx.globalCompositeOperation = "source-over"
  ctx.drawImage(st.tmp, 0, 0)
}

function render(ctx: CanvasRenderingContext2D, st: Setup, p: AsciiParams, t: number, maskImg: HTMLImageElement | null) {
  const { W, H } = st
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, W, H)
  if (st.bg) {
    ctx.globalAlpha = p.bgOpacity / 100
    ctx.drawImage(st.bg, 0, 0)
    ctx.globalAlpha = 1
  }
  drawCells(st, p, t)
  tint(st, p)
  blur(st, p)
  ctx.globalCompositeOperation = p.styleBlend
  ctx.drawImage(st.layer, 0, 0)
  ctx.globalCompositeOperation = "source-over"
  postFx(ctx, st, p, t)
  lights(ctx, st, p)
  mask(ctx, st, p, maskImg)
}

// ── component ───────────────────────────────────────────────────

/**
 * A photo re-drawn as animated ASCII/dither art. Fills its parent: give the
 * wrapper a size (`aspect-[4/3] w-full`, `h-96`…).
 */
export function AsciiEffect({ src, alt, params, position = "50% 50%", fps = 30, className }: AsciiEffectProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const p = React.useMemo(() => merge(params), [params])

  React.useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!wrap || !canvas || !ctx) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const moving =
      !reduced &&
      (p.animated || p.renderMode === "matrix" || p.pfx.glitch.enabled || p.pfx.filmGrain.enabled || p.pfx.filmDust.enabled)
    let st: Setup | null = null
    let raf = 0
    let last = -Infinity
    // Adaptive quality: when frames keep arriving well behind `fps`, the canvas
    // steps down to the next whole-number resolution instead of stuttering.
    let down = 0
    let prev = 0
    let ema = 0
    let samples = 0
    let visible = true
    let alive = true
    const start = performance.now()

    const img = new Image()
    img.decoding = "async"
    let maskImg: HTMLImageElement | null = null
    if (p.mask.enabled && p.mask.dataUrl) {
      maskImg = new Image()
      maskImg.src = p.mask.dataUrl
    }

    const draw = (now: number) => {
      if (!st) return
      render(ctx, st, p, (now - start) / 1000, maskImg)
    }
    const loop = (now: number) => {
      raf = 0
      if (!alive || !visible) return
      if (now - last >= 1000 / fps) {
        if (prev) {
          ema = samples ? ema * 0.9 + (now - prev) * 0.1 : now - prev
          samples++
          const { width, height } = wrap.getBoundingClientRect()
          if (samples > 30 && ema > 1600 / fps && pixelRatio(width, height, down + 1) >= 0.3) {
            down++
            setup()
          }
        }
        prev = now
        last = now
        draw(now)
      }
      if (moving) raf = requestAnimationFrame(loop)
    }
    const kick = () => {
      if (!raf && alive && visible) raf = requestAnimationFrame(loop)
    }
    const resetTiming = () => {
      prev = 0
      ema = 0
      samples = 0
    }
    const setup = () => {
      if (!img.naturalWidth) return
      const { width, height } = wrap.getBoundingClientRect()
      if (width < 2 || height < 2) return
      st = build(img, width, height, p, position, down)
      canvas.width = st.W
      canvas.height = st.H
      last = -Infinity
      resetTiming()
      kick()
    }

    img.onload = setup
    img.src = src
    if (maskImg) maskImg.onload = () => kick()

    const ro = new ResizeObserver(() => setup())
    ro.observe(wrap)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) {
        resetTiming()
        kick()
      }
    })
    io.observe(wrap)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      img.onload = null
    }
  }, [src, p, position, fps])

  return (
    <div ref={wrapRef} role="img" aria-label={alt} className={cn("relative overflow-hidden", className)}>
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 block size-full [image-rendering:pixelated]" />
    </div>
  )
}

export default AsciiEffect
