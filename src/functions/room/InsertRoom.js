import supabase from '../../config/supabaseClient';

export default async function insertRoom({
    room_name,
    room_address,
    room_address_detail,
    max_people,
    leader_id,
    store_id
}) {
    
    const { data, error } = await supabase
        .from('room')
        .insert({
            room_name,
            room_address,
            room_address_detail,
            max_people,
            leader_id,
            store_id
        });

    if (error) {
        throw error;
    }

    return data;
}