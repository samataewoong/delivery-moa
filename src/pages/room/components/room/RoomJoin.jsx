import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import InsertRoomJoin from "../../../../functions/room_join/InsertRoomJoin";
import getAuthUser from "../../../../functions/auth/GetAuthUser";
import supabase from "../../../../config/supabaseClient";
import MustBeLoggedIn from "../../../../components/login_check/MustBeLoggedIn";

export default function RoomJoin({ room_id }) {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const process = async () => {
            let user_id = null;
            try {
                const { id } = await getAuthUser();
                user_id = id;
            } catch (error) {
                return;
            }

            if (!user_id) {
                return;
            }

            try {
                await InsertRoomJoin({ room_id, user_id });
            } catch (error) {
                console.error(error.message);
                alert(error.message);
                navigate("/");
            }
        };
        const roomSubscribe = supabase
           .realtime
           .channel(`realtime:room_status_update_watch_on_room_delete_${room_id}`)
           .on(
                "postgres_changes",
                { event: '*', schema: 'public', table: 'room' },
                (payload) => {
                    console.log("Received payload:", payload);
                    if (payload.new.room_id === Number(room_id) && payload.new.status === "삭제") {
                        console.log("Room ID matches, navigating to room...");
                        alert('방이 삭제되었습니다.')
                        navigate(`/room/${room_id}`);
                    }
                }
            )
        process();
        return () => {
            roomSubscribe.unsubscribe();
        }
    }, [room_id]);

    return (
        <>
        <MustBeLoggedIn />
        </>
    );
}
