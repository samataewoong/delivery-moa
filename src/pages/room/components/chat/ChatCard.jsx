import supabase from '../../../../config/supabaseClient'
import React, { useEffect, useState } from 'react'
import style from './ChatCard.module.css'
import selectUser from '../../../../functions/user/SelectUser';

export default function ChatCard({
	id, 
	user_id, 
	chat,
	created_at
}){
	const [user, setUser] = useState({ nickname: 'Unknown' });
	useEffect(() => {
		const fetchUser = async () => {
			try {
				const userData = await selectUser({ user_id });
				setUser(userData[0]);
			} catch (error) {
				console.error('Error fetching user:', error);
            }
		};
		const userSubscribe = supabase
		    .realtime
			.channel(`realtime:chat_watch_on_room_chat_card_in_chat_${id}`)
			.on(
                "postgres_changes",
                { event: '*', schema: 'public', table: 'user' },
                (payload) => {
					if (payload.new.id === user_id) {
                        fetchUser();
                    }
				}
			)
			.subscribe();
		fetchUser();
		return () => {
			userSubscribe.unsubscribe();
        };
	}, [user_id]);
	const date = new Date(Date.parse(created_at) + 32400000);
	let hours = `${date.getHours()}`;
	if (hours.length < 2) {
		hours = '0' + hours;
	}
	let minutes = `${date.getMinutes()}`;
	if (minutes.length < 2) {
		minutes = '0' + minutes;
	}

	return (
		<div className={style.chat}>
			<span className={style.chat_box} key={id}>
				<div className={style.chat_user}>{user.nickname}</div>
				<span className={style.date}>{`${hours} : ${minutes}`}</span>
				<div className={style.chat_chat}>{chat}</div>
			</span>
		</div>
	);
}
