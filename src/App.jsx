import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Register from './pages/Register'
import Header from './components/Header'
import Footer from './components/Footer'
import RoomPage from './pages/room/RoomPage'
import Login from './pages/Login'
import MyPage from './components/pages/myPage/MyPage';

function App() {
	return (
		<>
			<BrowserRouter basename={import.meta.env.BASE_URL}>
				<Header />
				<nav>
					<Link to="/register"> 회원가입 </Link>
					<Link to="/login"> 로그인 </Link>
					<Link to="/mypage/userinfo">마이페이지</Link>&nbsp;
					<Link to="/">홈</Link>*
				</nav>
				<Routes>
					<Route path="/register" element={<Register />} />
					<Route path="/login" element={<Login />} />
					<Route path="/mypage/*" element={<MyPage />} />
				  <Route path="/room/:room_id" element={<RoomPage />} />
				</Routes>
				<Footer/>
			</BrowserRouter>


		</>
	)
}

export default App
