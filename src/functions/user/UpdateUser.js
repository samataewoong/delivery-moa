import supabase from "../../config/supabaseClient";

export default async function updateUser({
    user_id,
    nickname,
    user_rating,
    cash,
}) {
    if(typeof user_id == 'undefined') throw new Error("user_id is required");
    let object = {};
    if (nickname) object.nickname = nickname;
    if (user_rating) object.user_rating = user_rating;
    if (cash) object.cash = cash;
    const { data, error } = await supabase
        .from("user")
        .update(object)
        .eq("id", user_id);
    if (error) throw error;
    return data;
}