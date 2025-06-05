import styles from "./SearchPage.module.css";
import { useState, useEffect } from "react";
import { Link, matchPath } from "react-router-dom";
import supabase from "../config/supabaseClient";
import { useLocation } from "react-router-dom";

export default function SearchPage() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const keyword = params.get("keyword");

    return(
        <div className={styles["main_box"]}>
            <div className={styles["main_container"]}>
                <h2>"{keyword}"에 대한 검색결과</h2>
                <hr/>
            </div>
        </div>
    );
}