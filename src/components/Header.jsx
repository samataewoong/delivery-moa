import styles from "./Header.module.css";
import { useState, useEffect } from "react";
import { Link, matchPath } from "react-router-dom";
import supabase from "../config/supabaseClient";
import Hamburger from "../components/Hamburger";

export default function Header({
    excludes
}) {
    if (excludes && excludes.length) {
        let { pathname } = document.location;
        pathname = pathname.replace(`${import.meta.env.BASE_URL}`, "");
        pathname = pathname.substring(0, pathname.indexOf('?') == -1 ? pathname.length : pathname.indexOf('?'));
        const match = excludes.filter((exclude) => (matchPath(exclude, pathname)));
        if (match.length) return <></>;
    }
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
                    <Hamburger
                        isOpen={isOpen}
                        session={session}
                        nickname={nickname}
                        handleLogout={handleLogout}
                        onClose={() => setIsOpen(false)}
                    />
                </div>
            </div>
        </>
    );
}
