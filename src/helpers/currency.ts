import type { MathJsInstance } from 'mathjs'

/**
 * Fallback exchange rates expressed as "1 unit of currency = N USD".
 *
 * These are a fixed snapshot used before/instead of live data, so the app works
 * fully offline. At startup we try to replace them with live rates (see
 * refreshLiveRates); on failure these values remain in effect.
 */
export const FALLBACK_USD_RATES: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0067,
  CNY: 0.14,
  KRW: 0.00073,
}

/** The currency used as the base unit that the others are defined against. */
const BASE_CURRENCY = 'USD'

/** Free, keyless, CORS-enabled endpoint. Rates are "1 USD = N currency". */
const RATES_API_URL = 'https://open.er-api.com/v6/latest/USD'

const CACHE_KEY = 'calc:rates:v1'

type CachedRates = {
  rates: Record<string, number>
  savedAt: number
}

/** Last live rates persisted from a previous session, if any. */
export function loadCachedRates(): Record<string, number> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as Partial<CachedRates>
    if (parsed && parsed.rates && typeof parsed.rates === 'object') {
      return parsed.rates
    }
  } catch {
    // Corrupt/unavailable storage: fall back to fixed rates.
  }

  return null
}

function saveCachedRates(rates: Record<string, number>): void {
  try {
    const payload: CachedRates = { rates, savedAt: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // Ignore write failures (quota, private mode, etc.).
  }
}

/** (Re)define every non-base currency unit from the given USD-rate table. */
function applyRates(math: MathJsInstance, rates: Record<string, number>): void {
  for (const [code, rate] of Object.entries(rates)) {
    if (code === BASE_CURRENCY || !(rate > 0)) {
      continue
    }

    math.createUnit(code, `${rate} ${BASE_CURRENCY}`, { override: true })
  }
}

/**
 * Register currency units on a fresh instance. Defines the base unit once, then
 * applies the provided rates (defaults to the fixed fallback table).
 */
export function registerCurrencies(
  math: MathJsInstance,
  rates: Record<string, number> = FALLBACK_USD_RATES
): void {
  math.createUnit(BASE_CURRENCY)
  applyRates(math, rates)
}

/**
 * Fetch live rates and convert the API's "1 USD = N currency" figures into our
 * "1 currency = N USD" table, limited to the currencies we support. Returns
 * null on any network/parse failure so callers can keep the current rates.
 */
async function fetchLiveRates(): Promise<Record<string, number> | null> {
  try {
    const response = await fetch(RATES_API_URL)
    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as {
      result?: string
      rates?: Record<string, number>
    }

    if (data.result !== 'success' || !data.rates) {
      return null
    }

    const usdRates: Record<string, number> = { USD: 1 }
    for (const code of Object.keys(FALLBACK_USD_RATES)) {
      if (code === BASE_CURRENCY) {
        continue
      }

      const perUsd = data.rates[code]
      if (typeof perUsd === 'number' && perUsd > 0) {
        usdRates[code] = 1 / perUsd
      }
    }

    return usdRates
  } catch {
    return null
  }
}

/**
 * Refresh currency units with live rates, persisting them for next time.
 * Returns true when rates were updated so the caller can re-evaluate.
 */
export async function refreshLiveRates(math: MathJsInstance): Promise<boolean> {
  const liveRates = await fetchLiveRates()
  if (!liveRates) {
    return false
  }

  applyRates(math, liveRates)
  saveCachedRates(liveRates)
  return true
}
