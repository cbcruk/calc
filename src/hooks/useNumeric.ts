import { useEffect, useRef } from 'react'

export function useNumeric() {
  const editorRef = useRef()

  useEffect(() => {
    const textarea = document.getElementById('App-textarea')

    if (textarea) {
      textarea.inputMode = 'numeric'
    }
  }, [editorRef])

  return editorRef
}
