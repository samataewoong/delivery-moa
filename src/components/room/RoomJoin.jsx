import supabase from "../../config/supabaseClient";
import { useState, useEffect } from "react";

export default function RoomJoin({ room_id, user_id }) {
    const [room, setRoom] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchRoom() {
            const { data, error } = await supabase
                .from("room")
                .select("*")
                .eq("id", room_id)
                .single();

            if (error) {
                console.error("Error fetching room:", error);
                setError(error);
            } else {
                if (data.users.length < data.max_people){
                    await supabase
                        .from("room")
                        .update({ 
                            /* Add the user to the room's users array */
                            users: (data.users ? [...data.users, { id: user_id, status: 'joined'}] : [{ id: user_id, status: 'joined'}]).filter((user, index, self) =>
                            index === self.findIndex((u) => u.id === user.id))
                        })
                        .eq('id', room_id);
                }
            }
        }

        fetchRoom();
    }, [room_id]);
    return (
        <>
        </>
    );
}