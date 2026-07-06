import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, placeholder as cmPlaceholder } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import type { LineResult } from '../helpers/evaluate'
import { calcHighlighting } from './highlight'
import { calcCompletions } from './completion'
import { calcTheme } from './theme'
import { resultCopyHandler, resultsField, setResults } from './inlineResults'

type CalcEditorProps = {
  value: string
  results: LineResult[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/** Build a placeholder extension, preserving line breaks (the string form collapses them). */
function makePlaceholder(text?: string) {
  if (!text) {
    return []
  }
  if (!text.includes('\n')) {
    return cmPlaceholder(text)
  }

  const dom = document.createElement('div')
  for (const line of text.split('\n')) {
    const lineEl = document.createElement('div')
    lineEl.textContent = line || ' '
    dom.appendChild(lineEl)
  }
  return cmPlaceholder(dom)
}

export function CalcEditor({
  value,
  results,
  onChange,
  placeholder,
  className,
}: CalcEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  // Keep the latest onChange without re-creating the editor.
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Create the editor once.
  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const view = new EditorView({
      parent: containerRef.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap, ...completionKeymap]),
          autocompletion({ override: [calcCompletions], activateOnTyping: true }),
          calcHighlighting,
          resultsField,
          resultCopyHandler,
          calcTheme,
          EditorView.lineWrapping,
          makePlaceholder(placeholder),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString())
            }
          }),
        ],
      }),
    })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // Editor is created once; value/placeholder are synced via effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync external value changes (e.g. the clear button) into the editor.
  useEffect(() => {
    const view = viewRef.current
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      })
    }
  }, [value])

  // Push recomputed results into the editor as inline widgets.
  useEffect(() => {
    viewRef.current?.dispatch({ effects: setResults.of(results) })
  }, [results])

  return <div ref={containerRef} className={className} />
}
