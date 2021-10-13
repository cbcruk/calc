import { useState } from 'react'
import { evaluate } from '../helpers/evaluate'

export function useEditor() {
  const [value, setValue] = useState('')
  const outputValue =
    value &&
    value
      .split('\n')
      .map((line) => evaluate(line))
      .join('\n')

  return {
    value,
    setValue,
    outputValue,
  }
}
