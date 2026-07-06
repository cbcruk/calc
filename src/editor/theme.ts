import { EditorView } from '@codemirror/view'

/**
 * Editor theme built on CSS variables (defined in index.css) so it adapts to
 * light/dark via prefers-color-scheme without swapping extensions.
 */
export const calcTheme = EditorView.theme({
  '&': {
    height: '100%',
    color: 'var(--cm-fg)',
    backgroundColor: 'transparent',
    fontSize: '15px',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-scroller': {
    fontFamily: "'Fira Code', 'Fira Mono', monospace",
    lineHeight: '24px',
    overflow: 'auto',
  },
  '.cm-content': {
    padding: '16px 0',
    caretColor: 'var(--cm-fg)',
  },
  // Room on the right for inline results, and a positioning context for them.
  '.cm-line': {
    position: 'relative',
    padding: '0 96px 0 16px',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--cm-fg)',
  },
  // Float the (multi-line) placeholder out of flow so it doesn't inflate the
  // empty first line's height — which otherwise stretches the caret.
  '.cm-placeholder': {
    position: 'absolute',
    top: '0',
    left: '16px',
    color: 'var(--cm-comment)',
    pointerEvents: 'none',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'var(--cm-selection)',
  },
  '.cm-inline-result': {
    position: 'absolute',
    right: '16px',
    color: 'var(--cm-result)',
    cursor: 'pointer',
    borderRadius: '4px',
    padding: '0 4px',
  },
  '.cm-inline-result:hover': {
    backgroundColor: 'var(--cm-selection)',
  },
  '.cm-inline-result--copied': {
    color: 'var(--cm-fg)',
  },
  '.cm-inline-result--copied::after': {
    content: '" ✓"',
  },
  '.cm-tooltip': {
    border: '1px solid var(--cm-selection)',
    backgroundColor: 'var(--cm-tooltip-bg)',
    color: 'var(--cm-fg)',
    borderRadius: '6px',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'var(--cm-selection)',
    color: 'var(--cm-fg)',
  },
})
