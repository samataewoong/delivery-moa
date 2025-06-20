import styles from "./StoreDetail.module.css";
import { useState, useEffect, useRef } from "react";
import supabase from "../config/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import thousands from "thousands";

export default function StoreDetail(){
    const navigate = useNavigate();
    const { store_id } = useParams();
    const[store, setStore] = useState(null);
    const mapRef = useRef(null);
    const[menu, setmenu] = useState([]);

    useEffect(() => {
        async function fetchStore() {
            const [{ data }, {data:menuData}] = await Promise.all([
                supabase.from("store").select("*").eq("id",store_id).single(),
                supabase.from("menu")
            .select("*, img_id(bucket, folder, filename)").eq("store_id",store_id)
            ]);
            setStore(data);
            setmenu(menuData);
        }
        fetchStore();
    }, [store_id]);
    

    const storeUrl="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/store/store_"
    const baseUrl="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/"


    const waitForKakaoMaps = () => {
        return new Promise((resolve, reject) => {
            if (
                window.kakao &&
                window.kakao.maps &&
                window.kakao.maps.Map &&
                window.kakao.maps.services &&
                window.kakao.maps.services.Geocoder
            ) {
                resolve();
            } else {
                reject(new Error('카카오 지도 API가 준비되지 않았습니다.'));
            }
        });
    };

    const showMap = async (addr) => {
        await waitForKakaoMaps();

        if (!mapRef.current) return;

        const geocoder = new window.kakao.maps.services.Geocoder();

        geocoder.addressSearch(addr, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
                const map = new window.kakao.maps.Map(mapRef.current, {
                    center: coords,
                    level: 3,
                });

                setTimeout(() => {
                    window.kakao.maps.event.trigger(map, "resize");
                }, 200);

                new window.kakao.maps.Marker({
                    map: map,
                    position: coords,
                });
            }
        });
    };

    useEffect(() => {
        if (store?.store_address) {
            showMap(store.store_address);
        }
    }, [store]);
    
    if(!store) return;

    return (
        <>
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
                    <div className={styles["address_box"]}>
                        <div className={styles["address_text"]}>
                            <div className={styles["address_flex"]}>
                                <div>가게배달</div>
                                <div>29~44분</div>
                            </div>
                            <div className={styles["address_flex"]}>
                                <div>최소주문</div>
                                <div>{thousands(store.min_price)}원</div>
                            </div>
                            <div className={styles["address_flex"]}>
                                <div>가게배달</div>
                                <div>{store.store_address}</div>
                            </div>
                            <div className={styles["address_flex"]}>
                                <div>가게번호</div>
                                <div>{store.tel}</div>
                            </div>
                        </div>
                        <div ref={mapRef} className={styles["address_map"]}></div>
                    </div>
                </div>
                <div className={styles["menu_box"]}>
                    <div className={styles["menu_btn"]}>
                        <button onClick={() => {
                            navigate(`/room/create/${store_id}`) 
                        }} className={styles["menu_make_btn"]}>방 만들기</button>
                        <button onClick={() => {
                            navigate(`/selectroom/${store_id}`) 
                        }} className={styles["menu_confirm_btn"]}>개설된 방 확인</button>
                    </div>
                    <hr className={styles["menu_hr"]} ></hr>
                    {menu.map((item) => (
                        <div key={item.id}>
                            <div className={styles["menu_detail_box"]}>
                            <div className={styles["menu_text"]}>
                                <div className={styles["menu_title"]}>{item.menu_name}</div>
                                <div>{thousands(item.menu_price)}원</div>
                            </div>
                            <img className={styles["menu_img"]} 
                            src={`${baseUrl}/${item.img_id.bucket}/${item.img_id.folder}/${item.img_id.filename}`} alt={item.menu_name}/>
                            </div>
                            <hr className={styles["menu_hr"]} ></hr>
                        </div>
                    ))}
                    
                </div>
            </div>
        </main>
        </>
    );
}