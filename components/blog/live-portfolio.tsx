"use client"

import * as React from "react"
import { FinanceBento, type FinanceBentoLive, type FinanceBentoTick } from "@/components/ui/finance-bento"
import { binanceDailyCandles, binanceTickers, finnhubTrades, type FeedStatus, type Quote } from "@/lib/live-quotes"
import { allHoldings, BASE, dashboardData, holdings, type Holding } from "@/lib/portfolio"

// Clé Finnhub (gratuite) pour les actions : à poser dans les variables d'environnement de Vercel.
const FINNHUB_TOKEN = process.env.NEXT_PUBLIC_FINNHUB_TOKEN

// Crypto et euro/dollar passent par Binance, cotés en USDT (le dollar numérique, 1 pour 1).
const BINANCE_PAIRS = [...holdings.crypto.map((h) => h.symbol), "EUR"].map((symbol) => `${symbol}USDT`)
const STOCKS = holdings.stocks.map((h) => h.symbol)

const time = (d: Date) => d.toLocaleTimeString("fr-FR")
const signed = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1)}%`
const dollars = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 })

/** Un émetteur de ticks qui rejoue le dernier à qui s'abonne. */
function createLive() {
  const listeners = new Set<(tick: FinanceBentoTick) => void>()
  let last: FinanceBentoTick | null = null
  return {
    subscribe(listener) {
      listeners.add(listener)
      if (last) listener(last)
      return () => {
        listeners.delete(listener)
      }
    },
    emit(tick: FinanceBentoTick) {
      last = tick
      listeners.forEach((listener) => listener(tick))
    },
  } satisfies FinanceBentoLive & { emit: (tick: FinanceBentoTick) => void }
}

type Status = { binance: FeedStatus; finnhub: FeedStatus }

/** Le tableau de bord : 50 000 000 $ posés à l'ouverture, revalorisés chaque seconde au cours du marché. */
export function LivePortfolio() {
  const [data] = React.useState(() => dashboardData(new Date()))
  const [live] = React.useState(createLive)
  const [status, setStatus] = React.useState<Status>({ binance: "connecting", finnhub: FINNHUB_TOKEN ? "connecting" : "off" })
  const [clock, setClock] = React.useState<{ opened: string; now: string } | null>(null)

  React.useEffect(() => {
    const quotes = new Map<string, Quote>()
    const units = new Map<string, number>() // ce que la base a acheté, au premier cours reçu
    const candles = new Map<string, number[][]>()
    const opened = new Date()

    const record = (symbol: string, quote: Quote) => {
      quotes.set(symbol, quote)
      const holding = allHoldings.find((h) => h.symbol === symbol)
      if (holding && !units.has(symbol)) units.set(symbol, (holding.weight * BASE) / quote.price)
      const today = candles.get(symbol)?.at(-1)
      if (today) {
        today[1] = Math.max(today[1], quote.price)
        today[2] = Math.min(today[2], quote.price)
        today[3] = quote.price
      }
    }
    const report = (feed: keyof Status) => (next: FeedStatus) =>
      setStatus((prev) => (prev[feed] === next ? prev : { ...prev, [feed]: next }))

    const stopBinance = binanceTickers(BINANCE_PAIRS, (pair, quote) => record(pair.replace(/USDT$/, ""), quote), report("binance"))
    const stopFinnhub = FINNHUB_TOKEN ? finnhubTrades(STOCKS, FINNHUB_TOKEN, record, report("finnhub")) : () => {}
    for (const h of holdings.crypto) {
      binanceDailyCandles(`${h.symbol}USDT`)
        .then((rows) => candles.set(h.symbol, rows))
        .catch(() => {})
    }

    // Sans cours (le dollar, ou un flux pas encore arrivé), une ligne garde sa valeur de départ.
    const valueOf = (h: Holding) => {
      const quote = quotes.get(h.symbol)
      const qty = units.get(h.symbol)
      return quote && qty ? qty * quote.price : h.weight * BASE
    }
    const sum = (list: Holding[]) => list.reduce((total, h) => total + valueOf(h), 0)

    const id = setInterval(() => {
      const now = new Date()
      const crypto = sum(holdings.crypto)
      const stocks = sum(holdings.stocks)
      const priced = holdings.stocks.filter((h) => quotes.has(h.symbol))
      const eurusd = quotes.get("EUR")?.price
      live.emit({
        fiat: sum(holdings.fiat),
        stocks,
        crypto,
        eur: eurusd ? 1 / eurusd : undefined,
        assets: Object.fromEntries(
          holdings.crypto.map((h) => {
            const quote = quotes.get(h.symbol)
            return [h.symbol, { share: valueOf(h) / crypto, change: quote && signed(quote.change), ohlc: candles.get(h.symbol) }]
          }),
        ),
        stocksChange: priced.length
          ? {
              value: priced.reduce((acc, h) => acc + valueOf(h) * quotes.get(h.symbol)!.change, 0) / sum(priced),
              label: "today",
            }
          : { value: null, label: FINNHUB_TOKEN ? "waiting for prices" : "no live feed yet" },
        subtitle: `Live · ${time(now)}`,
      })
      setClock({ opened: time(opened), now: time(now) })
    }, 1000)

    return () => {
      clearInterval(id)
      stopBinance()
      stopFinnhub()
    }
  }, [live])

  return (
    <>
      <FinanceBento
        data={data}
        live={live}
        title="Overview"
        subtitle="Live"
        avatar="/images/avatar.jpg"
        avatarAlt="RM"
        className="mx-auto max-w-[1320px]"
      />
      <FeedStatusBar status={status} clock={clock} />
    </>
  )
}

const LABEL: Record<FeedStatus, string> = {
  connecting: "connexion…",
  live: "en direct",
  retrying: "coupé, on rappelle…",
  off: "clé Finnhub à ajouter, valeur figée sur la base",
}

function Dot({ status }: { status: FeedStatus }) {
  const color = status === "live" ? "bg-[#00ff66]" : status === "off" ? "border border-white/60" : "bg-[#ffb000]"
  return <span aria-hidden className={`mt-[0.45em] inline-block size-2 shrink-0 rounded-full ${color}`} />
}

/** La barre d'état des connecteurs, en Courier, sous le tableau. */
function FeedStatusBar({ status, clock }: { status: Status; clock: { opened: string; now: string } | null }) {
  const crypto = holdings.crypto.map((h) => h.symbol).join(" · ")
  return (
    <div className="mx-auto mt-4 max-w-[1320px] space-y-1 font-mono text-[12px] leading-[1.5] text-white/80">
      <p className="flex gap-2">
        <Dot status={status.binance} />
        <span>
          {crypto} · EUR/USD — Binance, un cours par seconde : {LABEL[status.binance]}
        </span>
      </p>
      <p className="flex gap-2">
        <Dot status={status.finnhub} />
        <span>
          Actions {STOCKS.join(" · ")} — Finnhub, chaque transaction pendant la séance de Wall Street : {LABEL[status.finnhub]}
        </span>
      </p>
      <p className="pl-4 text-white/60">
        Base {dollars.format(BASE)} posée à l&apos;ouverture de la page{clock ? ` (${clock.opened}) · recalcul ${clock.now}` : ""}
      </p>
    </div>
  )
}
