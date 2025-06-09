import styles from "./SearchPage.module.css";
import { useState, useEffect } from "react";
import { Link, matchPath } from "react-router-dom";
import supabase from "../config/supabaseClient";
import { useLocation } from "react-router-dom";

export default function SearchPage() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const keyword = params.get("keyword");

    useEffect(() => {
        const fetchResults = async () => {
            const storeDate = await supabase
            .from("store").select("*")
            .ilike("store_name", `%${keyword}%`);

            const menuData = await supabase.from("menu").select(`*, store_id( * )`).ilike("menu_name" , `%${keyword}%`);

            const storeIds = storeDate?.map((s) => s.id) || [];

            const roomData = await supabase.from("room").select("*").ilike("room_name", `%${keyword}%`);

            const roomstoreData = await supabase.from("room").select(`*, store_id( * )`).eq("store_id", storeIds);

            const roomResult = [
                ...(roomData || []),
                ...(roomstoreData || []),
            ].filter(
                (room, index, self) => self.findIndex((r) => r.id === room.id) === index
            );
        };
        fetchResults();
    }, [keyword]);
    return(
        <main className={styles["main_box"]}>
            <div className={styles["main_container"]}>
                <h1>"{keyword}"에 대한 검색결과</h1>
                <hr/>
                <div className={styles["search_hitory_box"]}>
                    <div>
                        <ul className={styles["search_category"]}>
                            <li>전체</li>
                            <li>배달</li>
                            <li>메뉴</li>
                            <li>공구방</li>
                        </ul>
                    </div>
                    <div className={styles["search_keyword"]}>배달</div>
                    <hr/>
                    <div className={styles["search_box"]}>

                    </div>
                    <div className={styles["search_keyword"]}>공구방</div>
                    <hr/>
                </div>
            </div>
        </main>
    );
}