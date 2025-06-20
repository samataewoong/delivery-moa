import supabase from "../../../../config/supabaseClient";
import { useEffect, useState } from "react";
import style from "./RoomOrderStatus.module.css";
import RoomOrderUserCard from "./RoomOrderUserCard";
import selectRoomJoin from "../../../../functions/room_join/SelectRoomJoin";

export default function RoomOrderStatus({
    room,
    roomJoin,
    me,
}) {
    return (
        <div className={style.order_status_box}>
            <div className={style.order_status_title}>주문 현황</div>
            <div className={style.user_profile_list_box}>
                {roomJoin.map((user, index) => {
                    const position = (() => {
                        switch (index) {
                            case 0: return "top";
                            case roomJoin.length - 1: return "bottom";
                            default: return "center";
                        }
                    })();
                    return (
                        <RoomOrderUserCard
                            position={position}
                            key={user?.user_id}
                            room={room}
                            roomJoin={roomJoin.filter((join) => (join.user_id === user.user_id))[0]}
                            roomJoinList={roomJoin}
                            me={me}
                        />
                    );
                })}
            </div>
        </div>
    )
}