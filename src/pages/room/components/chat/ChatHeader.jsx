import style from "./ChatHeader.module.css";
import supabase from "../../../../config/supabaseClient";
import { useEffect, useState } from "react";

export default function ChatHeader() {
    const chatLogo = 'https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/chatemoji.png';
    return (
        <div className={style.chat_header}>
            <img src={chatLogo} alt="Chat Logo" className={style.chat_logo} />
            <div className={style.chat_title}>대화</div>
        </div>
    );
}