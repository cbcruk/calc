import { StateEffect, StateField, type EditorState } from '@codemirror/state'
import {
  Decoration,
  EditorView,
  WidgetType,
  type DecorationSet,
} from '@codemirror/view'
import type { LineResult } from '../helpers/evaluate'

/** Dispatched by the React wrapper whenever recomputed results are available. */
export const setResults = StateEffect.define<LineResult[]>()

const RESULT_CLASS = 'cm-inline-result'
const COPIED_CLASS = 'cm-inline-result--copied'

/** A non-editable result rendered at the end of a line, right-aligned. */
class ResultWidget extends WidgetType {
  constructor(readonly text: string) {
    super()
  }

  eq(other: ResultWidget): boolean {
    return other.text === this.text
  }

  toDOM(): HTMLElement {
    const span = document.createElement('span')
    span.className = RESULT_CLASS
    span.textContent = this.text
    span.title = '클릭하여 복사'
    return span
  }

  ignoreEvent(): boolean {
    return false
  }
}

function buildDecorations(
  state: EditorState,
  results: LineResult[]
): DecorationSet {
  const widgets = []
  const lineCount = state.doc.lines

  for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
    const result = results[lineNumber - 1]
    if (!result || !result.output) {
      continue
    }

    const line = state.doc.line(lineNumber)
    widgets.push(
      Decoration.widget({
        widget: new ResultWidget(result.output),
        side: 1,
      }).range(line.to)
    )
  }

  return Decoration.set(widgets)
}

/** Holds the inline result widgets, rebuilt whenever new results arrive. */
export const resultsField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(decorations, transaction) {
    let next = decorations.map(transaction.changes)
    for (const effect of transaction.effects) {
      if (effect.is(setResults)) {
        next = buildDecorations(transaction.state, effect.value)
      }
    }
    return next
  },
  provide: (field) => EditorView.decorations.from(field),
})

/** Copy a result to the clipboard when its widget is clicked. */
export const resultCopyHandler = EditorView.domEventHandlers({
  mousedown(event) {
    const target = event.target as HTMLElement
    if (!target.classList.contains(RESULT_CLASS)) {
      return false
    }

    event.preventDefault()
    navigator.clipboard
      ?.writeText(target.textContent ?? '')
      .then(() => {
        target.classList.add(COPIED_CLASS)
        window.setTimeout(() => target.classList.remove(COPIED_CLASS), 900)
      })
      .catch(() => {
        // Clipboard unavailable (insecure context); ignore.
      })
    return true
  },
})
