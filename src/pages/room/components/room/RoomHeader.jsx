import supabase from "../../../../config/supabaseClient";
import getAuthUser from "../../../../functions/auth/GetAuthUser";
import selectRoom from "../../../../functions/room/SelectRoom";
import selectRoomJoin from "../../../../functions/room_join/SelectRoomJoin";
import deleteRoomJoin from "../../../../functions/room_join/DeleteRoomJoin";
import style from "./RoomHeader.module.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCoordinates } from "../../../../functions/maps/Coord";

export default function RoomHeader({
    room,
    roomJoin,
    me,
}) {
    const navigate = useNavigate();
    const [canLeave, setCanLeave] = useState(false);
    const backBtnLogo = 'https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/backbtn.png';
    const leaveBtnLogo = 'https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/leavebtn.png';
    const locationIcon = 'https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/location_icon_red.png';

    useEffect(() => {
        async function fetchCanLeave() {
            if (!me) {
                return;
            }
            if (
                room
                && roomJoin
                && roomJoin.length > 0
            ) {
                try {
                    if (
                        room
                        && room.leader_id == me.id
                    ) {
                        // 방장인 경우
                        if (
                            roomJoin.filter((join) => (join.status == '준비 완료')).length > 0
                        ) {
                            setCanLeave(false);
                        } else {
                            setCanLeave(true);
                        }
                    } else {
                        // 일반인 경우
                        if (
                            roomJoin.filter((join) => (join.user_id == me?.id && join.status == '준비 완료')).length
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
    }, [room, roomJoin, me]);
    async function handleLeaveRoom() {
        try {
            const { id: user_id } = await getAuthUser();
            if(room && room.leader_id === user_id) {
                if(!confirm('방을 삭제하시겠습니까?')) {
                    return;
                }
            } else {
                if(!confirm('방을 나가시겠습니까?')) {
                    return;
                }
            }
            await deleteRoomJoin({
                room_id,
                user_id,
            });
            navigate(-1);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className={style.room_header}>
            <div className={style.room_header_left}>
                {room && <img onClick={() => {
                    navigate(-1);
                }} src={backBtnLogo} alt="Back Button" className={style.back_button} />}
                {room && <div className={style.room_name}>{room.room_name}</div>}
                {room && <div className={style.room_status}>{room.status}</div>}
            </div>
            <div className={style.room_header_right}>
                <div onClick={async () => {
                    const roomCoords = await getCoordinates(room.room_address);
                    window.open(`https://map.kakao.com/link/to/${encodeURIComponent(room.room_name)},${roomCoords.lat},${roomCoords.lng}`, "_blank");
                }} className={style.location_box}>
                    {room && <img src={locationIcon} alt="Location Icon" className={style.location_icon} />}
                    {room && <div className={style.location_address}>{room.room_address} {room.room_address_detail || ''}</div>}
                </div>
                {(room && roomJoin && canLeave) ? (
                    <img onClick={handleLeaveRoom} src={leaveBtnLogo} alt="Leave Button" className={style.leave_button} />
                ) : (
                    <div className={style.leave_button}></div>
                )}
            </div>
        </div>
    );
}