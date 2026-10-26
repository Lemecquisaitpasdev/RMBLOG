// Les connecteurs de cours. Chaque flux pousse ses prix au fil de l'eau,
// se relance tout seul s'il coupe et se tait quand on l'arrête.

export type Quote = {
  /** Dernier prix, en dollars. */
  price: number
  /** Variation en % : sur 24 h (crypto, euro) ou depuis la clôture de la veille (actions). */
  change: number
}

export type FeedStatus = "connecting" | "live" | "retrying" | "off"

type QuoteListener = (symbol: string, quote: Quote) => void
type StatusListener = (status: FeedStatus) => void

type SocketOptions = {
  onOpen?: (socket: WebSocket) => void
  onMessage: (message: unknown) => void
  onStatus: StatusListener
  /** Rien reçu pendant ce délai (ms) : on raccroche et on rappelle. */
  staleAfter?: number
}

/** Une WebSocket qui se reconnecte (1 s, 2 s, 4 s… 30 s au plus) tant qu'on ne l'arrête pas. */
function keepAlive(url: string, { onOpen, onMessage, onStatus, staleAfter }: SocketOptions) {
  let socket: WebSocket | null = null
  let retry: ReturnType<typeof setTimeout> | undefined
  let watchdog: ReturnType<typeof setTimeout> | undefined
  let attempts = 0
  let stopped = false

  const arm = () => {
    if (!staleAfter) return
    clearTimeout(watchdog)
    watchdog = setTimeout(() => socket?.close(), staleAfter)
  }

  const connect = () => {
    onStatus(attempts ? "retrying" : "connecting")
    const ws = new WebSocket(url)
    socket = ws
    ws.onopen = () => {
      arm()
      onOpen?.(ws)
    }
    ws.onmessage = (event) => {
      attempts = 0
      arm()
      onStatus("live")
      try {
        onMessage(JSON.parse(event.data))
      } catch {
        // message illisible : le suivant arrive dans la seconde
      }
    }
    ws.onclose = () => {
      clearTimeout(watchdog)
      if (stopped) return
      onStatus("retrying")
      retry = setTimeout(connect, Math.min(30_000, 1000 * 2 ** attempts++))
    }
    ws.onerror = () => ws.close()
  }

  connect()
  return () => {
    stopped = true
    clearTimeout(retry)
    clearTimeout(watchdog)
    socket?.close()
  }
}

// Points d'accès « données de marché » de Binance : publics, sans clé, sans compte.
const BINANCE_STREAM = "wss://data-stream.binance.vision/stream"
const BINANCE_API = "https://data-api.binance.vision/api/v3"

type BinanceTicker = { e: string; s: string; c: string; P: string }

/** Binance : le ticker 24 h de chaque paire (ex. BTCUSDT), poussé une fois par seconde. */
export function binanceTickers(pairs: string[], onQuote: QuoteListener, onStatus: StatusListener) {
  const streams = pairs.map((pair) => `${pair.toLowerCase()}@ticker`).join("/")
  return keepAlive(`${BINANCE_STREAM}?streams=${streams}`, {
    staleAfter: 10_000,
    onStatus,
    onMessage(message) {
      const ticker = (message as { data?: BinanceTicker }).data
      if (ticker?.e === "24hrTicker") onQuote(ticker.s, { price: Number(ticker.c), change: Number(ticker.P) })
    },
  })
}

/** Les dernières bougies journalières [ouverture, haut, bas, clôture] ; la dernière est celle du jour. */
export async function binanceDailyCandles(pair: string, days = 7): Promise<number[][]> {
  const res = await fetch(`${BINANCE_API}/klines?symbol=${pair}&interval=1d&limit=${days}`)
  if (!res.ok) throw new Error(`Binance ${res.status}`)
  const rows: string[][] = await res.json()
  return rows.map((row) => [Number(row[1]), Number(row[2]), Number(row[3]), Number(row[4])])
}

type FinnhubQuote = { c: number; dp: number | null; pc: number }
type FinnhubTrades = { type: string; data?: { s: string; p: number }[] }

/**
 * Finnhub (actions américaines, clé gratuite sur finnhub.io) : le dernier cours tout de suite,
 * marché ouvert ou non, puis chaque transaction en direct pendant la séance.
 */
export function finnhubTrades(symbols: string[], token: string, onQuote: QuoteListener, onStatus: StatusListener) {
  const previousClose = new Map<string, number>()
  let stopped = false

  for (const symbol of symbols) {
    fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(token)}`)
      .then((res) => (res.ok ? (res.json() as Promise<FinnhubQuote>) : null))
      .then((quote) => {
        if (stopped || !quote?.c) return
        previousClose.set(symbol, quote.pc)
        onQuote(symbol, { price: quote.c, change: quote.dp ?? 0 })
      })
      .catch(() => {})
  }

  const stop = keepAlive(`wss://ws.finnhub.io?token=${encodeURIComponent(token)}`, {
    onStatus,
    onOpen(ws) {
      for (const symbol of symbols) ws.send(JSON.stringify({ type: "subscribe", symbol }))
    },
    onMessage(message) {
      const { type, data } = message as FinnhubTrades
      if (type !== "trade" || !data) return
      for (const trade of data) {
        const close = previousClose.get(trade.s)
        onQuote(trade.s, { price: trade.p, change: close ? ((trade.p - close) / close) * 100 : 0 })
      }
    },
  })

  return () => {
    stopped = true
    stop()
  }
}
