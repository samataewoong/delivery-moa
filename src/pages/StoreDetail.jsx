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
            const { data } = await supabase.from("store").select("*").eq("id",store_id);
            setStore(data);
        }
        fetchStore();
    }, [store_id]);

    if(!store) return <div>Loading...</div>

    const storeUrl="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/store/store_"
    return (
        <>

        <main>
            <div><img src={`${storeUrl}${store.id}.jpg`}/></div>
            <div>{store.store_name}</div>
        </main>
        </>
    );
}