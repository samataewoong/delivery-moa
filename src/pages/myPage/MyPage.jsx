import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import GaugeBar from "../../components/gaugeBar";
import MyHeader from "./MyHeader";
import styles from "./MyPage.module.css";
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
  const [bear, setBear] = useState("good");

  const handleChargeClick = () => {
    window.open("/delivery-moa/cashcharge", "_blank", "width=500,height=700");
  };

  useEffect(() => {
    let user_id = null;
    const fetchUserData = async () => {
      const {
        data: { session: sessionData },
      } = await supabase.auth.getSession();

      if (!sessionData?.user) {
        alert("로그인이 필요합니다.");
        navigate("/", { replace: true });
        return;
      }
      user_id = sessionData.user.id;
      setSession(sessionData);

      const { data, error } = await supabase
        .from("user")
        .select("nickname, cash, user_rating") // 평점도 포함
        .eq("id", sessionData.user.id)
        .single();

      if (error) {
        console.error("유저정보 조회 실패:", error);
      } else {
        setMyNickname(data.nickname);
        setMyCash(data.cash);
        setMyUserId(sessionData.user.id);
        setMyRating(data.user_rating ?? 50); // 평점 없으면 50
      }
    };

    fetchUserData();
    const userSubscriber = supabase.realtime
      .channel("realtime:user_cash_watch_on_mypage_in_mypage")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user" },
        (payload) => {
          if (payload.new.id === user_id) {
            fetchUserData();
          }
        }
      )
      .subscribe();
    return () => {
      userSubscriber.unsubscribe();
    };
  }, [navigate]);

  const currentMenu = location.pathname.split("/").pop();
  const menuList = [
    { name: "회원정보", path: "userinfo" },
    { name: "주문내역", path: "orderlist" },
    { name: "문의내역", path: "myqna" },
  ];

  useEffect(() => {
    console.log("rating: ", myRating);
    if (myRating >= 80) {
      setBear("good");
    } else if (myRating < 30) {
      setBear("bad");
    } else {
      setBear("soso");
    }
  }, [myRating]);

  return (
    <main className={styles.myPage_main}>
      <div className={styles.myPage_box}>
        <div className={styles.myPage_userInfo}>
          <div className={styles.circle_with_text}>
            <img className={styles.circle} 
            src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/mypagePerson.png">
            </img>
            <div className={styles.circle_text}>
              <div>프로필수정</div>
              <img className={styles.circle_pencil} src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/line-md_pencil%20(1).png" />
            </div>
          </div>
          <div className={styles.userRating_body} v>
            <div className={styles.userRating}>
              <div className={styles.userDetail}>
                <img className={styles.bearImage}
                  src={`https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/${bear}.png`} />
                <div className={styles.usernickName}>{myNickname} 님</div>
              </div>
              {/* <progress className={styles.progress_box} value={myRating} max={100} /> */}
              <GaugeBar value={myRating} />
            </div>
          </div>

          <div className={styles.user_cash}>
            <img
              className={styles["coin_imo"]}
              src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/coin.png"
              alt="코인"
            />
            <div className={styles["coin_confirm"]}>
              {thousands(myCash)}원
            </div>
            <button className={styles.charge_Button} onClick={handleChargeClick}>
              충전
            </button>
          </div>
        </div>
        <div className={styles.main_body}>
          <ul className={styles.my_MenuUl}>
            {menuList.map(({ name, path }) => (
              <li key={path} className={styles.my_MenuLi}>
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
          <div className={styles.my_Menu_right}>
            <MyHeader menuList={menuList} />
            <Outlet context={{ userSession: session, userId: myUserId }} />
          </div>
        </div>
      </div>
    </main>
  );
}
