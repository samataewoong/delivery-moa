import supabase from "../../../../config/supabaseClient";
import { useEffect, useState } from "react";
import style from "./RoomOrderStatus.module.css";
import RoomOrderUserCard from "./RoomOrderUserCard";
import selectRoomJoin from "../../../../functions/room_join/SelectRoomJoin";

export default function RoomOrderStatus({ room_id }) {
    const [room, setRoom] = useState(null);
    const [joinedUsers, setJoinedUsers] = useState([]);
    useEffect(() => {
        async function fetchJoinedUsers() {
            const joinedUsersData = await selectRoomJoin({ room_id });
            setJoinedUsers(joinedUsersData.sort((a, b) => Date.parse(a.joined_at) - Date.parse(b.joined_at)));
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
            <div className={style.user_profile_list_box}>
                {joinedUsers.map((user,index) => {
                    const position = (() => {
                        switch (index) {
                            case 0: return "top";
                            case joinedUsers.length - 1: return "bottom";
                            default: return "center";
                        }
                    })();
                    return (
                        <RoomOrderUserCard
                            position={position}
                            user_id={user.user_id}
                            room_id={room_id} />
                    );
                })}
            </div>
        </div>
    )
}