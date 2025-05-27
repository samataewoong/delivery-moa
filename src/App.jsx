import { useState } from 'react'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Header from './components/Header'
import MyPage from './components/pages/myPage/MyPage';

function App() {
	return (
		<BrowserRouter basename={import.meta.env.BASE_URL}>
			<Header />
			<Link to="/mypage/userinfo">마이페이지</Link>&nbsp;
			<Link to="/">홈</Link>

			<Routes>
				<Route path="mypage/*" element={<MyPage />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App
