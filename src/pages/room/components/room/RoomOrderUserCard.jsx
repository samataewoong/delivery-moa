import selectRoomJoin from "../../../../functions/room_join/SelectRoomJoin";
import selectRoom from "../../../../functions/room/SelectRoom";
import updateRoom from "../../../../functions/room/UpdateRoom";
import updateRoomJoin from "../../../../functions/room_join/UpdateRoomJoin";
import selectUser from "../../../../functions/user/SelectUser";
import getAuthUser from "../../../../functions/auth/GetAuthUser";
import { useEffect, useState } from "react";
import supabase from "../../../../config/supabaseClient";
import style from "./RoomOrderUserCard.module.css";
import { useNavigate } from "react-router-dom";

export default function RoomOrderUserCard({
    position,
    room_id,
    user_id,
}) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [room, setRoom] = useState(null);
    const [roomJoin, setRoomJoin] = useState(null);
    const [roomJoinList, setRoomJoinList] = useState([]);
    const [isLeader, setIsLeader] = useState(false);
    const [isSelf, setIsSelf] = useState(false);
    const [orderId, setOrderId] = useState(null);
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
            .channel(`realtime:room_status_watch_on_room_order_user_card_in_room_${room_id}_user_${user_id}`)
            .on(
                "postgres_changes",
                { event: '*', schema: 'public', table: 'room' },
                (payload) => {
                    if (payload.new.id === Number(room_id)) {
                        fetchRoom();
                        if (payload.new.status === '조리중') {
                            setTimeout(async () => {
                                await updateRoom({
                                    room_id,
                                    status: "배송중",
                                });
                            }, 60000);
                        }
                        if (payload.new.status === '배송중') {
                            setTimeout(async () => {
                                await updateRoom({
                                    room_id,
                                    status: "픽업 대기중",
                                });
                            }, 60000);
                        }
                    }
                })
            .subscribe();
        fetchRoom();
        return () => {
            roomSubscribe.unsubscribe();
        }
    }, [room_id]);
    useEffect(() => {
        async function fetchUser() {
            const userData = await selectUser({
                user_id,
            });
            setUser(userData[0]);
        }
        const userSubscribe = supabase
            .realtime
            .channel(`realtime:user_watch_on_room_order_user_card_in_room_${room_id}_user_${user_id}`)
            .on(
                "postgres_changes",
                { event: '*', schema: 'public', table: 'user' },
                (payload) => {
                    if (payload.new.id === user_id) {
                        fetchUser();
                    }
                }
            )
            .subscribe();
        fetchUser();
        return () => {
            userSubscribe.unsubscribe();
        };
    }, [user_id]);
    useEffect(() => {
        async function fetchRoomJoinList() {

            const roomJoinData = await selectRoomJoin({ room_id });
            setRoomJoinList(roomJoinData.sort((a, b) => Date.parse(a.joined_at) - Date.parse(b.joined_at)));
            if(roomJoinData.filter((join) => (join.user_id === user_id)).length > 0){
                setRoomJoin(roomJoinData.filter((join) => join.user_id === user_id)[0]);
            }
        }
        const roomJoinListSubscribe = supabase
            .realtime
            .channel(`realtime:room_join_status_update_watch_on_room_order_user_card_in_room_${room_id}_user_${user_id}`)
            .on(
                "postgres_changes",
                { event: '*', schema: 'public', table: 'room_join' },
                (payload) => {
                    if (payload.new.room_id === Number(room_id)) {
                        let tmp = null;
                        setRoomJoin((prevRoomJoin) => (tmp = [...prevRoomJoin.filter((row) => (!((row.user_id === payload.new?.user_id || row.user_id === payload.old?.user_id) && (row.room_id == Number(payload.new?.room_id) || row.room_id === Number(payload.old?.room_id))))), payload.new].filter((row) => (row)).sort((a, b) => Date.parse(a.joined_at) - Date.parse(b.joined_at)),tmp));
                        console.log("Room ID matches, fetching room join data...");
                    }
                    if (payload.eventType === "DELETE"){
                        let tmp = null;
                        setRoomJoin((prevRoomJoin) => (tmp = [...prevRoomJoin.filter((row) => (row.id !== payload.old.id))],tmp));
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
        async function fetchOrder() {
            const { data: orderData, error: orderError } = await supabase
                .from('order')
                .select('*')
                .eq('room_id', room_id)
                .eq('user_id', user_id)
                .order('order_id', { ascending: false })
                .limit(1)
                .single();
            if (orderError) {
                throw orderError;
            }
            setOrderId(orderData?.order_id);
        }
        const orderSubscribe = supabase
            .realtime
            .channel(`realtime:order_status_watch_on_room_order_user_card_in_room_${room_id}_user_${user_id}`)
            .on(
                "postgres_changes",
                { event: '*', schema: 'public', table: 'order' },
                (payload) => {
                    if (payload.new.room_id === Number(room_id) && payload.new.user_id === user_id) {
                        fetchOrder();
                    }
                }
            )
            .subscribe();
        fetchOrder();
        return () => {
            orderSubscribe.unsubscribe();
        };
    }, [room_id]);
    useEffect(() => {
        async function fetchIsLeader() {
            if (room && room.leader_id === user_id) {
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
            if (id == user_id) {
                setIsSelf(true);
            } else {
                setIsSelf(false);
            }
        }
        fetchIsSelf();
    }, [user_id]);
    async function handleEndRecruit() {
        try {
            if (!confirm('모집을 마감하시겠습니까?')) return;
            await updateRoom({
                room_id,
                status: "준비중",
            });
        } catch (error) {
            console.error("Error ending recruit:", error);
        }
    }
    async function handlePickUp() {
        try {
            if (!confirm('픽업하시겠습니까?')) return;
            await updateRoomJoin({
                room_id,
                user_id,
                status: "픽업 완료",
            });
            navigate(`/gongucomplete/${orderId}`);
        } catch (error) {
            console.error("Error picking up:", error);
        }
    }
    async function handleRoomOrder() {
        try {
            if (!confirm('주문하시겠습니까?')) return;
            await updateRoom({
                room_id,
                status: "조리중",
            });
        } catch (error) {
            console.error("Error ordering:", error);
        }
    }
    async function handleRoomEnd() {
        try {
            if (!confirm("공구방을 종료하시겠습니까?")) return;
            await updateRoom({
                room_id,
                status: "종료"
            });
        } catch (error) {
            console.error("Error ending room:", error);
        }
    }

    const boxClassName = (() => {
        switch (position) {
            case "top": return style.user_profile_box_top;
            case "bottom": return style.user_profile_box_bottom;
            default: return style.user_profile_box;
        }
    })();
    const statusClassName = (() => {
        if (roomJoin) {

            switch (roomJoin.status) {
                case "준비 완료": return style.user_profile_status_ready;
                case "준비중": return style.user_profile_status_pending;
                case "픽업 완료": return style.user_profile_status_received;

            }
        }
    })();
    console.log("roomJoin:", roomJoin); // Debugging line
    return (
        <div className={boxClassName}>
            <div className={style.user_profile_image} />
            <div className={style.user_profile_status_box}>
                <div className={style.user_profile_left_box}>
                    {user && <div className={style.user_profile_nickname}>
                        {user?.nickname}
                    </div>}
                    {room && isLeader && <div className={style.leader_mark}>
                        방장
                    </div>}
                    {room && isLeader && isSelf && room.status == '모집중' && <div onClick={handleEndRecruit} className={style.end_recruit_button}>
                        모집 마감
                    </div>}
                    {room && isLeader && isSelf && roomJoinList && roomJoinList.filter(join => join.status === '준비 완료').length == roomJoinList.length && (room.status == '준비중' || room.status == '모집중') && <div onClick={handleRoomOrder} className={style.order_button}>
                        주문
                    </div>}
                    {room && roomJoin && isSelf && room.status === '픽업 대기중' && roomJoin.status !== '픽업 완료' && <div onClick={handlePickUp} className={style.pick_up_button}>
                        픽업 완료
                    </div>}
                    {room && isLeader && isSelf && room.status !== '종료' && roomJoinList.filter(join => join.status === '픽업 완료').length === roomJoinList.length && <div onClick={handleRoomEnd} className={style.room_end_button}>
                        종료
                    </div>}

                </div>
                {roomJoin && <div className={statusClassName}>
                    {roomJoin.status}
                </div>}
            </div>
        </div>
    );
}