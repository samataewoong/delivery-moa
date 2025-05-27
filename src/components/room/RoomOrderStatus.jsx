import supabase from "../../config/supabaseClient";
import { useEffect, useState } from "react";
import style from "./RoomOrderStatus.module.css";

export default function RoomOrderStatus({ room_id }) {
    const [room, setRoom] = useState(null);
    useEffect(() => {
        async function fetchRoom() {
            const { data, error } = await supabase
                .from("room")
                .select("*")
                .eq("id", room_id)
                .single();

            if (error) {
                console.error("Error fetching room:", error);
            } else {
                setRoom(data);
            }
        };

        const roomSubscribe = supabase
            .channel("realtime:room")
            .on(
                "postgress_changes", 
                { event: '*', schema: 'public', table: 'room' }, (payload) => {
                    if (payload.new.id === room_id) {
                        setRoom(payload.new);
                    }
                })
            .subscribe();
        fetchRoom();
        return () => {
            roomSubscribe.unsubscribe();
        };
    }, [room_id]);

    return (
        <div className={style.order_status_box}>
            <div className={style.order_status_title}>주문 현황</div>
        </div>
    )
}