import supabase from '../../config/supabaseClient';
import selectRoom from '../room/SelectRoom';

export default async function deleteRoomJoin({
    room_id,
    user_id,
}) {
    const roomData = await selectRoom({ room_id });
    if (!roomData || roomData.length === 0) {
        const { error } = await supabase
            .from('room_join')
            .delete()
            .eq('room_id', room_id);

        if (error) throw error;
        return;
    }
    if(roomData[0].leader_id === user_id) {
        const { error } = await supabase
            .from('room_join')
            .delete()
            .eq('room_id', room_id);

        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('room_join')
            .delete()
            .eq('room_id', room_id)
            .eq('user_id', user_id);
        if (error) throw error;
    }
}