import styles from "./StoreDetail.module.css";
import Header from "../components/Header";
import { useState, useEffect, useRef } from "react";
import supabase from "../config/supabaseClient";
import { Link } from "react-router-dom";
import { useParams } from 'react-router-dom';

export default function StoreDetail(){
    const { store_id } = useParams();
    const[store, setStore] = useState(null);

    useEffect(() => {
        async function fetchStore() {
            const { data } = await supabase.from("store").select("*").eq("id",store_id).single();
            setStore(data);
        }
        fetchStore();
    }, [store_id]);

    if(!store) return <div>Loading...</div>

    const storeUrl="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/store/store_"
    return (
        <>
        <Header/>
        <main className={styles["main_box"]}>
            <div className={styles["main_container"]}>
                <div><img className={styles["square_img"]} src={`${storeUrl}${store.id}.jpg`}/></div>
                <div className={styles["detail_box"]}>
                    <img src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/Vector.png"/>
                    <div className={styles["detail_text"]}>다같이 주문하면 무료배달</div>
                    <div className={styles["store_name"]}>{store.store_name}</div>
                    <div style={{display:"flex", alignItems: "center", gap: "4px" }}>
                        <div className={styles["star"]}>★</div>
                        <div className={styles["score"]}>4.9(1689)</div>
                    </div>
                    <div className={styles["address_box"]}></div>
                </div>
            </div>
        </main>
        </>
    );
}