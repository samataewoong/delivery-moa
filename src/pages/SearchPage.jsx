import styles from "./SearchPage.module.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import supabase from "../config/supabaseClient";
import { useLocation } from "react-router-dom";

export default function SearchPage() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const keyword = params.get("keyword");
    const [storeData, setStoreData] = useState([]);
    const [menuData, setMenuData] = useState([]);
    const [roomData, setRoomData] = useState([]);
    const [category, setCategory] = useState("전체");

    const storeImgUrl = "https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/store/store_"
    const menuImgUrl = "https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/"
    // const menuImgUrl = "https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/store_2/menu_12.jpg"

    useEffect(() => {
        const fetchResults = async () => {
            const [{ data: storeResult }, { data: menuResult }, { data: roomData }] = await Promise.all([
                supabase
                .from("store").select("*")
                .ilike("store_name", `%${keyword}%`),
                supabase.from("menu").select(`*, store_id( * ), img_id( * )`).ilike("menu_name", `%${keyword}%`),
                supabase.from("room").select("*").ilike("room_name", `%${keyword}%`)
            ]);

            const storeIds = storeResult?.map((s) => s.id) || [];

            const { data: roomstoreData } = await supabase.from("room").select("*").eq("store_id", storeIds);

            const roomResult = [
                ...(roomData || []),
                ...(roomstoreData || []),
            ].filter(
                (room, index, self) => self.findIndex((r) => r.id === room.id) === index
            );
            setStoreData(storeResult);
            setMenuData(menuResult);
            setRoomData(roomResult);
        };
        fetchResults();
    }, [keyword]);
    return (
        <main className={styles["main_box"]}>
            <div className={styles["main_container"]}>
                <h1>"{keyword}"에 대한 검색결과</h1>
                <hr />
                <div className={styles["search_hitory_box"]}>
                    <div>
                        <ul className={styles["search_category"]}>
                            {["전체", "가게", "메뉴", "공구방"].map((tab) => (
                                <li key={tab} 
                                className={category === tab ? styles["active_tab"] : ""}
                                onClick={() => setCategory(tab)}>{tab}</li>
                            ))}
                        </ul>
                    </div>
                    {(category === "전체" || category === "가게") && (
                        <>
                            <div className={styles["search_keyword"]}>가게</div>
                            <hr />
                            {storeData.length > 0 ? (
                                (category === "전체" ? storeData.slice(0, 4) : storeData).map((item) => (
                                    <Link key={item.id} to={`/store/${item.id}`}>
                                    <div className={styles["search_result"]}>
                                        <img className={styles["search_store_img"]} src={`${storeImgUrl}${item.id}.jpg`} alt={`${item.store_name}`}></img>
                                        <div className={styles["search_store_detail"]}>
                                            <div>
                                                <div className={styles["search_store_name"]}>{item.store_name}</div>
                                                <ul className={styles["search_ul"]}>
                                                    <li>
                                                        <span className={styles["star"]}>★</span>
                                                        <span className={styles["score"]}>4.9(1689)</span>
                                                    </li>
                                                    <li>210m</li>
                                                    <li>25~40분</li>
                                                </ul>
                                                <div className={styles["search_delivery"]}>배달비 무료</div>
                                            </div>
                                        </div>
                                    </div>
                                    </Link>
                                ))
                            ) : (
                                <div className={styles["search_noResult"]}>검색 결과가 없습니다.</div>
                            )}
                            {category === "전체" && storeData.length > 4 && (
                                <div className={styles["more"]}>
                                    <button onClick={() => {setCategory("가게");
                                    window.scrollTo({ top: 0 });}}>더보기</button>
                                </div>
                            )}
                        </>
                    )}
                    {(category === "전체" || category === "메뉴") && (
                        <>
                            <div className={styles["search_keyword"]}>메뉴</div>
                            <hr />
                            {menuData.length > 0 ? (
                                (category === "전체" ? menuData.slice(0, 4) : menuData).map((item) => (
                                    <Link key={item.id} to={`/store/${item.store_id?.id}`}>
                                    <div className={styles["search_result"]}>
                                        <img className={styles["search_store_img"]} src={`${menuImgUrl}${item.img_id?.folder}/${item.img_id?.filename}`} alt={`${item.menu_name}`}></img>
                                        <div className={styles["search_store_detail"]}>
                                            <div>
                                                <div className={styles["search_store_name"]}>{item.menu_name}</div>
                                                <div className={styles["search_menu_name"]}>{item.store_id?.store_name}</div>
                                                <div className={styles["search_menu_price"]}>{item.menu_price}원</div>
                                            </div>
                                        </div>
                                    </div>
                                    </Link>
                                ))
                            ) : (
                                <div className={styles["search_noResult"]}>검색 결과가 없습니다.</div>
                            )}
                            {category === "전체" && menuData.length > 4 && (
                                <div className={styles["more"]}>
                                    <button onClick={() => {setCategory("메뉴");
                                    window.scrollTo({ top: 0 });}}>더보기</button>
                                </div>
                            )}
                            
                        </>
                    )}
                    {(category === "전체" || category === "공구방") && (
                        <>
                            <div className={styles["search_keyword"]}>공구방</div>
                            <hr />
                            {roomData.filter(room => room.status == "모집중").length > 0 ? (
                                (category === "전체" ? roomData.filter(room => room.status == "모집중").slice(0, 4) : roomData).filter(room => room.status == "모집중").map((item) => (
                                    <Link key={item.id} to={`/room/${item.id}`}>
                                    <div className={styles["search_result"]}>
                                        <img className={styles["search_store_img"]}
                                            src={`${storeImgUrl}${item.store_id}.jpg`} alt={`${item.store_id}`}></img>
                                        <div className={styles["search_store_detail"]}>
                                            <div>
                                                <div className={styles["search_store_name"]}>{item.room_name}</div>
                                                <div className={styles["search_menu_name"]}>{item.room_address}</div>
                                                <div className={styles["search_status"]}>{item.status}</div>
                                            </div>
                                        </div>
                                    </div>
                                    </Link>
                                ))
                            ) : (
                                <div className={styles["search_noResult"]}>검색 결과가 없습니다.</div>
                            )}
                            {category === "전체" && roomData.filter(room => room.status !== "삭제" && room.status !== "종료" ).length > 4 && (
                                <div className={styles["more"]}>
                                    <button onClick={() => {setCategory("공구방");
                                    window.scrollTo({ top: 0 });}}>더보기</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}