import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'dracula-prism/dist/css/dracula-prism.css'
import { useEditor } from './hooks/useEditor'
import classes from './App.module.css'

const PLACEHOLDER = [
  'price = 100',
  'tax = price * 0.1',
  'price + tax',
  '',
  '3 km to m',
  'line1 * 2',
].join('\n')

function App() {
  const { value, setValue, outputValue } = useEditor()

  return (
    <div className={classes.wrapper}>
      <Editor
        value={value}
        onValueChange={(value) => setValue(value)}
        highlight={(value) => highlight(value, languages.js, 'javascript')}
        textareaId="App-textarea"
        padding={10}
        placeholder={PLACEHOLDER}
        className={classes.editor}
      />
      <pre className={classes.output}>{outputValue}</pre>
    </div>
  )
}

export default App
