import {
  HighlightStyle,
  StreamLanguage,
  syntaxHighlighting,
} from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import type { Extension } from '@codemirror/state'

/** Currency codes we register as units (kept in sync with helpers/currency). */
const CURRENCY = /^(USD|EUR|GBP|JPY|CNY|KRW)\b/
const KEYWORD = /^(to|in|of|mod)\b/
const NUMBER = /^\d+(\.\d+)?([eE][+-]?\d+)?/
const IDENTIFIER = /^[\p{L}_][\p{L}\p{N}_]*/u

/**
 * A minimal stream tokenizer for the calc notepad language. Returns standard
 * token names that StreamLanguage maps to highlight tags.
 */
const calcLanguage = StreamLanguage.define({
  token(stream) {
    if (stream.match(/^\s+/)) {
      return null
    }
    if (stream.match(/^(#|\/\/).*/)) {
      return 'comment'
    }
    if (stream.match(NUMBER)) {
      return 'number'
    }
    if (stream.match(KEYWORD)) {
      return 'keyword'
    }
    if (stream.match(CURRENCY)) {
      return 'typeName'
    }
    if (stream.match(/^[+\-*/^%=(),]/)) {
      return 'operator'
    }
    if (stream.match(IDENTIFIER)) {
      return 'variableName'
    }
    stream.next()
    return null
  },
})

const highlightStyle = HighlightStyle.define([
  { tag: t.comment, color: 'var(--cm-comment)', fontStyle: 'italic' },
  { tag: t.number, color: 'var(--cm-number)' },
  { tag: t.keyword, color: 'var(--cm-keyword)' },
  { tag: t.operator, color: 'var(--cm-operator)' },
  { tag: t.typeName, color: 'var(--cm-currency)' },
  { tag: t.variableName, color: 'var(--cm-variable)' },
])

export const calcHighlighting: Extension = [
  calcLanguage,
  syntaxHighlighting(highlightStyle),
]
