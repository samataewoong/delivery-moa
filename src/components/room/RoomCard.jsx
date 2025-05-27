import supabase from "../../config/supabaseClient";
import style from "./RoomCard.module.css";

export default function RoomCard({
    id,
    store_id,
    room_name,
    room_address,
    max_people,
    leader_id,
    users,
    status,
    created_at,
}) {
    const date = new Date(created_at);
    let hours = `${date.getHours()}`;
    if (hours.length < 2) {
        hours = "0" + hours;
    }
    let minutes = `${date.getMinutes()}`;
    if (minutes.length < 2) {
        minutes = "0" + minutes;
    }
    let seconds = `${date.getSeconds()}`;
    if (seconds.length < 2) {
        seconds = "0" + seconds;
    }
    const { data: store, error } = supabase
        .from("store")
        .select("*")
        .eq("id", store_id)
        .single();
    let { data: leader, error: leaderError } = supabase
        .from("user")
        .select("*")
        .eq("id", leader_id)
        .single();
    leader = leader || { nickname: "Unknown" };

    return (
        <div style={{ padding: "10px" }}>
            <div className={style.room_card}>
                <div className={style.room_info}>
                    <div className={style.room_name}>{room_name}</div>
                    <div className={style.room_store}>{store ? store.store_name : "Unknown Store"}</div>
                    <div className={style.room_user_count}>{users.length}/{max_people}명</div>
                    <div className={style.room_address}>{room_address}</div>
                    <div className={style.date}>{`${hours}:${minutes}:${seconds}`}</div>
                    <div className={style.room_leader}>{leader.nickname}</div>
                </div>
            </div>
        </div>
    );
}