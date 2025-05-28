import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./Hamburger.module.css";

export default function HamburgerMenu({ isOpen, session, nickname, handleLogout }) {
    if (!isOpen) return null;

    return (
        <div className={styles["hamburger_nav"]}>
            <div className={styles["mypage"]}>
                <img
                    className={styles["mypage_icon"]}
                    src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/home-black.png"
                    alt="마이페이지"
                />
                <div className={styles["mypage_text"]}>
                    {session && nickname ? <Link to="/mypage/userinfo" state={{ session }}>{nickname}님의 마이페이지</Link> : <Link to="/mainpage">로그인이 필요합니다.</Link>}
                </div>

            </div>

            {session && nickname ? (
                <div className={styles["user_coin"]}>
                    <div className={styles["userName"]}>{nickname}님</div>
                    <button className={styles["userName_btn"]} onClick={handleLogout}>로그아웃</button>
                    <img
                        className={styles["coin_imo"]}
                        src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/coin.png"
                        alt="코인"
                    />
                    <div className={styles["coin_confirm"]}>37000</div>
                </div>
            ) : (
                <div id={styles["user_notlogin"]}>
                    <Link to="/login"> 로그인 </Link>
                    <Link to="/register"> 회원가입 </Link>
                </div>
            )}

            <div className={styles["event_banner"]}>
                <img
                    className={styles["event_banner1"]}
                    src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/event_banner1.png"
                    alt="배너1"
                />
                <img
                    className={styles["event_banner2"]}
                    src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/event_banner2.png"
                    alt="배너2"
                />
            </div>

            {session && nickname && (
                <div>
                    <h3>참여중인 채팅방 목록</h3>
                </div>
            )}
        </div>
    );
}
