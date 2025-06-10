import supabase from "../../../../config/supabaseClient";
import { useEffect, useState } from "react";
import style from "./RoomOrderStatus.module.css";
import RoomOrderUserCard from "./RoomOrderUserCard";
import selectRoomJoin from "../../../../functions/room_join/SelectRoomJoin";

export default function RoomOrderStatus({ room_id }) {
    const [room, setRoom] = useState(null);
    const [roomJoin, setRoomJoin] = useState([]);
    useEffect(() => {
        async function fetchRoomJoin() {
            try {
                const roomJoinData = await selectRoomJoin({ room_id });
                setRoomJoin(roomJoinData.sort((a, b) => Date.parse(a.joined_at) - Date.parse(b.joined_at)));
            } catch(error) {
                console.error("Error fetching room join:", error);
            }
        }
        const userSubscribe = supabase
            .realtime
            .channel(`realtime:room_join_status_update_watch_on_room_order_status_in_room_${room_id}`)
            .on(
                "postgres_changes",
                { event: '*', schema: 'public', table: 'room_join' },
                (payload) => {
                    console.log("Received payload:", payload);
                    if (payload.new.room_id === Number(room_id)) {
                        let tmp = null;
                        setRoomJoin((prevRoomJoin) => (tmp = [...(prevRoomJoin || []).filter((row) => (!((row.user_id === payload.new?.user_id || row.user_id === payload.old?.user_id) && (row.room_id == Number(payload.new?.room_id) || row.room_id === Number(payload.old?.room_id))))), payload.new].filter((row) => (row)).sort((a, b) => Date.parse(a.joined_at) - Date.parse(b.joined_at)),tmp));
                        console.log("Room ID matches, fetching room join data...");
                    }
                    if (payload.eventType === "DELETE"){
                        let tmp = null;
                        setRoomJoin((prevRoomJoin) => (tmp = [...prevRoomJoin.filter((row) => (row.id !== payload.old.id))],tmp));
                    }
                }
            )
            .subscribe();

        fetchRoomJoin();
        return () => {
            userSubscribe.unsubscribe();
        };
    }, [room_id]);

    return (
        <div className={style.order_status_box}>
            <div className={style.order_status_title}>주문 현황</div>
            <div className={style.user_profile_list_box}>
                {roomJoin.map((user, index) => {
                    const position = (() => {
                        switch (index) {
                            case 0: return "top";
                            case roomJoin.length - 1: return "bottom";
                            default: return "center";
                        }
                    })();
                    return (
                        <RoomOrderUserCard
                            key={user.id}
                            position={position}
                            user_id={user.user_id}
                            room_id={room_id} />
                    );
                })}
            </div>
        </div>
    )
}