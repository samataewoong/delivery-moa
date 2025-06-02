import supabase from "../../config/supabaseClient";

export default async function updateRoom({
    room_id,
    status,
}) {
    const { error } = await supabase
        .from("room")
        .update({
            status
        })
        .eq("id", room_id);
    if (error) throw error;
}