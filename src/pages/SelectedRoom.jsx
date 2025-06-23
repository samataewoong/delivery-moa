import styles from "./SelectedRoom.module.css";
import { useState, useEffect, useRef } from "react";
import supabase from "../config/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import MustBeLoggedIn from "../components/login_check/MustBeLoggedIn";
import getAuthUser from "../functions/auth/GetAuthUser";

export default function SelectRoom() {
    const navigate = useNavigate();
    const { store_id } = useParams();
    const [roomSelect, setRoomSelect] = useState([]);
    const [store, setStore] = useState([]);
    const [userId, setUserId] = useState(null);
    const mapRef = useRef(null);
    const [activeRoomId, setActiveRoomId] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            const { id } = await getAuthUser();
            setUserId(id);
            console.error(error);
        }
        fetchUser();
    }, []);

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

    const showMap = async (addr) => {
        await waitForKakaoMaps();

        if (!mapRef.current) return;

        const geocoder = new window.kakao.maps.services.Geocoder();

        geocoder.addressSearch(addr, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
                const map = new window.kakao.maps.Map(mapRef.current, {
                    center: coords,
                    level: 2,
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
        if (store?.store_address) {
            showMap(store.store_address);
        }
    }, [store]);


    useEffect(() => {
        const fetchResults = async () => {
            const [{ data: roomResultData }, { data }] = await Promise.all([
                supabase.from("room").select("*").eq("store_id", store_id),
                supabase.from("store").select("*").eq("id", store_id).single()
            ]);
            setRoomSelect(roomResultData);
            setStore(data);
        }
        fetchResults();
    }, [store_id]);

    const roomClick = async (e, roomId) => {
        e.preventDefault();

        if (!userId) {
            alert("로그인이 필요합니다.");
            return;
        }

        const { data } = await supabase.from("room_join").select("*").eq("room_id", roomId).eq("user_id", userId);

        if (data.length > 0) {
            const move = window.confirm("이미 참여중인 방입니다. 이동하시겠습니까?");
            if (move) {
                navigate(`/delivery-moa/room/${roomId}`);
            }
        } else {
            const confirmJoin = window.confirm("이 공구방에 참여하시겠습니까?");
            if (confirmJoin) {
                window.location.href = `/delivery-moa/room/${roomId}`;
            }
        }
    }

    const storeImgUrl = "https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/store/store_"

    return (
        <>
            <MustBeLoggedIn />
            <main className={styles["main_container"]}>
                <div className={styles["main_contents"]}>
                    <div className={styles["main_head"]}>
                        <img onClick={() => { navigate(-1); }} className={styles["back_btn"]} src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/backbtn.png"></img>
                        <div>개설된 방 : </div>
                        <div className={styles["store_name"]}>&nbsp;{store.store_name}</div>
                    </div>
                    <div className={styles["main_box"]}>
                        {roomSelect.filter(room => room.status == "모집중").length > 0 ? (
                            roomSelect.filter(room => room.status == "모집중").map((item) => (
                                <div>
                                    {activeRoomId === item.id && (
                                        <div ref={mapRef} className={styles["address_map"]}></div>
                                        )}
                                    <div key={item.id} className={styles["search_result"]} onClick={() => {
                                        setActiveRoomId(item.id);
                                        showMap(item.room_address);
                                    }}>
                                        <img className={styles["search_store_img"]}
                                            src={`${storeImgUrl}${item.store_id}.jpg`} alt={`${item.store_id}`}></img>
                                        <div className={styles["search_store_detail"]}>
                                            <div>
                                                <div className={styles["search_store_name"]}>{item.room_name}</div>
                                                <div className={styles["search_menu_name"]}>{item.room_address} {item.room_address_detail}</div>
                                                <div className={styles["search_status"]}>{item.status}</div>
                                            </div>
                                            <button className={styles["result_btn"]} onClick={(e) => {
                                                e.stopPropagation();
                                                roomClick(e, item.id)
                                            }}>참여</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles["search_noResult"]}>개설된 방이 없습니다.</div>
                        )}
                    </div>
                </div>
            </main>
        </>
    )
}