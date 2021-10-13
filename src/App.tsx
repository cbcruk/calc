import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'dracula-prism/dist/css/dracula-prism.css'
import { useNumeric } from './hooks/useNumeric'
import { useEditor } from './hooks/useEditor'
import classes from './App.module.css'

function App() {
  const { value, setValue, outputValue } = useEditor()
  useNumeric()

  return (
    <div className={classes.wrapper}>
      <Editor
        value={value}
        onValueChange={(value) => setValue(value)}
        highlight={(value) => highlight(value, languages.js, 'ko')}
        textareaId="App-textarea"
        padding={10}
        className={classes.editor}
      />
      <pre className={classes.output}>{outputValue}</pre>
    </div>
  )
}

export default App
