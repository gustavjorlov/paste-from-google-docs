import { useState } from 'react'
import './App.css'

function App() {
  const [text, setText] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  return (
    <div className="app-container">
      <h1>Simple Text Area</h1>
      <div className="text-area-container">
        <textarea 
          value={text}
          onChange={handleChange}
          placeholder="Type something here..."
          rows={10}
          cols={50}
          className="text-area"
        />
      </div>
      <div className="character-count">
        Character count: {text.length}
      </div>
    </div>
  )
}

export default App
