import styles from "./MainHeader.module.css";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import supabase from "../config/supabaseClient";
import Hamburger from "../components/Hamburger";
import CloseRoom from "../components/CloseRoom";

export default function MainHeader({ toggleMenu }) {
    const [nickname, setNickname] = useState("");
    const [session, setSession] = useState(null);

    const [address, setAddress] = useState("");
    const [showMapModal, setShowMapModal] = useState(false);
    const closeMapModal = () => setShowMapModal(false);


    const mapRef = useRef(null);
    //지도
    const waitForKakaoMaps = (retries = 10, interval = 300) => {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const check = () => {
                if (
                    window.kakao &&
                    window.kakao.maps &&
                    window.kakao.maps.Map &&
                    window.kakao.maps.services &&
                    window.kakao.maps.services.Geocoder
                ) {
                    resolve();
                } else if (attempts >= retries) {
                    reject(new Error('카카오 지도 API가 준비되지 않았습니다.'));
                } else {
                    attempts++;
                    setTimeout(check, interval);
                }
            };
            check();
        });
    };
    async function updateAddress(address) {
        try {
            const { data, error } = await supabase
                .from("user")
                .update({ address })
                .eq('id', session.user.id);

            if (error) {
                throw error;
            }

            if (data && data.length > 0) {
                setAddress(data[0].address);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleClick = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                setAddress(data.address);
                updateAddress(data.address);
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

    //햄버거
    const fetchNickname = async (user_id) => {
        const { data } = await supabase.from("user").select("nickname").eq("id", user_id).single();
        setNickname(data?.nickname || "");
    };
    //로그인 정보
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
        async function fetchAddress() {
            if (!session || !session.user.id) return;
            const { data, error } = await supabase
                .from("user")
                .select("address")
                .eq("id", session.user.id);

            if (error) {
                console.error("address 불러오기 실패:", error);
            } else {
                if (data && data.length > 0) {
                    setAddress(data[0].address);
                }
            }
        }
        fetchAddress();
    }, [session]);

    const userId = session?.user?.id;
    return (
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
                        <li><Link to="/storelist">메뉴</Link></li>
                        <li>
                            <Link to="/roomPage/AllRoom" state={{ userId }}>진행중인 공구</Link>
                        </li>
                        <li>랭킹</li>
                        <li>이벤트</li>
                    </ul>
                </div>
                <div className={styles["location"]}>
                    <div className={styles["location_gps"]}>
                        {session && nickname ? (
                            <>
                                <button className={styles["location_btn"]} onClick={handleClick}>
                                    <img className={styles["location_icon"]} src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/location_icon_red.png" />
                                </button>
                                <div onClick={handleClick}>
                                    {address || "주소를 입력하세요"}
                                </div>
                            </>
                        ) : (
                            <div className={styles["main_login"]}>
                                <Link className={styles["location_login"]} to="/login">로그인</Link>
                                <Link className={styles["location_login"]} to="/register">회원가입</Link>
                            </div>
                        )}

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
                </div>
                <div className={styles["main_hamburger"]}>
                    <button onClick={toggleMenu} className={styles["main_hamburger_btn"]}>
                        <img
                            src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/main_hamburger-md.png"
                            alt="햄버거 메뉴"
                        />
                    </button>
                </div>
            </div>
        </header>
    )
}