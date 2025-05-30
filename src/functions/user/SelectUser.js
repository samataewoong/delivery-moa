import supabase from "../../config/supabaseClient";

export default async function selectUser({
    user_id,
}) {
    let supabaseQuery = supabase
        .from("user")
        .select("*");
    if (user_id) supabaseQuery = supabaseQuery.eq("id", user_id);
    const { data, error } = await supabaseQuery;
    if (error) throw error;
    return data;
}