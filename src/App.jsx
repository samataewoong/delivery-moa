import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Register from './pages/Register'
import Header from './components/Header'
import OrderComplete from './components/Order-Complete/OrderComplete'
import GonguComplete from './components/Gongu-Complete/GonguComplete'
import Footer from './components/Footer'
import RoomPage from './pages/room/RoomPage'
import Login from './pages/Login'
import MyPage from './components/pages/myPage/MyPage';
import MainPage from './pages/MainPage';


function App() {
	return (
		<>
			<BrowserRouter basename={import.meta.env.BASE_URL}>
				<Routes>
					<Route path="/register" element={<Register />} />
					<Route path="/login" element={<Login />} />
					<Route path="/mypage/*" element={<MyPage />} />
					<Route path="/mainpage" element={<MainPage />} />
					<Route path="/room/:room_id" element={<RoomPage />} />
					<Route path="/ordercomplete" element={<OrderComplete />} />
					<Route path="/gongucomplete" element={<GonguComplete />} />
				</Routes>
				<Footer />
				<nav>
					<Link to="/login">로그인</Link>
					<Link to="/mypage/userinfo">마이페이지</Link>&nbsp;
					<Link to="/mainpage">홈</Link>*
					<Link to="/register"> 회원가입 </Link>
				</nav>
			</BrowserRouter>
		</>
	)
}

export default App
