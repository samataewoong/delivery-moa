import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import OrderComplete from './components/Order-Complete/OrderComplete'
import GonguComplete from './components/Gongu-Complete/GonguComplete'


function App() {
	return (
		<BrowserRouter basename={import.meta.env.BASE_URL}>
			<Header />
			<Routes>
			    <Route path="/ordercomplete" element={<OrderComplete />} /> 
				<Route path="/gongucomplete" element={<GonguComplete />} /> 
			</Routes>
		</BrowserRouter>
	)
}

export default App
