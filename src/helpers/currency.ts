import type { MathJsInstance } from 'mathjs'

/**
 * Fixed exchange rates expressed as "1 unit of currency = N USD".
 *
 * These are an illustrative snapshot, not live data — the app stays fully
 * offline and self-contained. To make them live later, replace this table
 * with values fetched from an exchange-rate API and re-run registerCurrencies.
 */
export const USD_RATES: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0067,
  CNY: 0.14,
  KRW: 0.00073,
}

/** The currency used as the base unit that the others are defined against. */
const BASE_CURRENCY = 'USD'

/**
 * Register each currency as a mathjs unit so expressions like
 * `10 USD to KRW` or `2 EUR + 3 EUR` evaluate. Safe to call once per instance.
 */
export function registerCurrencies(math: MathJsInstance): void {
  // The base is a plain valueless unit; every other currency is defined
  // relative to it via its USD rate.
  math.createUnit(BASE_CURRENCY)

  for (const [code, rate] of Object.entries(USD_RATES)) {
    if (code === BASE_CURRENCY) {
      continue
    }

    math.createUnit(code, `${rate} ${BASE_CURRENCY}`)
  }
}
