import CloseRoom from "../../components/CloseRoom";
import { useLocation } from "react-router-dom";
import styles from './AllRoom.module.css';
import { useState, useEffect } from "react";
import supabase from "../../config/supabaseClient";
import MustBeLoggedIn from "../../components/login_check/MustBeLoggedIn";
import selectUser from "../../functions/user/SelectUser";
import { getCoordinates } from "../../functions/maps/Coord";
import { getDistance } from "../../functions/maps/Distance";
import { Link, useNavigate } from "react-router-dom";

export default function AllRoom() {
    const navigate = useNavigate();
    const location = useLocation();
    const userId = location.state?.userId;
    console.log("userId:", userId);
    const [roomList, setRoomList] = useState([]);
    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await selectUser({ user_id: userId });
            const { data: rooms, error: roomError } = await supabase
                .from("room")
                .select("id, store_id,  room_name, room_address, max_people, status, room_join(count)")
                .eq('status', "모집중");

            if (roomError) {
                console.log("Error fetching rooms:", roomError);
            } else {
                const userAddress = userData[0]?.address;
                const userCoords = await getCoordinates(userAddress);
                const roomArray = [];
                for (const room of rooms) {
                    const joinCount = room.room_join?.[0]?.count || 0;
                    const roomCoords = await getCoordinates(room.room_address);
                    const distance = getDistance(
                        userCoords,
                        roomCoords
                    );
                    if (joinCount >= room.max_people) continue;

                    if (distance <= 1) {
                        roomArray.push({ ...room, distance, join_count: joinCount });
                    }
                }
                setRoomList(roomArray.sort((a, b) => a.distance - b.distance) || []);
                console.log("roomList:", roomList);
            }
        };
        const userSubscribe = supabase
            .realtime
            .channel("realtime:user_address_watch_on_all_room_page")
            .on(
                "postgres_changes",
                { event: '*', schema: 'public', table: 'user' },
                (payload) => {
                    if (payload.new.id === userId) {
                        fetchUserData();
                    }
                }
            )
            .subscribe();
        const roomSubscribe = supabase
            .realtime
            .channel("realtime:room_watch_on_all_room_page")
            .on(
                "postgres_changes",
                { event: '*', schema: 'public', table: 'room' },
                (payload) => {
                    fetchUserData();
                }
            )
            .subscribe();
        fetchUserData();
        return () => {
            userSubscribe.unsubscribe();
            roomSubscribe.unsubscribe();
        };
    }, [userId]);

    const roomClick = async (e, roomId) => {
        e.preventDefault();

        const { data } = await supabase.from("room_join").select("*").eq("room_id", roomId).eq("user_id", userId);

        if (data.length > 0) {
            const move = window.confirm("이미 참여중인 방입니다. 이동하시겠습니까?");
            if (move) {
                navigate(`/room/${roomId}`);
            }
        } else {
            const confirmJoin = window.confirm("이 공구방에 참여하시겠습니까?");
            if (confirmJoin) {
                navigate(`/room/${roomId}`);
            }
        }
    }

    return (
        <main className={styles.main_body}>
            <div className={styles.main_container}>
                <MustBeLoggedIn />
                <div className={styles.AllRoomhead}>
                    <img onClick={() => { navigate(-1); }} className={styles["back_btn"]} src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/backbtn.png"></img>
                    <div>진행중인 공구방</div>
                </div>
                <div className={styles.AllRoomBody}>
                    <div className={styles.rooms}>
                        {roomList.length > 0 ? (
                            roomList.map((room, index) => (
                                <Link key={room.id} to={`/room/${room.id}`} onClick={(e) => roomClick(e, room.id)}>
                                    <div key={room.id} className={styles.roomList}>
                                        <div className={styles.roomWithText} style={{ backgroundImage: `url("https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/store/store_${room.store_id}.jpg")`, backgroundSize: "cover", backgroundPosition: "center 80%" }}>
                                            <div className={styles.roomDetail}>
                                                <div className={styles.roomTitle}>{room.room_name}</div>
                                                <div className={styles.roomAddress}>{room.room_address}</div>
                                                <progress className={styles["gongu_progress"]} value={room.join_count} max={room.max_people}></progress>
                                                <div className={styles["gongu_bottom"]}>
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        <div className={styles["gongu_people"]}>{room.join_count}/{room.max_people} {room.status}</div>
                                                    </div>
                                                    <div className={styles["gongu_delivery"]}>{Math.floor(room.distance * 10) / 10}km</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
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