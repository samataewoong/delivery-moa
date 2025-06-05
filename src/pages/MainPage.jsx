import styles from "./MainPage.module.css";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import supabase from "../config/supabaseClient";
import Hamburger from "../components/Hamburger";
import CloseRoom from "../components/CloseRoom";

export default function MainHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const [nickname, setNickname] = useState("");
    const [session, setSession] = useState(null);
    const [keyword, setKeyword] = useState("");

    const [address, setAddress] = useState("");
    const [showMapModal, setShowMapModal] = useState(false);
    const closeMapModal = () => setShowMapModal(false);

    const [categories, setCategories] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [menu, setMenu] = useState([]);

    const mapRef = useRef(null);
    //지도
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
    //햄버거
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

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
                console.error("address 불러오기 실패패:", error);
            } else {
                setAddress(data[0].address);
            }
        }
        fetchAddress();
    }, [session]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            alert("로그아웃 실패!" + error.message);
        } else {
            setSession(null);
            setNickname("");
        }
    };
    //검색창
    const search = () => {
        if (!keyword.trim()) {
            alert("검색어를 입력하세요.");
            return;
        }
        alert(`검색어: ${keyword}`);
    };
    //공구방 데이터
    useEffect(() => {
        const fetchRoom = async () => {
            const { data, error } = await supabase
                .from("room")
                .select(`id, store_id, room_name, room_address, max_people, room_join(count)`)
                .eq("status", "모집중");

            if (error) {
                console.error("room 불러오기 오류:", error);
            } else {
                const formattedRooms = data.map(room => {
                    const joinCount = Array.isArray(room.room_join) && room.room_join.length > 0
                        ? room.room_join[0].count
                        : 0;

                    return {
                        ...room,
                        join_count: joinCount
                    };
                }).filter(room  => room.join_count < room.max_people);

                console.log("formattedRooms:", formattedRooms);
                setRooms(formattedRooms);
            }
        };

        fetchRoom();
    }, []);
    //카테고리 목록
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
    //지금인기있는메뉴
    useEffect(() => {
        const fetchMenu = async () => {
            const { data, error } = await supabase.from("popular").select("*");
            if (error) {
                console.error("인기메뉴 불러오기 오류:", error)
            } else {
                setMenu(data);
            }
        };
        fetchMenu();
    }, []);
    //채팅방에 사용자 있는지 확인
    const roomClick = async (e, roomId) => {
        e.preventDefault();

        const userId = session?.user?.id;
        if (!userId) {
            alert("로그인이 필요합니다.");
            return;
        }
        const { data } = await supabase.from("room_join").select("*").eq("room_id", roomId).eq("user_id", userId);

        if (data.length > 0) {
            window.location.href = `/delivery-moa/room/${roomId}`;
        } else {
            const confirmJoin = window.confirm("이 공구방에 참여하시겠습니까?");
            if (confirmJoin) {
                window.location.href = `/delivery-moa/room/${roomId}`;
            }
        }
    }
    const storeUrl = "https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/store/store_";

    const imgBaseUrl = "https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/category/";

    const popularUrl = "https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/popular/popular_";
    // 지도 testing
    const userId = session?.user?.id;
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
                    {isOpen && (
                        <Hamburger
                            isOpen={isOpen}
                            session={session}
                            nickname={nickname}
                            handleLogout={handleLogout}
                            onClose={() => setIsOpen(false)}

                        />
                    )}
                </div>
            </header>
            <main>
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
                            <Link to="/storelist">
                                <div className={styles["food_category_move"]}>전체보기→</div>
                            </Link>
                        </div>
                        <div className={styles["circle_category_wrap"]}>
                            {categories.map((item) => (
                                <Link key={item.id} to="/storelist">
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
                            <div className={styles["gongu_list_move"]}><Link
                                to="/roomPage/AllRoom"
                                state={{ userId }}
                            >전체보기→</Link></div>
                        </div>
                        <div className={styles["gongu_list_wrap"]}>
                            {rooms.slice(0, 6).map((items) => (
                                <Link key={items.id} to={`/room/${items.id}`} onClick={(e) => roomClick(e, items.id)} style={{ cursor: "pointer" }}>
                                    <div className={styles["gongu_with_text"]}>
                                        <img className={styles["square_img"]}
                                            src={`${storeUrl}${items.store_id}.jpg`}
                                            alt={`${items.category} 이미지`} />
                                        <div className={styles["square"]}>
                                            <div className={styles["gongu_title"]}>{items.room_name}</div>
                                            <div className={styles["gongu_date"]}>{items.room_address}
                                            </div>
                                            <progress className={styles["gongu_progress"]} value={items.join_count} max={items.max_people}></progress>
                                            <div className={styles["gongu_bottom"]}>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    <img src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/octicon_people-24.png" />
                                                    <div className={styles["gongu_people"]}>{items.join_count}/{items.max_people} 참여중</div>
                                                </div>
                                                <div className={styles["gongu_delivery"]}>배달비 무료</div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
                <div className={styles["body_bottom"]}>
                    <div className={styles["body_bottom_container"]}>
                        <div className={styles["popular_text"]}>지금 인기있는 메뉴</div>
                        <div className={styles["popular_list_wrap"]}>
                            {menu.slice(0, 5).map((item) => (
                                <div key={item.id} className={styles["popular_with_text"]}>
                                    <img
                                        className={styles["popular_img"]}
                                        src={`${popularUrl}${item.id}.jpg`} />
                                    <div className={styles["popular_square"]}>
                                        <div className={styles["popular_title"]}>{item.title}</div>
                                        <div className={styles["popular_detail"]}>
                                            <div className={styles["popular_star"]}>★★★★★</div>
                                            <div className={styles["popular_detail_text"]}>{item.price}원</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
