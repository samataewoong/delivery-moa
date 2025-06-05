import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Header from "../../components/Header";
import CloseRoom from "../../components/CloseRoom";
import { useLocation } from "react-router-dom";
import styles from './AllRoom.module.css';
import { useState, useEffect } from "react";
import supabase from "../../config/supabaseClient";
import MustBeLoggedIn from "../../components/login_check/MustBeLoggedIn";

export default function AllRoom() {
    const location = useLocation();
    const userId = location.state?.userId;
    console.log("userId:", userId)
    const [roomList, setRoomList] = useState([]);
    useEffect(() => {
        const fetchUserData = async () => {
            const { data: rooms, error: roomError } = await supabase
                .from("room")
                .select("id, store_id,  room_name, room_address")
                .eq('status',"모집중");

            if (roomError) {
                console.log("Error fetching rooms:", roomError);
            } else {
                setRoomList(rooms || []);
                console.log("roomList:", roomList);
            }
        };
        fetchUserData();
    }, [userId]);
    return (
        <>
            <MustBeLoggedIn />
            <div className={styles.AllRoomBody}>
                <div className={styles.rooms}>
                    {roomList.map((room, index) => (
                        <div key={room.id} className={styles.roomList}>
                            <div className={styles.roomTitle}>{room.room_name}</div>
                            <div className={styles.roomAddress}>{room.room_address}</div>
                        </div>
                    ))}
                </div>
                <div className={styles.roomMap}>
                    <CloseRoom userId={userId} roomList={roomList} />
                </div>
            </div>
        </>
    )
}