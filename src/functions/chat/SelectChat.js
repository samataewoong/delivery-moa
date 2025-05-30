import supabase from '../../config/supabaseClient';

export default async function selectChat({
    room_id,
    user_id
}) {
    let supabaseQuery = supabase
        .from('chat')
        .select('*');
    if (room_id) supabaseQuery = supabaseQuery.eq('room_id', room_id);
    if (user_id) supabaseQuery = supabaseQuery.eq('user_id', user_id);
    const { data, error } = await supabaseQuery;
    if (error) throw error;

    return data;
}