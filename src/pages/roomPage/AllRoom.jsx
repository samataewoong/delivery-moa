import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Header from "../../components/Header";
import CloseRoom from "../../components/CloseRoom";
import { useLocation } from "react-router-dom";
import styles from './AllRoom.module.css';
import { useState, useEffect } from "react";
import supabase from "../../config/supabaseClient";
import MustBeLoggedIn from "../../components/login_check/MustBeLoggedIn";
import selectUser from "../../functions/user/SelectUser";
import { getCoordinates } from "../../functions/maps/Coord";
import { getDistance } from "../../functions/maps/Distance";

export default function AllRoom() {
    const location = useLocation();
    const userId = location.state?.userId;
    console.log("userId:", userId)
    const [roomList, setRoomList] = useState([]);
    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await selectUser({ user_id: userId });
            const { data: rooms, error: roomError } = await supabase
                .from("room")
                .select("id, store_id,  room_name, room_address")
                .eq('status', "모집중");

            if (roomError) {
                console.log("Error fetching rooms:", roomError);
            } else {
                const userAddress = userData[0]?.address;
                const userCoords = await getCoordinates(userAddress);
                const roomArray = [];
                for (const room of rooms) {
                    const roomCoords = await getCoordinates(room.room_address);
                    const distance = getDistance(
                        userCoords,
                        roomCoords
                    );
                    if (distance <= 1) {
                        roomArray.push({ ...room, distance });
                    }
                }
                setRoomList(roomArray.sort((a, b) => a.distance - b.distance) || []);
                console.log("roomList:", roomList);
            }
        };
        fetchUserData();
    }, [userId]);
    return (
        <main className={styles.main_body}>
            <div className={styles.main_container}>
                <MustBeLoggedIn />
                <div className={styles.AllRoomhead}>
                    진행중인 공구방
                </div>
                <div className={styles.AllRoomBody}>
                    <div className={styles.rooms}>
                        {roomList.lenght >0 ? (
                            roomList.map((room, index) => (
                            <div key={room.id} className={styles.roomList}>
                                <div>
                                    <img
                                        className={styles.roomListImg}
                                        alt="undefined 이미지"
                                        src={`https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/store/store_${room.store_id}.jpg`}
                                    />
                                    <div className={styles.roomTitle}>{room.room_name}</div>
                                    <div className={styles.roomDistance}>{Math.floor(room.distance * 10) / 10}km</div>
                                    <div className={styles.roomAddress}>{room.room_address}</div>
                                </div>
                            </div>
                        ))
                        ) : (
                            <div className={styles.room_no_result}>
                                진행중인 공구방이 없습니다.
                            </div>
                        )}
                    </div>
                    <div className={styles.roomMap}>
                        <CloseRoom userId={userId} roomList={roomList} />
                    </div>
                </div>
            </div>
        </main>
    )
}