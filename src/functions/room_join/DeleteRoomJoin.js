import supabase from '../../config/supabaseClient';
import selectRoom from '../room/SelectRoom';
import selectRoomJoin from './SelectRoomJoin';
import deleteRoom from '../room/DeleteRoom';

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
    const roomJoinData = await selectRoomJoin({ room_id,user_id})
    if(roomData[0].leader_id === user_id) {
        if(roomJoinData.filter((join) => join.status === '준비 완료').length > 0) {
            throw new Error("준비 완료된 사용자가 있어서 방을 나갈 수 없습니다.");
        } else {
            const { error:roomJoinDeleteError } = await supabase
                .from('room_join')
                .delete()
                .eq('room_id', room_id);
            if (roomJoinDeleteError) throw roomJoinDeleteError;
            await deleteRoom({ room_id });
        }
    } else {
        if(roomJoinData.filter((join) => (join.user_id == user_id && join.status === '준비 완료')).length > 0) {
            throw new Error("준비 완료된 상태에서는 방을 나갈 수 없습니다.");
        } else {
            const { error } = await supabase
                .from('room_join')
                .delete()
                .eq('room_id', room_id)
                .eq('user_id', user_id);
            if (error) throw error;
        }
    }
}