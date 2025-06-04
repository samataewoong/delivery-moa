import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import GaugeBar from "../../components/gaugeBar";
import MyHeader from "./MyHeader";
import styles from "./MyPage.module.css";
import Header from "../../components/Header";
import supabase from "../../config/supabaseClient";
import thousands from "thousands";

export default function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // user 정보 상태
  const [session, setSession] = useState(null);
  const [myUserId, setMyUserId] = useState(null);
  const [myNickname, setMyNickname] = useState("");
  const [myCash, setMyCash] = useState(0);
  const [myRating, setMyRating] = useState(0); // 평점 0~5

  const handleChargeClick = () => {
    window.open("/delivery-moa/cashcharge", "_blank", "width=500,height=700");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        alert("로그인이 필요합니다.");
        navigate("/", { replace: true });
        return;
      }

      setSession(session);

      const { data, error } = await supabase
        .from("user")
        .select("nickname, cash, user_rating") // 평점도 포함
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("유저정보 조회 실패:", error);
      } else {
        setMyNickname(data.nickname);
        setMyCash(data.cash);
        setMyUserId(session.user.id);
        setMyRating(data.user_rating ?? 0); // 평점 없으면 0
      }
    };

    fetchUserData();
  }, [navigate]);

  const currentMenu = location.pathname.split("/").pop();
  const menuList = [
    { name: "회원정보", path: "userinfo" },
    { name: "주문내역", path: "orderlist" },
    { name: "문의내역", path: "myqna" },
  ];

  return (
    <>
      <Header />
      <div className={styles.myPage}>
        <div className={styles.myPageLeft}>
          <div className={styles.profile}>
            <h2 className={styles.userName}>{myNickname} 님</h2>
            <br />
            {/* 평점 0~5 → 0~100으로 변환해서 GaugeBar에 전달 */}
            <GaugeBar value={myRating * 20} />
            <div className={styles.myCash}>
              <span style={{ display: "flex" }}>
                <span className={styles.label}>내 캐시:</span>
                <span className={styles.amount}>{thousands(myCash)}</span>
                <span>원</span>
              </span>
              <button className={styles.chargeButton} onClick={handleChargeClick}>
                충전
              </button>
            </div>
          </div>
          <div className={styles.myMenu}>
            <ul className={styles.myMenuUl}>
              {menuList.map(({ name, path }) => (
                <li key={path} className={styles.myMenuLi}>
                  <Link
                    to={`/mypage/${path}`}
                    style={{
                      textDecoration: "none",
                      fontWeight: currentMenu === path ? "bold" : "normal",
                      color: "black",
                    }}
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.myPageRight}>
          <MyHeader menuList={menuList} />
          <Outlet context={{ userSession: session, userId: myUserId }} />
        </div>
      </div>
    </>
  );
}
