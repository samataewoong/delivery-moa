import supabase from "../../config/supabaseClient";

export default async function selectRoom({
    room_id,
    room_name_like,
    store_id,
}) {
    let supabaseQuery = supabase
       .from("room")
       .select("*");
    if (room_id) supabaseQuery = supabaseQuery.eq("id", room_id);
    if (store_id) supabaseQuery = supabaseQuery.eq("store_id", store_id);
    if (room_name_like) supabaseQuery = supabaseQuery.ilike("room_name", `%${room_name_like}%`);
    const { data, error } = await supabaseQuery;
    if (error) throw error;
    return data;
}