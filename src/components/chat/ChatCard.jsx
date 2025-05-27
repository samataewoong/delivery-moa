import supabase from '../../config/supabaseClient'
import React, { useEffect, useState } from 'react'
import style from './ChatCard.module.css'

export default function ChatCard({
	id, 
	user_id, 
	chat,
	created_at
}){
	const [user, setUser] = useState({});
	useEffect(() => {
		const fetchUser = async () => {
			const { data, error } = await supabase
				.from('user')
				.select('*')
				.eq('id', user_id)
				.single();
			if (error) {
				console.error('Error fetching user:', error);
			} else {
				setUser(data || { nickname: 'Unknown' });
			}
		};
		fetchUser();
	}, [user_id]);
	const date = new Date(created_at);
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
