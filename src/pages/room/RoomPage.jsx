import supabase from "../../config/supabaseClient";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import style from "./RoomPage.module.css";
import Chat from "../../components/chat/Chat";
import RoomJoin from "../../components/room/RoomJoin";
import RoomHeader from "../../components/room/RoomHeader";
import RoomBody from "../../components/room/RoomBody";

export default function RoomPage() {
    const { room_id } = useParams();
    const [uid, setUid] = useState(null);
    useEffect(() => {
        async function fetchUser() {
            let { data, error } = await supabase.auth.getUser();
            if (error) {
                console.error("Error fetching user:", error);
            } else {
                setUid(data.user.id);
            }
        }
        fetchUser();
    }, []);
    return (

        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        }}>
            { uid && <RoomJoin room_id={room_id} user_id={uid} />}
                <RoomHeader room_id={room_id} />
                <RoomBody room_id={room_id} />
        </div>
    );
}
