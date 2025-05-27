import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Register from './pages/Register'
import Header from './components/Header'

function App() {
	return (
		<>
			<BrowserRouter basename={import.meta.env.BASE_URL}>
				<Header/>
				<nav>
					<Link to="/register"> 회원가입 </Link>
				</nav>

				<Routes>
					<Route path="/" element={<></>} />
					<Route path="/register" element={<Register/>}/>
				</Routes>


			</BrowserRouter>


		</>
	)
}

export default App
