import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import InsertRoomJoin from "../../../../functions/room_join/InsertRoomJoin";
import getAuthUser from "../../../../functions/auth/GetAuthUser";
import supabase from "../../../../config/supabaseClient";

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
                alert("로그인 정보를 가져오는데 실패하였습니다. 다시 로그인 해 주세요.");
                navigate("/login");
                return;
            }

            if (!user_id) {
                alert("로그인 정보를 가져오는데 실패하였습니다. 다시 로그인 해 주세요.");
                navigate("/login");
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
        </>
    );
}
