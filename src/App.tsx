import { useEditor } from './hooks/useEditor'
import { CalcEditor } from './editor/CalcEditor'
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

      <CalcEditor
        value={value}
        results={results}
        onChange={setValue}
        placeholder={PLACEHOLDER}
        className={classes.editor}
      />
    </div>
  )
}

export default App
