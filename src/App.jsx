import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register";
import Header from "./components/Header";
import OrderComplete from "./components/Order-Complete/OrderComplete";
import GonguComplete from "./components/Gongu-Complete/GonguComplete";
import Review from "./components/User-Review/Review";
import Footer from "./components/Footer";
import RoomPage from "./pages/room/RoomPage";
import Login from "./pages/Login";
import MyPage from "./pages/myPage/MyPage";
import UserInfo from "./pages/myPage/UserInfo";
import EditUser from "./pages/myPage/EditUser";
import MyQnA from "./pages/myPage/MyQnA";
import MainPage from "./pages/MainPage";
import RootPage from "./pages/RootPage";
import OrderList from "./pages/myPage/OrderList";


function App() {
  return (
    <>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<RootPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mainpage" element={<MainPage />} />
          <Route path="/room/:room_id" element={<RoomPage />} />
          <Route path="/gongucomplete" element={<GonguComplete />} />
          <Route path="/ordercomplete/:order_id" element={<OrderComplete />} />
          <Route path="/review/:room_id" element={<Review />} />
          {/* 마이페이지 및 하위 라우트 */}
          <Route path="/mypage" element={<MyPage />}>
            <Route index element={<UserInfo />} />
            <Route path="userinfo" element={<UserInfo />} />
            <Route path="edituser" element={<EditUser />} />
            <Route path="myqna" element={<MyQnA />} />
            <Route path="orderlist" element={<OrderList />} />
          </Route>
          
        </Routes>

        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;
