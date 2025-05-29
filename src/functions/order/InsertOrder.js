import supabase from "../../config/supabaseClient";
import DateToString from "../../utils/DateToString";
import selectOrder from "./SelectOrder";

export default async function insertOrder({
    store_id,
    room_id,
    user_id,
    room_order,
    total_price,
}) {
    const { data, error } = await supabase
        .from("order")
        .insert({
            store_id,
            room_id,
            user_id,
            room_order,
            total_price,
        });

    if (error) throw error;
    return data;
}