import style from "./RoomUserCard.module.css";
import { useEffect, useState } from "react";
import supabase from "../../config/supabaseClient";
import MenuCard from "../menu/MenuCard";

export default function RoomUser({ user_id }) {
    const [nickname, setNickname] = useState(user.nickname || "Unknown");
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase
                .from("user")
                .select("*")
                .eq("id", user_id)
                .single();

            if (error) {
                console.error("Error fetching user:", error);
                setError(error);
            } else {
                setNickname(data ? data.nickname : "Unknown");
            }
        };

        fetchUser();
    }, [user]);

    return (
        <div className={style.user}>
            <div className={style.user_nickname}>
                {nickname}
            </div>
            {typeof user.ready != 'undefined' && <div className={user.ready ? style.user_status_ready : style.user_status_not_ready}></div>}
            {typeof user.menus != 'undefined' && <div className={style.user_menus}>
                {user.menus && user.menus.map((menu, index) => (
                    <MenuCard key={`${user.id}-${index}`} menu_id={menu.id} quantity={menu.quantity} />
                ))}
            </div>}
        </div>
    );
}