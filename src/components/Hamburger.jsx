import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./Hamburger.module.css";
import supabase from "../config/supabaseClient";


export default function HamburgerMenu({ isOpen, session, nickname, handleLogout, onClose }) {

    const menuRef = useRef();

    const [userRoom, setUserRoom] = useState([]);
    const [cash, setCash] = useState(0);
    const [menuHeight, setMenuHeight] = useState("auto");
    const [myRating, setMyRating] = useState(0);

    const [face, setFace] = useState("soso");


    //사용자가 있는 채팅방만 불러오기
    useEffect(() => {
        const fetchUserRooms = async () => {
            const userId = session?.user?.id;
            if (!userId) return;


            //Cash(코인)값 가져오기
            const { data: userData, error: userError } = await supabase
                .from("user")
                .select("cash, user_rating")
                .eq("id", userId)
                .single();

            if (!userError && userData) {
                setCash(userData.cash);
                setMyRating(userData.user_rating);
                if (userData.user_rating >= 80) {
                    setFace("good");
                } else if (userData.user_rating < 30) {
                    setFace("bad");
                } else {
                    setFace("soso");
                }
            }

            const { data, error } = await supabase
                .from("room_join")
                .select("room_id")
                .eq("user_id", userId);
            if (error || !data) return;
            const roomIds = data.map((j) => j.room_id);


            const { data: roomData, error: roomError } = await supabase
                .from("room")
                .select("id, room_name, store_id, max_people, status")
                .in("id", roomIds);
            if (roomError || !roomData) return;

            const { data: countpeople } = await supabase
                .from("room_join")
                .select("room_id, user_id", { count: "exact" });

            const chatTimes = await Promise.all(
                roomIds.map(async (roomId) => {
                    const { data: chatData } = await supabase
                        .from("chat")
                        .select("created_at")
                        .eq("room_id", roomId)
                        .order("created_at", { ascending: false })
                        .limit(1)
                        .single();

                    return {
                        room_id: roomId,
                        latest_chat: chatData?.created_at || null,
                    };
                })
            );

            const formattedRooms = roomData.map((room) => {
                const count =
                    countpeople?.filter((j) => j.room_id === room.id).length || 0;
                const chatInfo = chatTimes.find((c) => c.room_id === room.id);

                return {
                    id: room.id,
                    name: room.room_name,
                    store_id: room.store_id,
                    max_people: room.max_people,
                    status: room.status,
                    count,
                    latest_chat: chatInfo?.latest_chat,
                };
            });
            setUserRoom(formattedRooms);
        };
        if (session) {
            fetchUserRooms();
        }
    }, [session]);

    useEffect(() => {
        function updateHeight() {
            const footer = document.querySelector("footer");
            const footerHeight = footer ? footer.offsetHeight : 0;
            const docHeight = document.body.scrollHeight;
            const topOffset = 115;

            const calculatedHeight = docHeight - footerHeight - topOffset;
            setMenuHeight(calculatedHeight > 0 ? calculatedHeight : "auto");
        }

        updateHeight();
        window.addEventListener("resize", updateHeight);

        return () => {
            window.removeEventListener("resize", updateHeight);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            // 햄버거 버튼 클릭은 제외
            const isHamburgerButton = e.target.closest('[class*="hamburger_btn"]') ||
                e.target.closest('[class*="main_hamburger_btn"]');

            if (isHamburgerButton) {
                return;
            }

            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };

        if (isOpen) {
            // 약간의 지연을 주어 초기 클릭과 분리
            const timer = setTimeout(() => {
                document.addEventListener("mousedown", handleClickOutside);
            }, 50);

            return () => {
                clearTimeout(timer);
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    const roomUrl =
        "https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/store/store_";
    const scoreUrl = "https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/";

    return (
        <div className={styles["main"]} ref={menuRef}>
            <div className={styles["hamburger_nav"]}
                style={{ height: `${menuHeight - 60}px` }}>
                <div className={styles["mypage"]}>
                    <img
                        className={styles["mypage_icon"]}
                        src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/home-black.png"
                        alt="마이페이지"
                    />
                    <div className={styles["mypage_text"]}>
                        {session && nickname ? <Link to="/mypage/userinfo" onClick={onClose} state={{ session }}>마이페이지</Link> : <Link to="/mainpage">마이페이지</Link>}
                    </div>

                </div>

                {session && nickname ? (
                    <>
                        <div className={styles["user_coin"]}>
                            <div className={styles["user_box"]}>
                                <div className={styles["userName"]}>{nickname}님</div>
                                <button className={styles["userName_btn"]} onClick={handleLogout}>로그아웃</button>
                            </div>
                            <div className={styles["coin_box"]}>
                                <img
                                    className={styles["coin_imo"]}
                                    src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/coin.png"
                                    alt="코인"
                                />
                                <div className={styles["coin_confirm"]}>
                                    {cash !== null ? cash.toLocaleString() : "0"}
                                </div>
                            </div>
                        </div>
                        <div className={styles["score_box"]}>
                            <div className={styles["score_text"]}>{myRating}%</div>
                            <img className={styles["score_img"]} src={`${scoreUrl}${face}.png`} />
                        </div>
                        <progress className={styles["gongu_progress"]} value={myRating} max={100}></progress>
                    </>
                ) : (
                    <div id={styles["user_notlogin"]}>
                        <Link to="/login">로그인이 필요합니다</Link>
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
                    <div className={styles["chat_list"]}>
                        <div className={styles["chat_list_title"]}>참여중인 채팅방 목록</div>
                        {userRoom.length > 0 ? (
                            userRoom.map((room) => (
                                <div key={room.id} className={styles["chat_list_room"]}
                                    onClick={() => window.location.href = `/delivery-moa/room/${room.id}`}>
                                    <img className={styles["chat_list_circle"]} src={`${roomUrl}${room.store_id}.jpg`} />
                                    <div className={styles["chat_room"]}>
                                        <div className={styles["chat_title_time"]}>
                                            <div className={styles["chat_title"]}>{room.name}</div>
                                            <div className={styles["chat_time"]}>
                                                {room.latest_chat
                                                    ? new Date(Date.parse(room.latest_chat) + 32400000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : "대화없음"}
                                            </div>
                                        </div>
                                        <div className={styles["chat_room_detail"]}>
                                            <img src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/octicon_people-24.png" />
                                            <div className={styles["chat_people"]}>{room.count}/{room.max_people} 참여중</div>
                                            <div className={styles["chat_state"]}>{room.status}</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles["no_room"]}>참여 중인 채팅방이 없습니다.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
