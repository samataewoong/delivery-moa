import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register";
import Header from "./components/Header";
import OrderComplete from "./components/Order-Complete/OrderComplete";
import Review from "./components/User-Review/Review";
import Footer from "./components/Footer";
import RoomPage from "./pages/room/RoomPage";
import StoreDetail from "./pages/StoreDetail";
import Login from "./pages/Login";
import MyPage from "./pages/myPage/MyPage";
import UserInfo from "./pages/myPage/UserInfo";
import EditUser from "./pages/myPage/EditUser";
import MyQnA from "./pages/myPage/MyQnA";
import MainPage from "./pages/MainPage";
import RootPage from "./pages/RootPage";
import OrderList from "./pages/myPage/OrderList";
import CashCharge from "./components/CashCharge";
import StoreListPage from "./pages/StoreListPage";
import RoomCreatePage from "./pages/room_create/RoomCreatePage";

function App() {
  return (
    <>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<RootPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mainpage" element={<MainPage />} />
          <Route path="/room/create/:store_id" element={<RoomCreatePage />} />
          <Route path="/room/:room_id" element={<RoomPage />} />
          <Route path="/store/:store_id" element={<StoreDetail />} />
          <Route path="/ordercomplete/:order_id" element={<OrderComplete />} />
          <Route path="/review/:room_id" element={<Review />} />
          <Route path="/storelist" element={<StoreListPage />} />
          {/* 마이페이지 및 하위 라우트 */}
          <Route path="/mypage" element={<MyPage />}>
            <Route index element={<UserInfo />} />
            <Route path="userinfo" element={<UserInfo />} />
            <Route path="edituser" element={<EditUser />} />
            <Route path="myqna" element={<MyQnA />} />
            <Route path="orderlist" element={<OrderList />} />
          </Route>
          <Route path="cashcharge" element={<CashCharge />} />
        </Routes>

        <Footer excludes={[
          "/cashcharge"
        ]}/>
      </BrowserRouter>
    </>
  );
}

export default App;
