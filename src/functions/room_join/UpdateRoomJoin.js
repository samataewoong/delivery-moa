import supabase from "../../config/supabaseClient";

export default async function updateRoomJoin({
    room_id,
    user_id,
    status
}) {
    if (typeof room_id == 'undefined' || typeof user_id == 'undefined' || typeof status == 'undefined') {
        throw new Error("room_id, user_id, status must be provided");
    }
    const { data, error } = await supabase
        .from("room_join")
        .update({ status })
        .eq("room_id", room_id)
        .eq("user_id", user_id);
    if (error) throw error;
    return data;
}