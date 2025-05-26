import { useState, useEffect } from 'react';
import supabase from '../../config/supabaseClient';
import style from './RoomInfo.module.css';
import MenuCard from '../menu/MenuCard';
import RoomUserCard from './RoomUserCard';

export default function RoomInfo({ room_id }) {
    const [leader, setLeader] = useState({});
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [room, setRoom] = useState(null);
    const [store, setStore] = useState(null);

    useEffect(() => {
        const fetchRoom = async () => {
            const { data, error } = await supabase
                .from('room')
                .select('*')
                .eq('id', room_id)
                .single();

            if (error) {
                console.error('Error fetching room:', error);
                setError(error);
            } else {
                setRoom(data);
                if (data) {
                    const { data: storeData, error: storeError } = await supabase
                        .from('store')
                        .select('*')
                        .eq('id', data.store_id)
                        .single();

                    if (storeError) {
                        console.error('Error fetching store:', storeError);
                        setError(storeError);
                    } else {
                        setStore(storeData);
                    }
                }
            }
        };

        const fetchUsers = async () => {
            const { data, error } = await supabase
                .from('room')
                .select('*')
                .eq('id', room_id)
                .single();

            if (error) {
                console.error('Error fetching users:', error);
                setError(error);
            } else {

                const userIds = data.users.map(user => user.id);
                const { data: userDetails, error: userError } = await supabase
                    .from('user')
                    .select('*')
                    .in('id', userIds);

                if (userError) {
                    console.error('Error fetching user details:', userError);
                    setError(userError);
                } else {
                    const userWithDetails = data.users.map((user) => {
                        let nickname = 'Unknown';
                        for (let userDetail of userDetails) {
                            if (userDetail.id === user.id) {
                                nickname = userDetail.nickname;
                            }
                        }
                        return { ...user, nickname, menus: user.menus || [], status: user.status };
                    });
                    setUsers(userWithDetails || []);
                }
            }
        };
        const usersSubscribe = supabase
            .channel('realtime:room')
            .on(
                'postgress_changes',
                { event: '*', schema: 'public', table: 'room' },
                (payload) => {
                    fetchUsers();
                    fetchRoom();
                }
            )
            .subscribe();

        fetchUsers();
        fetchRoom();
    }
        , [room_id]);

    if (error) {
        return <div className={style.error}>Error fetching room info: {error.message}</div>;
    }

    return (
        <div className={style.room_info}>
            {room && (
                <>
                    <div className={style.room_header}>
                        <div>
                            <div className={style.room_created_at}>
                                {new Date(room.created_at).toLocaleString()}
                            </div>
                            <div></div>
                            <div className={style.room_address}>
                                {room.room_address}
                            </div>
                            <div className={style.room_name}>
                                {room.room_name}
                            </div>
                        </div>
                        <div className={style.room_store}>
                            <div className={style.store_address}>
                                {store ? store.store_address : 'Unknown Address'}
                            </div>
                            <div className={style.store_name}>
                                {store ? store.store_name : 'Unknown Store'}
                            </div>
                        </div>
                    </div>
                    <div className={style.room_users}>
                        {users.length > 0 ? (
                            users.map(user => (
                                <RoomUserCard key={user.id} user={user} />
                            )
                            )) : (
                            <span className={style.no_users}>No users in this room</span>
                        )
                        }
                    </div>
                </>
            )}

        </div>
    );
}