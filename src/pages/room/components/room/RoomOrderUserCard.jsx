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
    room,
    roomJoin,
    roomJoinList,
    me,
}) {
    const navigate = useNavigate();
    const [isLeader, setIsLeader] = useState(false);
    const [isSelf, setIsSelf] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [user, setUser] = useState(null);
    const basic_profile = "https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/profile-image/mypagePerson.png"
    
    useEffect(() => {
        async function fetchOrder() {
            const { data: orderData, error: orderError } = await supabase
                .from('order')
                .select('*')
                .eq('room_id', room?.id)
                .eq('user_id', user?.id)
                .order('order_id', { ascending: false })
                .limit(1)
                .single();
            if (orderError) {
                console.error(orderError);
            }
            setOrderId(orderData?.order_id);
        }
        const orderSubscribe = supabase
            .realtime
            .channel(`realtime:order_status_watch_on_room_order_user_card_in_room_${room?.id}_user_${roomJoin?.user_id}`)
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
    }, [room?.id]);
    useEffect(() => {
        async function fetchUser() {
            if (!roomJoin || !roomJoin?.user_id) return;
            const userData = await selectUser({ user_id: roomJoin.user_id });
            if (userData.length > 0) {
                setUser(userData[0]);
            } else {
                console.error("User not found");
            }
        }
        const userSubscribe = supabase
            .realtime
            .channel(`realtime:user_watch_on_room_order_user_card_in_room_${room?.id}_user_${roomJoin?.user_id}`)
            .on(
                "postgres_changes",
                { event: '*', schema: 'public', table: 'user' },
                (payload) => {
                    if (payload.new.id === roomJoin?.user_id) {
                        fetchUser();
                    }
                }
            )
            .subscribe();
        fetchUser();
        return () => {
            userSubscribe.unsubscribe();
        };
    }, [roomJoin, roomJoinList, room?.id]);
    useEffect(() => {
        async function fetchIsLeader() {
            if (room && room.leader_id === roomJoin?.user_id) {
                setIsLeader(true);
            } else {
                setIsLeader(false);
            }
        }
        fetchIsLeader();
    }, [room?.id, me?.id, roomJoin]);
    useEffect(() => {
        async function fetchIsSelf() {
            if(roomJoin?.user_id === me?.id) {
                setIsSelf(true);
            } else {
                setIsSelf(false);
            }
        }
        fetchIsSelf();
    }, [roomJoin]);
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
            <div>
                <img 
                className={style.user_profile_image} 
                src={user?.profile_url || basic_profile} />
            </div>
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