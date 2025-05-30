import supabase from "../../config/supabaseClient";

export default async function selectOrder({
    room_id,
    user_id,
}) {
    let supabaseQuery = supabase
        .from("order")
        .select("*");
    if (room_id) supabaseQuery = supabaseQuery.eq("room_id", room_id);
    if (user_id) supabaseQuery = supabaseQuery.eq("user_id", user_id);
    const { data, error } = await supabaseQuery;
    if (error) throw error;
    // 내림차순 정렬
    return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}