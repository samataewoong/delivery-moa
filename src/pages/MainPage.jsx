import styles from "./MainPage.module.css";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import supabase from "../config/supabaseClient";
import Hamburger from "../components/Hamburger";

export default function MainHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const [nickname, setNickname] = useState("");
    const [session, setSession] = useState(null);
    const [keyword, setKeyword] = useState("");

    const [address, setAddress] = useState("");
    const [showMapModal, setShowMapModal] = useState(false);
    const closeMapModal = () => setShowMapModal(false);

    const mapRef = useRef(null);

    const waitForKakaoMaps = () => {
        return new Promise((resolve, reject) => {
            if (
                window.kakao &&
                window.kakao.maps &&
                window.kakao.maps.Map &&
                window.kakao.maps.services &&
                window.kakao.maps.services.Geocoder
            ) {
                resolve();
            } else {
                reject(new Error('카카오 지도 API가 준비되지 않았습니다.'));
            }
        });
    };

    const handleClick = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                setAddress(data.address);
                setShowMapModal(true);
            },
        }).open();
    };

    const showMap = async (addr) => {
        await waitForKakaoMaps();

        if (!mapRef.current) return;

        const geocoder = new window.kakao.maps.services.Geocoder();

        geocoder.addressSearch(addr, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
                const map = new window.kakao.maps.Map(mapRef.current, {
                    center: coords,
                    level: 3,
                });

                setTimeout(() => {
                    window.kakao.maps.event.trigger(map, "resize");
                }, 200);

                new window.kakao.maps.Marker({
                    map: map,
                    position: coords,
                });
            }
        });
    };

    useEffect(() => {
        if (showMapModal && address) {
            setTimeout(() => {
                showMap(address);
            }, 300);
        }
    }, [showMapModal, address]);

    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            search();
        }
    }

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
        if (!keyword.trim()) {
            alert("검색어를 입력하세요.");
            return;
        }
        alert(`검색어: ${keyword}`);
    };


    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase.from("menu_category").select("id, category");
            if (error) {
                console.error("카테고리 불러오기 오류:", error);
            } else {
                setCategories(data);
            }
        };
        fetchCategories();
    }, []);

    const imgBaseUrl = "https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/"

    return (
        <>
            <header className={styles["main_header"]}>
                <div className={styles["main_container"]}>
                    <div className={styles["hLogo_img"]}>
                        <Link to="/mainpage" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <img
                                src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/main_logo.png"
                                alt="로고"
                            />
                        </Link>

                    </div>
                    <div>
                        <ul className={styles["main_menu"]}>
                            <li>메뉴</li>
                            <li>진행중인 공구</li>
                            <li>랭킹</li>
                            <li>이벤트</li>
                        </ul>
                    </div>
                    <div className={styles["location"]}>
                        <div>
                            <button className={styles["location_btn"]} onClick={handleClick}>
                                <img src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/location_imo.png" />
                            </button>
                            {showMapModal && (
                                <div className={styles["modalStyle"]} onClick={closeMapModal}>
                                    <div className={styles["popupStyle"]} onClick={(e) => e.stopPropagation()}>
                                        <div ref={mapRef} className={styles["modal_map"]}></div>
                                        <div style={{ textAlign: "center", marginTop: "15px" }}>
                                            <button
                                                onClick={closeMapModal} className={styles["modal_btn"]}>
                                                닫기
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles["location_gps"]}>
                            {session && nickname ? (
                                address ? (
                                    <>
                                        <div className={styles["location_gps"]}>{address}</div>
                                    </>
                                ) : (
                                    "주소를 입력하세요"
                                )
                            ) : (
                                <div>
                                    <Link to="/login">로그인</Link>
                                    <Link to="/register"> 회원가입 </Link>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles["main_hamburger"]}>
                        <button onClick={toggleMenu} className={styles["main_hamburger_btn"]}>
                            <img
                                src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/main_hamburger-md.png"
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
            </header>
            <div className={styles["search_header"]}>
                <div className={styles["search_box"]}>
                    <div className={styles["search_text"]}>오늘은 무엇을 함께 먹을까요?</div>
                    <div className={styles["search"]}>
                        <input
                            type="text"
                            id="searchKeyword"
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
                </div>
            </div>
            <div className={styles["body_box"]}>
                <div className={styles["body_container"]}>
                    <div className={styles["food_category_wrap"]}>
                        <div className={styles["food_category"]}>음식 카테고리</div>
                        <div className={styles["food_category_move"]}>전체보기→</div>
                    </div>
                    <div className={styles["circle_category_wrap"]}>
                        {categories.map((item) => (
                            <Link key={item.id} to="/">
                                <div className={styles["circle_with_text"]}>
                                    <div className={styles["circle"]}>
                                        <img
                                            src={`${imgBaseUrl}${item.id}.png`}
                                            alt={`${item.category} 이미지`} />
                                    </div>
                                    <div className={styles["circle_text"]}>{item.category}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className={styles["gongu_wrap"]}>
                        <div className={styles["gongu_list"]}>진행중인 공구방</div>
                        <div className={styles["gongu_list_move"]}>전체보기→</div>
                    </div>
                </div>

            </div>
        </>
    );
}
