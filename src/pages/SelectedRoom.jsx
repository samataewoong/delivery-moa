import styles from "./SelectedRoom.module.css";
import { useState, useEffect, useRef } from "react";
import supabase from "../config/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';

export default function SelectRoom() {
    const navigate = useNavigate();
    const { store_id } = useParams();
    const [ roomSelect, setRoomSelect ] = useState([]);
    const [ store, setStore ] = useState([]);
    

    useEffect(() => {
        const fetchResults = async () => {
            const { data: roomResultData } = await supabase.from("room").select("*").eq("store_id", store_id);
            setRoomSelect(roomResultData);

            const { data } = await supabase.from("store").select("*").eq("id",store_id).single();
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
        <main className={styles["main_container"]}>
            <div className={styles["main_contents"]}>
                <div className={styles["main_head"]}>
                    <img onClick={() => { navigate(-1); }} className={styles["back_btn"]} src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/backbtn.png"></img>
                    <div>개설된 방 : </div>
                    <div className={styles["store_name"]}>&nbsp;{store.store_name}</div>
                </div>
                <div className={styles["main_box"]}>
                    {roomSelect.length > 0 ? (
                        roomSelect.map((item) => (
                            <Link key={item.id} to={`/room/${item.id}`} onClick={(e) => roomClick(e, item.id)}>
                                <div className={styles["search_result"]}>
                                    <img className={styles["search_store_img"]}
                                        src={`${storeImgUrl}${item.store_id}.jpg`} alt={`${item.store_id}`}></img>
                                    <div className={styles["search_store_detail"]}>
                                        <div>
                                            <div className={styles["search_store_name"]}>{item.room_name}</div>
                                            <div className={styles["search_menu_name"]}>{item.room_address}</div>
                                            <div className={styles["search_status"]}>{item.status}</div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className={styles["search_noResult"]}>검색 결과가 없습니다.</div>
                    )}
                </div>
            </div>
        </main>
    )
}