import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Register from './pages/Register'
import Header from './components/Header'
import Login from './pages/Login'

function App() {
	return (
		<>
			<BrowserRouter basename={import.meta.env.BASE_URL}>
				<Header/>
				<nav>
					<Link to="/register"> 회원가입 </Link>
					<Link to="/login"> 로그인 </Link>
				</nav>

				<Routes>
					<Route path="/register" element={<Register/>}/>
					<Route path="/login" element={<Login/>}/>
				</Routes>


			</BrowserRouter>


		</>
	)
}

export default App
