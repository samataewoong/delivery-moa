import supabase from "../../config/supabaseClient";
import style from "./RoomHeader.module.css";
import { useEffect, useState } from "react";

export default function RoomHeader({ room_id }) {
    const [room, setRoom] = useState(null);
    const [backbutton, setBackButton] = useState(false);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        async function fetchRoom() {
            const { data, error } = await supabase
                .from("room")
                .select("*")
                .eq("id", room_id);

            if (error) {
                setError(error);
            } else {
                setRoom(data[0]);
            }
        }
        async function fetchBackButton() {
            const { data, error } = await supabase
                .storage
                .from("imgfile")
                .getPublicUrl("main_img/backbtn.png");

            if (error) {
                setError(error);
            } else {
                setBackButton(data.publicUrl);
            }
        }

        fetchRoom();
        fetchBackButton();
    }, [room_id]);
    return (
        <div className={style.room_header}>
            {room && <img src={backbutton} alt="Back Button" className={style.back_button} />}
            {room && <div className={style.room_name}>{room.room_name}</div>}
        </div>
    );
}