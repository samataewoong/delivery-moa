import supabase from '../../../../config/supabaseClient'
import React, { useEffect, useState } from 'react'
import style from './ChatInput.module.css'
import getAuthUser from '../../../../functions/auth/GetAuthUser';

export default function ChatInput({
	room_id
}) {
	const [chat, setChat] = useState('');
	const handleSubmit = () => {
			async function insertChat() {
				let user_id = null;
				try {
					const { id } = await getAuthUser();
					user_id = id;
				} catch (error) {
					alert('로그인 정보를 가져오는데 실패하였습니다. 다시 로그인 해 주세요.');
					navigate('/login');
                    return;
                }
				if (!user_id) {
					alert('로그인 정보를 가져오는데 실패하였습니다. 다시 로그인 해 주세요.');
                    navigate('/login');
                    return;
                }
				if (user_id) {
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
