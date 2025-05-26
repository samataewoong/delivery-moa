import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import supabase from "./config/supabaseClient";
import TestLayout from "./pages/MyPage/TestLayout";
import OrderList from "./pages/MyPage/OrderList";
import Home from "./pages/Home";
import Profile from "./pages/MyPage/Profile";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Header />
      <Routes></Routes>

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/mypages" element={<TestLayout />}>
          <Route path="orderlist" element={<OrderList />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
