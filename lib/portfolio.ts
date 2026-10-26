import type { FinanceBentoData } from "@/components/ui/finance-bento"

/** Le compteur part de là à l'ouverture de la page, puis suit les cours. */
export const BASE = 50_000_000

export type Holding = { symbol: string; name: string; weight: number }

/**
 * Comment la base est répartie (les poids font 1 au total). À l'ouverture, chaque ligne
 * achète sa part au premier cours reçu ; ensuite elle vaut quantité × cours en direct.
 * Le dollar ne bouge pas, l'euro suit l'euro/dollar.
 */
export const holdings = {
  fiat: [
    { symbol: "USD", name: "Dollar", weight: 0.15 },
    { symbol: "EUR", name: "Euro", weight: 0.15 },
  ],
  stocks: [
    { symbol: "SPY", name: "S&P 500", weight: 0.27 },
    { symbol: "QQQ", name: "Nasdaq-100", weight: 0.18 },
  ],
  crypto: [
    { symbol: "BTC", name: "Bitcoin", weight: 0.155 },
    { symbol: "ETH", name: "Ethereum", weight: 0.065 },
    { symbol: "SOL", name: "Solana", weight: 0.03 },
  ],
} satisfies Record<"fiat" | "stocks" | "crypto", Holding[]>

export const allHoldings: Holding[] = [...holdings.fiat, ...holdings.stocks, ...holdings.crypto]

const weightOf = (list: Holding[]) => list.reduce((sum, h) => sum + h.weight, 0)

/** Trois ans de soldes de fin de mois : la courbe de la démo, mise à l'échelle pour finir pile sur la base. */
function history(now: Date): FinanceBentoData["history"] {
  const raw = Array.from({ length: 36 }, (_, i) => {
    const t = i / 35
    const noise = (Math.sin(i * 12.9898 + 156.466) * 43758.5453) % 1
    return {
      date: new Date(now.getFullYear(), now.getMonth() - (35 - i), 1).toISOString(),
      fiat: 14000 + t * 7000 + Math.sin(i * 0.9) * 900,
      stocks: 12000 + t * 19000 + Math.sin(i * 0.55) * 1600 + noise * 800,
      crypto: Math.max(2500, 4000 + t * 12000 + Math.sin(i * 0.8 + 1) * 3200 + Math.cos(i * 0.33) * 1400),
    }
  })
  const last = raw[raw.length - 1]
  const scale = {
    fiat: (weightOf(holdings.fiat) * BASE) / last.fiat,
    stocks: (weightOf(holdings.stocks) * BASE) / last.stocks,
    crypto: (weightOf(holdings.crypto) * BASE) / last.crypto,
  }
  return raw.map((p) => ({
    date: p.date,
    fiat: p.fiat * scale.fiat,
    stocks: p.stocks * scale.stocks,
    crypto: p.crypto * scale.crypto,
  }))
}

// Tant que les bougies du jour n'arrivent pas, une ligne plate plutôt qu'une courbe inventée.
const FLAT = Array.from({ length: 7 }, () => [1, 1, 1, 1])

/** Les données du tableau de bord au moment `now`. Paiements, objectifs, flux et volumes : les exemples de la démo. */
export function dashboardData(now: Date): FinanceBentoData {
  const cryptoWeight = weightOf(holdings.crypto)
  return {
    history: history(now),
    payments: [
      { name: "Rent", date: "Nov 1", amount: 1800 },
      { name: "Index fund · auto-buy", date: "Nov 3", amount: 500 },
      { name: "Insurance", date: "Nov 9", amount: 96 },
    ],
    goals: [
      { name: "House deposit", progress: 0.42, target: 60000 },
      { name: "Japan, spring", progress: 0.76, target: 6000 },
    ],
    cashflow: {
      months: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      income: [
        [2.4, 3.6, 5.4, 6.4, 5.0, 3.4],
        [2.0, 3.0, 4.4, 5.2, 4.2, 2.8],
        [1.6, 2.4, 3.4, 4.0, 3.3, 2.2],
      ],
      spending: [
        [1.2, 2.2, 3.8, 4.6, 3.4, 1.8],
        [1.0, 1.8, 3.0, 3.8, 2.8, 1.5],
        [0.8, 1.4, 2.4, 3.0, 2.2, 1.2],
      ],
    },
    crypto: holdings.crypto.map((h) => ({
      name: h.name,
      symbol: h.symbol,
      share: h.weight / cryptoWeight,
      change: "—",
      ohlc: FLAT,
    })),
    stocks: { days: ["Mon", "Tue", "Wed", "Thu", "Fri"], values: [2.1, 1.2, 3.4, 1.9, 4.6] },
  }
}
