import { math } from './math'
import { aliasIdentifiers, type AliasMap } from './identifiers'

export { refreshRates } from './math'

export type LineResult = {
  /** The original source line, unchanged. */
  input: string
  /** Formatted result, or empty string for blank / non-math lines. */
  output: string
  /** Raw numeric result when the line evaluates to a plain number, else null. */
  numericValue: number | null
  /** True when the line looked like an expression but failed to evaluate. */
  isError: boolean
}

/** Lines beginning with these markers are treated as free text, not math. */
const COMMENT_MARKERS = ['#', '//']

function isCommentOrBlank(line: string): boolean {
  const trimmed = line.trim()
  return trimmed === '' || COMMENT_MARKERS.some((m) => trimmed.startsWith(m))
}

/**
 * Rewrite natural-language phrases mathjs doesn't understand into equivalent
 * expressions. Currently: "<percentage> of <expr>" -> "<percentage> * <expr>",
 * so `20% of 50` evaluates to 10. Only "of" directly following a percentage is
 * translated, to avoid mangling prose lines like "list of items".
 */
function normalizeExpression(line: string): string {
  return line.replace(/(%)\s+of\s+/gi, '$1 * ')
}

function formatResult(value: unknown): string {
  if (value === undefined || value === null) {
    return ''
  }

  // User-defined functions (e.g. `f(x) = x^2`) have no meaningful display value.
  if (typeof value === 'function') {
    return ''
  }

  try {
    // Round to 6 decimals: tames long division tails (e.g. currency) and also
    // clears floating-point noise like 0.1 + 0.2 -> 0.30000000000000004.
    // The function form applies to plain numbers, units, and matrices alike.
    return math.format(value, (n) => String(Math.round(n * 1e6) / 1e6))
  } catch {
    return String(value)
  }
}

/**
 * Evaluate a multi-line document as a Soulver-style notepad.
 *
 * All lines share a single scope evaluated top to bottom, so variables defined
 * on one line are visible to later lines:
 *
 *   price = 100
 *   tax = price * 0.1   // -> 10
 *
 * Each line's result is also exposed as `line1`, `line2`, ... so later lines
 * can reference earlier results directly:
 *
 *   2 + 3        // -> 5   (line1)
 *   line1 * 10   // -> 50
 *
 * Non-ASCII names (e.g. Korean `월급`) are aliased to ASCII before evaluation,
 * so `월급 = 3000000` works just like an ASCII variable.
 *
 * Blank lines, comments, and free text produce empty output instead of an error.
 */
export function evaluateLines(source: string): LineResult[] {
  const scope: Record<string, unknown> = {}
  const aliasMap: AliasMap = new Map()
  const lines = source.split('\n')

  return lines.map((line, index) => {
    if (isCommentOrBlank(line)) {
      return { input: line, output: '', numericValue: null, isError: false }
    }

    try {
      const prepared = normalizeExpression(aliasIdentifiers(line, aliasMap))
      const result = math.evaluate(prepared, scope)

      if (result !== undefined) {
        scope[`line${index + 1}`] = result
      }

      const numericValue =
        typeof result === 'number' && Number.isFinite(result) ? result : null

      return {
        input: line,
        output: formatResult(result),
        numericValue,
        isError: false,
      }
    } catch {
      // Non-math prose (labels, notes) lands here too, so fail quietly.
      return { input: line, output: '', numericValue: null, isError: true }
    }
  })
}
