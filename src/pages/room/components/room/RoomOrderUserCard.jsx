import selectRoomJoin from "../../../../functions/room_join/SelectRoomJoin";
import selectUser from "../../../../functions/user/SelectUser";
import { useEffect, useState } from "react";
import style from "./RoomOrderUserCard.module.css";

export default function RoomOrderUserCard({
    position,
    room_id,
    user_id,
}) {
    const [user, setUser] = useState(null);
    const [roomJoin, setRoomJoin] = useState(null);
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
    }, [user_id]);
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
                {roomJoin && <div className={(() => {
                    switch (roomJoin.status) {
                        case "준비 완료": return style.user_profile_status_ready;
                        case "준비중": return style.user_profile_status_pending;
                        case "수취 완료": return style.user_profile_status_received;
                    }
                })()}>
                    {roomJoin.status}
                </div>}
                {user && <div className={style.user_profile_nickname}>
                    {user?.nickname}
                </div>}
            </div>
        </div>
    );
}