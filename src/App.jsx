import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register";
import Header from "./components/Header";
import OrderComplete from "./components/Order-Complete/OrderComplete";
import GonguComplete from "./components/Gongu-Complete/GonguComplete";
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
import AllRoom from "./pages/roomPage/AllRoom";
import RoomCreatePage from "./pages/room_create/RoomCreatePage";
import Hamburger from "./components/Hamburger";
import MainHeader from "./components/MainHeader";
import SelectRoom from "./pages/SelectedRoom";
import React, { useState, useEffect } from "react";
import supabase from "./config/supabaseClient";
import { useLocation, useNavigate } from "react-router-dom";
import Search from "./pages/SearchPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  const fetchNickname = async (user_id) => {
    const { data } = await supabase.from("user").select("nickname").eq("id", user_id).single();
    setNickname(data?.nickname || "");
  };

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) fetchNickname(session.user.id);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchNickname(session.user.id);
      else setNickname("");
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("로그아웃 실패!" + error.message);
    } else {
      setSession(null);
      setNickname("");
      navigate("/login");
    }
  };
  const toggleMenu = (e) => {
    e?.stopPropagation();
    console.log("toggleMenu called");
    setIsOpen(!isOpen);
  };
  const location = useLocation();
  const isMainPage = location.pathname === "/mainpage";

  return (
    <>
        {isMainPage ? (
          <MainHeader toggleMenu={toggleMenu} />
        ) : (
          <Header toggleMenu={toggleMenu} excludes={[
            "/mainpage",
            "/cashcharge",
          ]} />
        )}
        <Routes>
          <Route path="/" element={<RootPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mainpage" element={<MainPage />} />
          <Route path="/roomPage/AllRoom" element={<AllRoom />} />
          <Route path="/room/create/:store_id" element={<RoomCreatePage />} />
          <Route path="/room/:room_id" element={<RoomPage />} />
          <Route path="/store/:store_id" element={<StoreDetail />} />
          <Route path="/ordercomplete/:order_id" element={<OrderComplete />} />
          <Route path="/gongucomplete/:order_id" element={<GonguComplete />} />
          <Route path="/review/:room_id" element={<Review />} />
          <Route path="/storelist" element={<StoreListPage />} />
          <Route path="/search" element={<Search />} />
          <Route path="/forgotpw" element={<ForgotPassword/>}/>
          <Route path="/resetpw" element={<ResetPassword/>}/>
          <Route path="/selectroom/:store_id" element={<SelectRoom/>} />
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
        {isOpen && (
          <Hamburger
            isOpen={isOpen}
            session={session}
            nickname={nickname}
            handleLogout={handleLogout}
            onClose={() => setIsOpen(false)}

          />
        )}
        <Footer excludes={[
          "/cashcharge"
        ]} />
    </>
  );
}

export default App;
