/**
 * mathjs only accepts ASCII identifiers, so Korean (and other non-ASCII)
 * variable names like `월급` fail to parse. This module rewrites such names to
 * stable ASCII aliases before evaluation.
 *
 * Only the input is aliased; results shown to the user are numbers/units, so no
 * reverse mapping is needed. Within a single document evaluation the same name
 * always maps to the same alias, so a variable defined on one line stays
 * referenceable on later lines.
 */

/** Matches a word made of Unicode letters/digits/underscore (an identifier). */
const IDENTIFIER = /[\p{L}_][\p{L}\p{N}_]*/gu

/** True when a word contains any character outside the 7-bit ASCII range. */
const HAS_NON_ASCII = /[^\x00-\x7F]/

/** Prefix chosen to avoid colliding with real identifiers or `lineN` refs. */
const ALIAS_PREFIX = '_kv'

export type AliasMap = Map<string, string>

/**
 * Replace every non-ASCII identifier in `line` with an ASCII alias, reusing
 * `aliasMap` so repeated names resolve to the same alias across lines. ASCII
 * words (function names, units like `km`/`USD`, keywords like `to`/`of`) are
 * left untouched.
 */
export function aliasIdentifiers(line: string, aliasMap: AliasMap): string {
  return line.replace(IDENTIFIER, (word) => {
    if (!HAS_NON_ASCII.test(word)) {
      return word
    }

    let alias = aliasMap.get(word)

    if (alias === undefined) {
      alias = `${ALIAS_PREFIX}${aliasMap.size}`
      aliasMap.set(word, alias)
    }

    return alias
  })
}
