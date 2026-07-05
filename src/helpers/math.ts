import { all, create } from 'mathjs'
import {
  FALLBACK_USD_RATES,
  loadCachedRates,
  refreshLiveRates,
  registerCurrencies,
} from './currency'

/**
 * A dedicated mathjs instance for the app. Kept separate from the library
 * default so registering currency units (and any future configuration) never
 * leaks into other consumers of mathjs.
 */
export const math = create(all, {})

// Start with last session's live rates if cached, otherwise the fixed fallback.
registerCurrencies(math, loadCachedRates() ?? FALLBACK_USD_RATES)

/**
 * Update currency units with live rates. Resolves true when they changed, so
 * the UI can trigger a re-evaluation.
 */
export function refreshRates(): Promise<boolean> {
  return refreshLiveRates(math)
}
