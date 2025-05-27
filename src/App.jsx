import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'

function App() {
	return (
		<BrowserRouter basename={import.meta.env.BASE_URL}>
			<Header/>
			<Routes>
			</Routes>
		</BrowserRouter>
	)
}

export default App
