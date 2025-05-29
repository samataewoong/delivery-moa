import supabase from "../../config/supabaseClient";

export default async function selectRoomJoin({
    room_id,
    user_id,
    status,
}) {
    let supabaseQuery = supabase
        .from("room_join")
        .select("*");
    if (room_id) supabaseQuery = supabaseQuery.eq("room_id", room_id);
    if (user_id) supabaseQuery = supabaseQuery.eq("user_id", user_id);
    if (status) supabaseQuery = supabaseQuery.eq("status", status);
    const { data, error } = await supabaseQuery;

    if (error) {
        throw error;
    }

    return data;
}