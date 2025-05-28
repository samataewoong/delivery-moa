import supabase from "../../config/supabaseClient";
import { useEffect, useState, useRef } from "react";
import Chat from "./ChatCard";
import style from "./ChatList.module.css";

export default function ChatList({ room_id }) {
    const [chats, setChats] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchChats() {
            const { data, error } = await supabase
                .from("chat")
                .select("*")
                .eq("room_id", room_id)
                .order("created_at", { ascending: true });
            if (error) {
                console.error("Error fetching chat list:", error);
                setError(error);
            }
            if (data) {
                setChats(data);
            }
        }
        fetchChats();

        const chatSubscription = supabase
            .channel("realtime:chat")
            .on(
                "postgres_changes", 
                { event: '*', schema: 'public', table: 'chat' },
                (payload) => {
                    console.log("Chat payload:", payload);
                    if (payload.new) {
                        setChats((prevChats) => [...prevChats, payload.new]);
                    }
                }
            )
            .subscribe();

        return () => {
            chatSubscription.unsubscribe();
        };
    }, [room_id]);
    useEffect(() => {
        const chatList = document.querySelector(`.${style.chat_list}`);
        if (chatList) {
            chatList.scrollTop = chatList.scrollTopMax;
        }
    }, [chats]);

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