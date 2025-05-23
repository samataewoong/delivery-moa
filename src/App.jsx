import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
			<BrowserRouter basename={import.meta.env.BASE_URL}>
			  <Routes>
			    <Route path="/" element={<></>} />
			  </Routes>
			</BrowserRouter>
  )
}

export default App
