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
                .select("id, room_name, room_address");

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
            <div className={styles.AllRoomPage}>
                <CloseRoom userId={userId} roomList={roomList}></CloseRoom>
                <div className={styles.roomContainer}>
                    <div className={styles.roomListLeft}>
                        {roomList.map((room, index) => (index % 2 === 0 &&
                            <div key={room.id} className={styles.roomList}>
                                <div className={styles.roomTitle}>{room.room_name} 인덱스:{index}</div>
                                <div className={styles.roomAddress}>{room.room_address}</div>
                            </div>
                        ))}
                    </div>
                    <div  className={styles.roomListLeft}>
                        {roomList.map((room, index) => (index % 2 === 1 &&
                            <div key={room.id}  className={styles.roomList}>
                                <div className={styles.roomTitle}>{room.room_name}인덱스:{index}</div>
                                <div className={styles.roomAddress}>{room.room_address}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}