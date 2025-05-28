import supabase from "../../../../config/supabaseClient";
import { useEffect, useState } from "react";
import style from "./RoomOrderStatus.module.css";

export default function RoomOrderStatus({ room_id }) {
    const [room, setRoom] = useState(null);
    const [joinedUsers, setJoinedUsers] = useState([]);
    useEffect(() => {
        async function fetchJoinedUsers() {
            const { data: joinedUsersData, error: joinedUsersError } = await supabase
                .from("room_join")
                .select("*")
                .eq("room_id", room_id);
            if (joinedUsersError) {
                console.error("Error fetching joined users:", joinedUsersError);
            } else {
                setJoinedUsers(joinedUsersData);
            }
        };
        const joinedUsersSubscribe = supabase
            .channel("realtime:joined_users")
            .on(
                "postgres_changes", 
                { event: '*', schema: 'public', table: 'room_join' }, (payload) => {
                    if (payload.new.room_id === room_id) {
                        fetchJoinedUsers();
                    }
                })
            .subscribe();
        fetchJoinedUsers();
        return () => {
            joinedUsersSubscribe.unsubscribe();
        };
    }, [room_id]);

    return (
        <div className={style.order_status_box}>
            <div className={style.order_status_title}>주문 현황</div>
        </div>
    )
}