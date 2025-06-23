import styles from "./MainPage.module.css";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import supabase from "../config/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function MainPage({ toggleMenu }) {
    const [nickname, setNickname] = useState("");
    const [session, setSession] = useState(null);
    const [keyword, setKeyword] = useState("");

    const [categories, setCategories] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [menu, setMenu] = useState([]);
    const navigate = useNavigate();

    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            search();
        }
    }
    //로그인 정보
    useEffect(() => {
        const getData = async () => {
            const { data: { session },
            } = await supabase.auth.getSession();
            setSession(session);
            if (session?.user) fetchNickname(session.user.id);

            const [popularData, categoryData, roomData] = await Promise.all([
                supabase.from("popular").select("*"),
                supabase.from("menu_category").select("id, category").order("num"),
                supabase
                    .from("room")
                    .select(`id, store_id, room_name, room_address, max_people, room_join(count)`)
                    .eq("status", "모집중")
            ]);

            if (popularData.error) {
                console.error("인기메뉴 불러오기 오류:", popularData.error)
            } else {
                setMenu(popularData.data);
            }

            if (categoryData.error) {
                console.error("카테고리 불러오기 오류:", categoryData.error);
            } else {
                setCategories(categoryData.data);
            }

            if (roomData.error) {
                console.error("room 불러오기 오류:", roomData.error);
            } else {
                const formattedRooms = roomData.data.map(room => {
                    const joinCount = Array.isArray(room.room_join) && room.room_join.length > 0
                        ? room.room_join[0].count
                        : 0;

                    return {
                        ...room,
                        join_count: joinCount
                    };
                }).filter(room => room.join_count < room.max_people);

                console.log("formattedRooms:", formattedRooms);
                setRooms(formattedRooms);
            }
        };

        getData();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) fetchNickname(session.user.id);
            else setNickname("");
        });
        return () => subscription.unsubscribe();
    }, []);

    const fetchNickname = async (user_id) => {
        const { data } = await supabase.from("user").select("nickname").eq("id", user_id).single();
        setNickname(data?.nickname || "");
    };

    //검색창
    const search = () => {
        if (!keyword.trim()) {
            alert("검색어를 입력하세요.");
            return;
        }
        navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    };

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
                            {rooms.length === 0 ? (
                                <div className={styles["no_room_message"]}>참여 가능한 공구가 없습니다.</div>
                            ) : (
                                rooms.slice(0, 6).map((items) => (
                                    <Link key={items.id} to={`/room/${items.id}`} onClick={(e) => roomClick(e, items.id)} style={{ cursor: "pointer" }}>
                                        <div className={styles["gongu_with_text"]}>
                                            <img className={styles["square_img"]}
                                                src={`${storeUrl}${items.store_id}.jpg`}
                                                alt={`${items.category} 이미지`} />
                                            <div className={styles["square"]}>
                                                <div className={styles["gongu_title"]}>{items.room_name}</div>
                                                <div className={styles["gongu_date"]}>{items.room_address}  {items.room_address_detail}
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
                                ))
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles["body_bottom"]}>
                    <div className={styles["body_bottom_container"]}>
                        <div className={styles["popular_text"]}>지금 인기있는 메뉴</div>
                        <div className={styles["popular_list_wrap"]}>
                            {menu.slice(0, 5).map((item) => (
                                <Link key={item.id} to={`/store/${item.store_id}`}>
                                    <div className={styles["popular_with_text"]}>
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
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
