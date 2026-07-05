import { useMemo, useState } from 'react'
import { evaluateLines, type LineResult } from '../helpers/evaluate'

export function useEditor() {
  const [value, setValue] = useState('')

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
    results,
    sum,
    hasNumbers,
  }
}
