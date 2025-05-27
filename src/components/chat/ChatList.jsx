import supabase from "../../config/supabaseClient";
import { useEffect, useState } from "react";
import Chat from "./ChatCard";
import style from "./ChatList.module.css";

export default function ChatList({ room_id }) {
    const [chats, setChats] = useState([]);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!chats.length) {
            async function fetchChats() {
                const { data, error } = await supabase
                    .from("chat")
                    .select("*")
                    .eq("room_id", room_id)
                    .order("created_at", { ascending: true });
                    // ascending: true 이므로 오래된 순으로 정렬
                if (error) {
                    console.error("Error fetching chat list:", error);
                    setError(error);
                }
                if (data) {
                    setChats(data);
                }
            }
            fetchChats();
        }
        const chatSubscribe = supabase
            .channel("realtime:chat")
            .on(
                "postgress_changes", 
                { event: '*', schema: 'public', table: 'chat' },(payload) => {
                const { data, error } = supabase
                    .from("chat")
                    .select("*")
                    .eq("room_id", room_id)
                    .order("created_at", { ascending: true });
                    // ascending: true 이므로 오래된 순으로 정렬
                if (error) {
                    console.error("Error fetching chat list:", error);
                }
                if (data) {
                    setChats(data);
                }
            })
            .subscribe();
        const roomSubscribe = supabase
            .channel("realtime:room")
            .on(
                "postgress_changes", 
                { event: '*', schema: 'public', table: 'room' },(payload) => {
                const { data, error } = supabase
                    .from("chat")
                    .select("*")
                    .eq("room_id", room_id)
                    .order("created_at", { ascending: true });
                    // ascending: true 이므로 오래된 순으로 정렬
                if (error) {
                    console.error("Error fetching chat list:", error);
                }
                if (data) {
                    setChats(data);
                }
            })
            .subscribe();
        return () => {
            chatSubscribe.unsubscribe();
            roomSubscribe.unsubscribe();
        }
    }, [room_id]);
    

    if (error) {
        console.error("Error fetching chat list:", error);
        return <div>Error loading chat list</div>;
    }

    return (
        <div className={style.chat_list}>
            {chats.map((chat) => (
                <Chat
                    key={`${chat.room_id}-${chat.id}`}
                    id={chat.id}
                    user_id={chat.user_id}
                    chat={chat.chat}
                    created_at={chat.created_at}
                />
            ))}
        </div>
    );
}
