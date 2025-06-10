import supabase from "../../config/supabaseClient";

export default async function selectRoom({
    room_id,
    room_name_like,
    room_name,
    room_address,
    room_address_detail,
    max_people,
    leader_id,
    status,
    store_id,
}) {
    let supabaseQuery = supabase
       .from("room")
       .select("*");
    if (room_id) supabaseQuery = supabaseQuery.eq("id", room_id);
    if (store_id) supabaseQuery = supabaseQuery.eq("store_id", store_id);
    if (room_name_like) supabaseQuery = supabaseQuery.ilike("room_name", `%${room_name_like}%`);
    if (room_name) supabaseQuery = supabaseQuery.eq("room_name", room_name);
    if (room_address) supabaseQuery = supabaseQuery.eq("room_address", room_address);
    if (room_address_detail) supabaseQuery = supabaseQuery.eq("room_address_detail", room_address_detail);
    if (max_people) supabaseQuery = supabaseQuery.eq("max_people", max_people);
    if (leader_id) supabaseQuery = supabaseQuery.eq("leader_id", leader_id);
    if (status) supabaseQuery = supabaseQuery.eq("status", status);

    const { data, error } = await supabaseQuery;
    if (error) throw error;
    // Sort by room_id in descending order to get the latest room first.
    return data.sort((a, b) => b.id - a.id);
}