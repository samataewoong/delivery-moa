import { useNavigate } from "react-router-dom";
import supabase from "../../config/supabaseClient";
import { useState, useEffect } from "react";

export default function RoomJoin({ room_id, user_id }) {
    const [room, setRoom] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUser(){
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                console.error("Error fetching user:", error);
                alert('유저 정보를 가져오는데 실패하였습니다. 로그인 후 사용 해 주세요.');
                navigate("/login");
            }
        }
        async function fetchRoom() {
            const { data: roomData, error: roomError } = await supabase
                .from("room")
                .select("*")
                .eq("id", room_id)
                .single();
            if (roomError) {
                console.error("Error fetching room:", roomError);
                setError(roomError);
                return;
            }
            if (!roomData) {
                console.error("Room not found");
                setError(new Error("Room not found"));
                return;
            }
            
            setRoom(roomData);
            const { data:roomJoinData, error:roomJoinError } = await supabase
                .from("room_join")
                .select("*")
                .eq("room_id", room_id);
            if(roomJoinData.length >= roomData.max_people){
                alert("이미 방이 가득 찼습니다.");
                navigate(-1);
            } else {
                const { data: roomJoinUserRow, error: roomJoinUserError} = await supabase
                    .from("room_join")
                    .select("*")
                    .eq("room_id", room_id)
                    .eq("user_id", user_id)
                if (roomJoinUserRow.length > 0) {
                    console.error("이미 방에 참여한 유저입니다.");
                    return;
                } else {
                    const { data, error } = await supabase
                        .from("room_join")
                        .insert({
                            room_id,
                            user_id
                        });
                    if (error) {
                        console.error("Error joining room:", error);
                        setError(error);
                    }
                }
            }
        }
        fetchUser();
        fetchRoom();
    }, [room_id]);
    return (
        <>
        </>
    );
}