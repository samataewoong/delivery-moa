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
    const [roomJoinList, setRoomJoinList] = useState([]);
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
            .channel(`realtime:room_status_watch_on_room_order_user_card_in_room_${room_id}`)
            .on(
                "postgres_changes",
                { event: '*', schema: 'public', table:'room' },
                (payload) => {
                if (payload.new.id === Number(room_id)) {
                    fetchRoom();
                }
            })
            .subscribe();
        fetchRoom();
        return () => {
            roomSubscribe.unsubscribe();
        }
    }, [room_id]);
    useEffect(() => {
        const process = async () => {
            try {
                let userData = await selectUser({ user_id });
                if (userData.length > 0) {
                    setUser(userData[0]);
                    if (roomJoinList.filter((user) => (user.user_id === user_id)).length > 0) {
                        setRoomJoin(roomJoinList.filter((join) => (join.user_id === user_id))[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching user or room join:", error);
            }
        };
        process();
    }, [user_id, roomJoinList]);
    useEffect(() => {
        async function fetchRoomJoinList() {
            const roomJoinData = await selectRoomJoin({ room_id });
            setRoomJoinList(roomJoinData);
        }
        const roomJoinListSubscribe = supabase
           .realtime
           .channel(`realtime:room_join_status_update_watch_on_room_order_user_card_in_room_${room_id}`)
           .on(
                "postgres_changes",
                { event: '*', schema: 'public', table: 'room_join' },
                (payload) => {
                    console.log("Received payload:", payload);
                    if (payload.new.room_id === Number(room_id) || payload.eventType == "DELETE") {
                        fetchRoomJoinList();
                    }
                }
           )
           .subscribe();
        fetchRoomJoinList();
        return () => {
            roomJoinListSubscribe.unsubscribe();
        };
    }, [room_id]);
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
            if(!confirm('모집을 마감하시겠습니까?')) return;
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
                    {room && isLeader && isSelf && <div className={style.leader_mark}>
                        방장
                    </div>}
                    {room && isLeader && isSelf && room.status == '모집중' && <div onClick={handleEndRecruit} className={style.end_recruit_button}>
                        모집 마감
                    </div>}
                    {room && isLeader && isSelf && roomJoinList && roomJoinList.filter(join => join.status === '준비 완료').length == roomJoinList.length && (room.status == '준비중' || room.status == '모집중') && <div className={style.order_button}>
                        주문
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