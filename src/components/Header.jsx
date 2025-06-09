import styles from "./Header.module.css";
import { useState, useEffect } from "react";
import { Link, matchPath } from "react-router-dom";
import supabase from "../config/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Header({ excludes, toggleMenu }) {
    if (excludes && excludes.length) {
        let { pathname } = document.location;
        pathname = pathname.replace(`${import.meta.env.BASE_URL}`, "");
        pathname = pathname.substring(0, pathname.indexOf('?') == -1 ? (pathname.indexOf('#') == -1 ? pathname.length : pathname.indexOf('#')) : pathname.indexOf('?'));
        const match = excludes.filter((exclude) => (matchPath(exclude, pathname)));
        if (match.length) return <></>;
    }
    const [nickname, setNickname] = useState("");
    const [session, setSession] = useState(null);
    const [keyword, setKeyword] = useState("");
    const [address, setAddress] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (session?.user) {
            const fetchAddress = async () => {
                const { data: addressData } = await supabase
                    .from("user")
                    .select("address")
                    .eq("id", session.user.id)
                    .single();

                setAddress(addressData?.address || "");
            };
            fetchAddress();
        }
    }, [session]);

    async function updateAddress(address) {
        try {
            const { data, error } = await supabase
                .from("user")
                .update({ address })
                .eq('id', session.user.id);

            if (error) {
                throw error;
            }

            setNickname(data.nickname);
            setAddress(data.address);
        } catch (error) {
            console.error(error);
        }
    }

    const handleClick = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                setAddress(data.address);
                updateAddress(data.address);
            },
        }).open();
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

    useEffect(() => {

    })

    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            search();
        }
    }

    const search = () => {
        if (!keyword.trim()) {
            alert("검색어를 입력하세요.");
            return;
        }
        navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
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
                            onKeyDown={onKeyDown}
                            placeholder="음식점 또는 메뉴를 검색해보세요"
                        />
                        <button onClick={search} className={styles["search_btn"]}>
                            검색
                        </button>
                    </div>
                    <div className={styles["location"]}>
                        <div className={styles["location_gps"]}>
                            {session && nickname ? (
                                <>
                                    <button className={styles["location_btn"]} onClick={handleClick}>
                                        <img className={styles["location_icon"]} src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/location_icon_white.png" />
                                    </button>
                                    {address ? (
                                        <div onClick={handleClick}>{address}</div>
                                    ) : (
                                        <div onClick={handleClick}>주소를 입력하세요</div>
                                    )}
                                </>
                            ) : (
                                <div className={styles["main_login"]}>
                                    <Link className={styles["location_login"]} to="/login">로그인</Link>
                                    <Link className={styles["location_login"]} to="/register">회원가입</Link>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles["hamburger"]}>
                        <button onClick={toggleMenu} className={styles["hamburger_btn"]}>
                            <img
                                src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/hamburger-md.png"
                                alt="햄버거 메뉴"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
