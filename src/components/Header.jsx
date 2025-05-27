import "./Header.css";
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
            <div className="header">
                <div className="container">
                    <div className="hLogo">
                        <Link to="/main" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <img
                            src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/header_logo.png"
                            alt="로고"
                        />
                        </Link>
                        
                    </div>
                    <div className="search">
                        <input
                            type="text"
                            className="search_value"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="음식점 또는 메뉴를 검색해보세요"
                        />
                        <button onClick={search} className="search_btn">
                            검색
                        </button>
                    </div>
                    <div className="hamburger">
                        <button onClick={toggleMenu} className="hamburger_btn">
                            <img
                                src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/hamburger-md.png"
                                alt="햄버거 메뉴"
                            />
                        </button>
                    </div>

                    {isOpen && (
                        <div className="hamburger_nav">
                            <div className="mypage">
                                <img
                                    className="mypage_icon"
                                    src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/home-black.png"
                                    alt="마이페이지"
                                />
                                <div className="mypage_text">마이페이지</div>
                            </div>

                            {session && nickname ? (
                                <div className="user_coin">
                                    <div className="userName">{nickname}님
                                    </div>
                                    <img
                                        className="coin_imo"
                                        src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/coin.png"
                                        alt="코인"
                                    />
                                    <div className="coin_confirm">37000</div>
                                </div>
                            ) : (
                                <div id="user_notlogin">
                                    <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        로그인해주세요
                                    </Link>
                                </div>

                            )}

                            <div className="event_banner">
                                <img
                                    className="event_banner1"
                                    src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/event_banner1.png"
                                    alt="배너1"
                                />
                                <img
                                    className="event_banner2"
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
