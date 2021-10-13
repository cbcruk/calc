import * as math from 'mathjs'

export function evaluate(line: string) {
  try {
    return math.evaluate(line)
  } catch (e) {
    return '😣'
  }
}
