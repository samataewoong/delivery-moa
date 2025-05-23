import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
			<BrowserRouter base={import.meta.env.BASE_URL}>
			  <Routes>
			    <Route path="/" element={<></>} />
			  </Routes>
			</BrowserRouter>
  )
}

export default App
