import supabase from "../../config/supabaseClient";

export default async function selectStore({
    store_id,
    store_name_like,
    category_id,
}) {
    let supabaseQuery = supabase
       .from("store")
       .select("*");
    if (store_id) supabaseQuery = supabaseQuery.eq("id", store_id);
    if (category_id) supabaseQuery = supabaseQuery.eq("category_id", category_id);
    if (store_name_like) supabaseQuery = supabaseQuery.ilike("store_name", `%${store_name_like}%`);
    const { data, error } = await supabaseQuery;
    if (error) throw error;
    return data;
}