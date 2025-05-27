import style from "./RoomBody.module.css";
import { useEffect, useState } from "react";
import supabase from "../../config/supabaseClient";
import Chat from "../../components/chat/Chat";
import RoomMenu from "../../components/room/RoomMenu";
import RoomOrderStatus from "./RoomOrderStatus";

export default function RoomBody({ room_id }) {
    return (
        <div className={style.room_body}>
            <div className={style.room_body_left}>
                <div className={style.room_body_left_top}>
                    <RoomOrderStatus room_id={room_id} />
                </div>
                <div className={style.room_body_left_bottom}>
                    <Chat room_id={room_id} />
                </div>
            </div>
            <div className={style.room_body_right}>
                <RoomMenu room_id={room_id} />
            </div>
        </div>
    );
}