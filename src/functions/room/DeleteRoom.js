import supabase from "../../config/supabaseClient";
import selectRoom from "./SelectRoom";

export default async function deleteRoom({
    room_id,
}) {
    const roomData = await selectRoom({ room_id });
    if (!roomData || roomData.length === 0) {
        throw new Error("방이 존재하지 않습니다.");
    }
    const { error: roomDeleteError } = await supabase
        .from("room")
        .update({
            status: "삭제"
        })
        .eq("id", room_id);
    if (roomDeleteError) throw roomDeleteError;
}