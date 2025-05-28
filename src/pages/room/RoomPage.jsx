import supabase from "../../config/supabaseClient";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import style from "./RoomPage.module.css";
import RoomJoin from "../../components/room/RoomJoin";
import RoomHeader from "../../components/room/RoomHeader";
import RoomBody from "../../components/room/RoomBody";
import Header from "../../components/Header";

export default function RoomPage() {
    const { room_id } = useParams();
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        }}>
            <Header />
            <RoomJoin room_id={room_id} />
            <RoomHeader room_id={room_id} />
            <RoomBody room_id={room_id} />
        </div>
    );
}
