import { useState } from 'react'
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'dracula-prism/dist/css/dracula-prism.css'
import { useEditor } from './hooks/useEditor'
import classes from './App.module.css'

const PLACEHOLDER = [
  '월급 = 3000000',
  '저축 = 30% of 월급',
  '월급 - 저축',
  '',
  '3 km to m',
  '10 USD to KRW',
  'line1 * 2',
].join('\n')

const sumFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 10,
})

function App() {
  const { value, setValue, clear, results, sum, hasNumbers } = useEditor()
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  async function copyResult(index: number, output: string) {
    try {
      await navigator.clipboard.writeText(output)
      setCopiedIndex(index)
      window.setTimeout(() => setCopiedIndex(null), 1200)
    } catch {
      // Clipboard may be unavailable (e.g. insecure context); ignore silently.
    }
  }

  return (
    <div className={classes.app}>
      <header className={classes.header}>
        <span className={classes.brand}>계산기</span>
        <div className={classes.headerRight}>
          {hasNumbers && (
            <span className={classes.sum}>
              <span className={classes.sumLabel}>합계</span>
              <span className={classes.sumValue}>{sumFormatter.format(sum)}</span>
            </span>
          )}
          {value && (
            <button type="button" className={classes.clear} onClick={clear}>
              지우기
            </button>
          )}
        </div>
      </header>

      <div className={classes.workspace}>
        <Editor
          value={value}
          onValueChange={(next) => setValue(next)}
          highlight={(code) => highlight(code, languages.js, 'javascript')}
          textareaId="App-textarea"
          padding={0}
          placeholder={PLACEHOLDER}
          className={classes.editor}
        />

        <div className={classes.results} aria-label="계산 결과">
          {results.map((result, index) =>
            result.output ? (
              <button
                key={index}
                type="button"
                className={classes.result}
                title="클릭하여 복사"
                onClick={() => copyResult(index, result.output)}
              >
                {copiedIndex === index ? '복사됨' : result.output}
              </button>
            ) : (
              <span key={index} className={classes.resultEmpty} aria-hidden />
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default App
