import supabase from '../../config/supabaseClient'
import React, { useEffect, useState } from 'react'
import style from './ChatInput.module.css'

export default function ChatInput({
	room_id
}) {
	const [chat, setChat] = useState('');
	const handleSubmit = () => {
			async function insertChat() {
				var { data, error } = await supabase.auth.getUser();
				if (error) {
					console.error("Error getting user:", error);
					alert('채팅 전송에 실패했습니다. 다시 시도해주세요. ' + error.message);
				}
				const user_id = data.user.id;
				if (data && data.user) {
					var { data, error } = await supabase
						.from('chat')
						.insert({
							room_id,
							user_id,
							chat,
						});
					if (error) {
						console.error('Error inserting chat:', error);
						alert('채팅 전송에 실패했습니다. 다시 시도해주세요. ' + error.message);
					} else {
						console.log('Inserted chat:', data);
						setChat('');
					}
				}
			}
			insertChat();
	};
	const handleInput = (e) => {
		setChat(e.target.value);
	};
	return (
		<div className={style.chat_input_box}>
			<input type="text" className={style.chat_input} onChange={handleInput} placeholder='메시지를 입력' value={chat} />
			<input type="button" className={style.chat_submit_button} onClick={handleSubmit} value={'전송'} disabled={chat.trim().length > 0 ? false : true} />
		</div>
	);
}
