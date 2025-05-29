import supabase from "../../../../config/supabaseClient";
import selectRoom from "../../../../functions/room/SelectRoom";
import style from "./RoomHeader.module.css";
import { useEffect, useState } from "react";

export default function RoomHeader({ room_id }) {
    const [room, setRoom] = useState(null);
    const backBtnLogo = 'https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/backbtn.png';
    const [error, setError] = useState(null);
    
    useEffect(() => {
        async function fetchRoom() {
            try {
                const roomData = await selectRoom({
                    room_id,
                });
                if (roomData.length > 0) {
                    setRoom(roomData[0]);
                }
            } catch (error) {
                setError(error);
            }
        }
        fetchRoom();
    }, [room_id]);
    return (
        <div className={style.room_header}>
            {room && <img src={backBtnLogo} alt="Back Button" className={style.back_button} />}
            {room && <div className={style.room_name}>{room.room_name}</div>}
        </div>
    );
}