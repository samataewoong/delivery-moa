import selectRoomJoin from "../../../../functions/room_join/SelectRoomJoin";
import selectRoom from "../../../../functions/room/SelectRoom";
import updateRoom from "../../../../functions/room/UpdateRoom";
import selectUser from "../../../../functions/user/SelectUser";
import getAuthUser from "../../../../functions/auth/GetAuthUser";
import { useEffect, useState } from "react";
import supabase from "../../../../config/supabaseClient";
import style from "./RoomOrderUserCard.module.css";

export default function RoomOrderUserCard({
    position,
    room_id,
    user_id,
}) {
    const [user, setUser] = useState(null);
    const [room, setRoom] = useState(null);
    const [roomJoin, setRoomJoin] = useState(null);
    const [isLeader,setIsLeader] = useState(false);
    const [isSelf, setIsSelf] = useState(false);
    useEffect(() => {
        async function fetchRoom() {
            const roomData = await selectRoom({
                room_id,
            });
            if (roomData.length > 0) {
                setRoom(roomData[0]);
            }
        }
        const roomSubscribe = supabase
            .realtime
            .channel('realtime:room')
            .on("postgres_changes", (payload) => {
                if (payload.new.id === room_id) {
                    fetchRoom();
                }
            });
        fetchRoom();
    }, [room_id]);
    useEffect(() => {
        const process = async () => {
            try {
                let userData = await selectUser({ user_id });
                if (userData.length > 0) {
                    setUser(userData[0]);
                    const roomJoinData = await selectRoomJoin({ room_id, user_id });
                    if (roomJoinData.length > 0) {
                        setRoomJoin(roomJoinData[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching user or room join:", error);
            }
        };
        process();
    }, [user_id])
    useEffect(() => {
        async function fetchIsLeader() {
            if(room && room.leader_id === user_id) {
                setIsLeader(true);
            } else {
                setIsLeader(false);
            }
        }
        fetchIsLeader();
    }, [room, user, user_id, room_id]);
    useEffect(() => {
        async function fetchIsSelf() {
            const { id } = await getAuthUser();
            if(id == user_id) {
                setIsSelf(true);
            } else {
                setIsSelf(false);
            }
        }
        fetchIsSelf();
    }, [user_id]);
    async function handleEndRecruit() {
        try {
            await updateRoom({
                room_id,
                status: "준비중",
            });
        } catch (error) {
            console.error("Error ending recruit:", error);
        }
    }

    const boxClassName = (() => {
        switch (position) {
            case "top": return style.user_profile_box_top;
            case "bottom": return style.user_profile_box_bottom;
            default: return style.user_profile_box;
        }
    })();
    return (
        <div className={boxClassName}>
            <div className={style.user_profile_image} />
            <div className={style.user_profile_status_box}>
                <div className={style.user_profile_left_box}>
                    {user && <div className={style.user_profile_nickname}>
                        {user?.nickname}
                    </div>}
                    {room && isLeader && isSelf && room.status == '모집중' && <div onClick={handleEndRecruit} className={style.end_recruit_button}>
                        모집 마감
                    </div>}
                </div>
                {roomJoin && <div className={(() => {
                    switch (roomJoin.status) {
                        case "준비 완료": return style.user_profile_status_ready;
                        case "준비중": return style.user_profile_status_pending;
                        case "수취 완료": return style.user_profile_status_received;
                    }
                })()}>
                    {roomJoin.status}
                </div>}
            </div>
        </div>
    );
}