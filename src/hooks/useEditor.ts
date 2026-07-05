import { useCallback, useEffect, useMemo, useState } from 'react'
import type { LineResult } from '../helpers/evaluate'

type EvaluateFn = (source: string) => LineResult[]

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
  const [evaluate, setEvaluate] = useState<EvaluateFn | null>(null)
  const [ratesVersion, setRatesVersion] = useState(0)

  // Load the math engine (mathjs) lazily so it stays out of the initial bundle.
  // The editor starts empty, so it is ready well before the user types.
  // Once loaded, refresh currency rates in the background and re-evaluate if
  // they changed.
  useEffect(() => {
    let active = true
    import('../helpers/evaluate').then(async (mod) => {
      if (!active) {
        return
      }
      setEvaluate(() => mod.evaluateLines)

      const updated = await mod.refreshRates()
      if (active && updated) {
        setRatesVersion((version) => version + 1)
      }
    })
    return () => {
      active = false
    }
  }, [])

  // Persist on every change so the document survives a reload.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // Ignore write failures (quota, private mode, etc.).
    }
  }, [value])

  const clear = useCallback(() => setValue(''), [])

  const results: LineResult[] = useMemo(
    () => (evaluate ? evaluate(value) : []),
    // ratesVersion forces a re-evaluation after live currency rates load.
    [evaluate, value, ratesVersion]
  )

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
