import ChatList from './ChatList'
import ChatInput from './ChatInput'
import styles from './Chat.module.css'

export default function Chat({
	room_id
}) {
	return (
		<div className={styles.chat}>
			<ChatList room_id={room_id} />
			<ChatInput room_id={room_id} />
		</div>
	);
}
