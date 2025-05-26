import supabase from "../../config/supabaseClient";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Chat from "../../components/chat/Chat";
import RoomInfo from "../../components/room/RoomInfo";
import RoomJoin from "../../components/room/RoomJoin";

export default function RoomPage() {
    const { room_id } = useParams();
    const [uid, setUid] = useState(null);
    useEffect(() => {
        async function fetchUser() {
            let { data, error } = await supabase.auth.getUser();
            data = { user: { id: '86969f38-3018-4b8e-bb6f-1bcc6376ee65' }  };
            if (error) {
                console.error("Error fetching user:", error);
                setUid(data.user.id);
            } else {
                setUid(data.user.id);
            }
        }
        fetchUser();
    }, []);
    return (

        <div style={{ display: "flex" }}>
            { uid && <RoomJoin room_id={room_id} user_id={uid} />}
            <div style={{ flex: 1}}>
                <RoomInfo room_id={room_id} />
            </div>
            <div style={{ flex: 1 }}>
                <Chat room_id={room_id} />
            </div>
        </div>
    );
}
