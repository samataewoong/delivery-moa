import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Register from './pages/Register'
import Header from './components/Header'
import Login from './pages/Login'
import MyPage from './components/pages/myPage/MyPage';


function App() {
	return (
		<>
			<BrowserRouter basename={import.meta.env.BASE_URL}>
				<Header/>
    <Link to="/mypage/userinfo">마이페이지</Link>&nbsp;
			<Link to="/">홈</Link>
				<nav>
					<Link to="/register"> 회원가입 </Link>
					<Link to="/login"> 로그인 </Link>
				</nav>

				<Routes>
					<Route path="/register" element={<Register/>}/>
					<Route path="/login" element={<Login/>}/>
            <Route path="mypage/*" element={<MyPage />} />
				</Routes>


			</BrowserRouter>


		</>
	)
}

export default App
