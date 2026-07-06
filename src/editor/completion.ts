import type { CompletionContext, CompletionResult } from '@codemirror/autocomplete'

const KEYWORDS = ['to', 'in', 'of', 'mod']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'KRW']
const UNITS = [
  'mm', 'cm', 'm', 'km', 'inch', 'ft', 'yard', 'mile',
  'mg', 'g', 'kg', 'ton', 'lb', 'oz',
  'ml', 'l', 'gal',
  'sec', 'min', 'hour', 'day', 'week', 'month', 'year',
  'celsius', 'fahrenheit', 'kelvin',
  'byte', 'kB', 'MB', 'GB', 'TB',
]
const FUNCTIONS = [
  'sqrt', 'cbrt', 'abs', 'round', 'floor', 'ceil',
  'min', 'max', 'sum', 'mean', 'median',
  'log', 'log10', 'log2', 'exp',
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  'pow', 'gcd', 'lcm', 'factorial',
]

const IDENTIFIER = /[\p{L}_][\p{L}\p{N}_]*/u
const ASSIGNMENT = /([\p{L}_][\p{L}\p{N}_]*)\s*=(?!=)/gu
const RESERVED = new Set([...KEYWORDS, ...CURRENCIES, ...UNITS, ...FUNCTIONS])

const STATIC_OPTIONS = [
  ...KEYWORDS.map((label) => ({ label, type: 'keyword' })),
  ...CURRENCIES.map((label) => ({ label, type: 'type' })),
  ...UNITS.map((label) => ({ label, type: 'constant' })),
  ...FUNCTIONS.map((label) => ({
    label: `${label}(`,
    displayLabel: label,
    type: 'function',
  })),
]

/** Collect variable names the user has assigned anywhere in the document. */
function documentVariables(doc: string): string[] {
  const names = new Set<string>()
  for (const match of doc.matchAll(ASSIGNMENT)) {
    const name = match[1]
    if (!RESERVED.has(name)) {
      names.add(name)
    }
  }
  return [...names]
}

/**
 * Suggest keywords, units, currencies, functions, and user-defined variables
 * (including Korean names) as the user types an identifier.
 */
export function calcCompletions(
  context: CompletionContext
): CompletionResult | null {
  const word = context.matchBefore(IDENTIFIER)
  if (!word || (word.from === word.to && !context.explicit)) {
    return null
  }

  const variables = documentVariables(context.state.doc.toString()).map(
    (label) => ({ label, type: 'variable' })
  )

  return {
    from: word.from,
    options: [...variables, ...STATIC_OPTIONS],
  }
}
