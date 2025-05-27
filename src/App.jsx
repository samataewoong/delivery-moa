// import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
// import supabase from "./config/supabaseClient";
import TestLayout from "./pages/MyPage/TestLayout";
import OrderList from "./pages/MyPage/OrderList";
import Home from "./pages/Home";
import Profile from "./pages/MyPage/Profile";
import DummyPayment from "./pages/CashPay";
import Order from "./pages/Order";
import Pay from "./pages/CashPay";
import Test from "./pages/Test";
import QnABoard from "./pages/QnA/QnA";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="order" element={<Order />} />
        <Route path="pay" element={<Pay />} />
        <Route path="test" element={<Test />} />
        <Route path="qna" element={<QnABoard />} />
        <Route path="/mypages" element={<TestLayout />}>
          <Route path="orderlist" element={<OrderList />} />
          <Route path="payment" element={<DummyPayment />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
