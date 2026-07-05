import { useCallback, useEffect, useMemo, useState } from 'react'
import { evaluateLines, type LineResult } from '../helpers/evaluate'

const STORAGE_KEY = 'calc:document'

function loadInitialValue(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    // localStorage can throw in private mode or sandboxed contexts.
    return ''
  }
}

export function useEditor() {
  const [value, setValue] = useState<string>(loadInitialValue)

  // Persist on every change so the document survives a reload.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // Ignore write failures (quota, private mode, etc.).
    }
  }, [value])

  const clear = useCallback(() => setValue(''), [])

  const results: LineResult[] = useMemo(() => evaluateLines(value), [value])

  const { sum, hasNumbers } = useMemo(() => {
    const numbers = results
      .map((result) => result.numericValue)
      .filter((n): n is number => n !== null)

    return {
      sum: numbers.reduce((total, n) => total + n, 0),
      hasNumbers: numbers.length > 0,
    }
  }, [results])

  return {
    value,
    setValue,
    clear,
    results,
    sum,
    hasNumbers,
  }
}
