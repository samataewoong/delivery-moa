import styles from "./Header.module.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import supabase from "../config/supabaseClient";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [nickname, setNickname] = useState("");
    const [session, setSession] = useState(null);
    const [keyword, setKeyword] = useState("");

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

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
        }
    };

    const search = () => {
        alert(`검색어: ${keyword}`);
    };

    return (
        <>
            <div className={styles["header"]}>
                <div className={styles["container"]}>
                    <div className={styles["hLogo_img"]}>
                        <Link to="/mainpage" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <img
                            src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/header_logo.png"
                            alt="로고"
                        />
                        </Link>
                        
                    </div>
                    <div className={styles["search"]}>
                        <input
                            type="text"
                            className={styles["search_value"]}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="음식점 또는 메뉴를 검색해보세요"
                        />
                        <button onClick={search} className={styles["search_btn"]}>
                            검색
                        </button>
                    </div>
                    <div className={styles["hamburger"]}>
                        <button onClick={toggleMenu} className={styles["hamburger_btn"]}>
                            <img
                                src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/hamburger-md.png"
                                alt="햄버거 메뉴"
                            />
                        </button>
                    </div>

                    {isOpen && (
                        <div className={styles["hamburger_nav"]}>
                            <div className={styles["mypage"]}>
                                
                                <img
                                    className={styles["mypage_icon"]}
                                    src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/home-black.png"
                                    alt="마이페이지"
                                />
                                <div className={styles["mypage_text"]}>마이페이지</div>
                            </div>

                            {session && nickname ? (
                                <div className={styles["user_coin"]}>
                                    <div className={styles["userName"]}>
                                        {nickname}님
                                        <button className={styles["userName_btn"]} onClick={handleLogout}>로그아웃</button>
                                    </div>
                                    <img
                                        className={styles["coin_imo"]}
                                        src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/coin.png"
                                        alt="코인"
                                    />
                                    <div className={styles["coin_confirm"]}>37000</div>
                                </div>
                            ) : (
                                <div id={styles["user_notlogin"]}>
                                    <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        로그인해주세요
                                    </Link>
                                    <Link to="/register"> 회원가입 </Link>
					                <Link to="/login"> 로그인 </Link>
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
                    )}
                </div>
            </div>
        </>
    );
}
