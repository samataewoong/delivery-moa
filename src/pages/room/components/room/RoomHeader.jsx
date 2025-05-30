import supabase from "../../../../config/supabaseClient";
import getAuthUser from "../../../../functions/auth/GetAuthUser";
import selectRoom from "../../../../functions/room/SelectRoom";
import selectRoomJoin from "../../../../functions/room_join/SelectRoomJoin";
import deleteRoomJoin from "../../../../functions/room_join/DeleteRoomJoin";
import style from "./RoomHeader.module.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RoomHeader({ room_id }) {
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [roomJoin, setRoomJoin] = useState([]);
    const [canLeave, setCanLeave] = useState(false);
    const backBtnLogo = 'https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/backbtn.png';
    const leaveBtnLogo = 'https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/leavebtn.png';
    const locationIcon = 'https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/location_icon.png';
    const [error, setError] = useState(null);
    
    useEffect(() => {
        async function fetchRoomJoin() {
            try {
                const { id: user_id } = await getAuthUser();
                const roomJoinData = await selectRoomJoin({
                    room_id,
                });
                if (roomJoinData.length > 0) {
                    setRoomJoin(roomJoinData);
                }
            } catch (error) {
                setError(error);
            }
        }
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
        const roomSubscribe = supabase
           .realtime
           .channel('realtime:room')
           .on("postgres_changes", (payload) => {
                if (payload.new.room_id === room_id) {
                    fetchRoomJoin();
                }
           });
        const roomJoinSubscribe = supabase
           .realtime
           .channel('realtime:room_join')
           .on("postgres_changes", (payload) => {
                if (payload.new.room_id === room_id) {
                    fetchRoomJoin();
                }
           });
        fetchRoomJoin();
        fetchRoom();
    }, [room_id]);
    useEffect(() => {
        async function fetchCanLeave() {
            if(room && roomJoin) {
                try {
                    const { id: user_id } = await getAuthUser();
                    if(
                        room
                        && room.leader_id == user_id
                    ) {
                        // 방장인 경우
                        if(
                            room
                            && roomJoin
                            && roomJoin.length > 0 
                            && roomJoin.filter((join) => (join.status == '준비 완료')).length > 0
                        ) {
                            setCanLeave(false);
                        } else {
                            setCanLeave(true);
                        }
                    } else {
                        // 일반인 경우
                        if(
                            room
                            && roomJoin
                            && roomJoin.length > 0
                            && roomJoin.filter((join) => (join.user_id == user_id &&  join.status == '준비 완료')).length
                        ) {
                            setCanLeave(false);
                        } else {
                            setCanLeave(true);
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }
        fetchCanLeave();
    }, [room, roomJoin,room_id]);
    async function handleLeaveRoom() {
        try {
            const { id: user_id } = await getAuthUser();
            await deleteRoomJoin({
                room_id,
                user_id,
            });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className={style.room_header}>
            <div className={style.room_header_left}>
                {room && <img onClick={()=> {
                    navigate(-1);
                }} src={backBtnLogo} alt="Back Button" className={style.back_button} />}
                {room && <div className={style.room_name}>{room.room_name}</div>}
                {room && <div className={style.room_status}>{room.status}</div>}
            </div>
            <div className={style.room_header_right}>
                <div className={style.location_box}>
                    {room && <img src={locationIcon} alt="Location Icon" className={style.location_icon}/>}
                    {room && <div className={style.location_address}>{room.room_address}</div>}
                </div>
                {(room && roomJoin && canLeave) ? (
                    <img onClick={handleLeaveRoom} src={leaveBtnLogo} alt="Leave Button" className={style.leave_button}/>
                ) : (
                    <div className={style.leave_button}></div>
                )}
            </div>
        </div>
    );
}