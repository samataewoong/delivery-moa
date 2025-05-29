import supabase from "../../config/supabaseClient";
import selectRoom from "../room/SelectRoom";
import selectRoomJoin from "./SelectRoomJoin";

export default async function InsertRoomJoin({
    room_id,
    user_id,
    status = "준비중"
}) {
    const room = await selectRoom({ room_id });
    if (!room) {
        throw new Error("방이 존재하지 않습니다.");
    }

    const roomJoin = await selectRoomJoin({ room_id });
    if (room.max_people <= roomJoin.length) {
        throw new Error("이미 방이 가득 찼습니다.");
    }

    if (roomJoin.find(join => join.user_id === user_id)) {
        return undefined;
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
