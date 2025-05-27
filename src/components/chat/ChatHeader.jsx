import style from "./ChatHeader.module.css";
import supabase from "../../config/supabaseClient";
import { useEffect, useState } from "react";

export default function ChatHeader() {
    const [logo, setLogo] = useState(null);
    useEffect(() => {
        // Simulate fetching a logo or image for the chat header
        const fetchLogo = async () => {
            const { data, error } = await supabase
                .storage
                .from("imgfile")
                .getPublicUrl("main_img/chatemoji.png");
            if (error) {
                console.error("Error fetching logo:", error);
            } else {
                setLogo(data.publicUrl); // Fallback to a default logo if none found
            }
        };
        fetchLogo();
    }, []);
    return (
        <div className={style.chat_header}>
            <img src={logo} alt="Chat Logo" className={style.chat_logo} />
            <div className={style.chat_title}>대화</div>
        </div>
    );
}