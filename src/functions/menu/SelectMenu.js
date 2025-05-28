import supabase from "../../config/supabaseClient";

export default async function selectMenu({
    menu_id,
    menu_name_like,
    store_id,
}) {
    let supabaseQuery = supabase
        .from("menu")
        .select("*");   
    if (menu_id) supabaseQuery = supabaseQuery.eq("id", menu_id);
    if (store_id) supabaseQuery = supabaseQuery.eq("store_id", store_id);
    if (menu_name_like) supabaseQuery = supabaseQuery.ilike("menu_name", `%${menu_name_like}%`);
    const { data, error } = await supabaseQuery;
    if (error) throw error;
    return data;
}