import supabase from "../../config/supabaseClient";
import selectRoom from "../room/SelectRoom";
import selectRoomJoin from "./SelectRoomJoin";

export default async function InsertRoomJoin({
    room_id,
    user_id,
    status = "준비중"
}) {
    const room = await selectRoom({ room_id });
    if (!room || room.length === 0) {
        throw new Error("방이 존재하지 않습니다.");
    }

    const roomJoin = await selectRoomJoin({ room_id });
    if (roomJoin.find(join => join.user_id === user_id)) {
        return undefined;
    }

    if (room[0].status != '모집중') {
        throw new Error("방의 상태가 모집중이 아닙니다.");
    }

    if (room[0].max_people <= roomJoin.length) {
        throw new Error("이미 방이 가득 찼습니다.");
    }


    const { data, error } = await supabase
        .from("room_join")
        .insert({
            room_id,
            user_id
        });

    if (error) {
        throw error;
    }

    return data;
}
