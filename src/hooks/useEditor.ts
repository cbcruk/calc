import { useMemo, useState } from 'react'
import { evaluateLines, type LineResult } from '../helpers/evaluate'

export function useEditor() {
  const [value, setValue] = useState('')

  const results: LineResult[] = useMemo(() => evaluateLines(value), [value])
  const outputValue = results.map((result) => result.output).join('\n')

  return {
    value,
    setValue,
    results,
    outputValue,
  }
}
