import { all, create } from 'mathjs'
import { registerCurrencies } from './currency'

/**
 * A dedicated mathjs instance for the app. Kept separate from the library
 * default so registering currency units (and any future configuration) never
 * leaks into other consumers of mathjs.
 */
export const math = create(all, {})

registerCurrencies(math)
