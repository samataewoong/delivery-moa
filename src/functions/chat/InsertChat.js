import supabase from "../../config/supabaseClient";

export default async function insertChat({
    room_id,
    user_id,
    chat
}) {
    const { data, error } = await supabase
        .from("chat")
        .insert({
            room_id,
            user_id,
            chat
        });
    if (error) throw error;
    return data;
}