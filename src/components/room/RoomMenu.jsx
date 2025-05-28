import style from "./RoomMenu.module.css";
import { useEffect, useState } from "react";
import supabase from "../../config/supabaseClient";
import RoomMenuItem from "./RoomMenuItem";
import thousands from 'thousands';
import DateToString from "../../utils/DateToString";

export default function RoomMenu({ room_id }) {
    const [menus, setMenus] = useState([]);
    const [error, setError] = useState(null);
    const [room, setRoom] = useState(null);
    const [store, setStore] = useState(null);
    const [order, setOrder] = useState(null);
    const [menuIcon, setMenuIcon] = useState(null);

    useEffect(() => {
        async function fetchAll() {
            const { data: menuIconData, error: menuIconError } = await supabase
                .storage
                .from("imgfile")
                .getPublicUrl("main_img/cart.png");
            if (menuIconError) {
                console.error("Error fetching menu icon:", menuIconError);
                setError(menuIconError);
            } else {
                setMenuIcon(menuIconData.publicUrl);
            }
            const { data: roomData, error: roomError } = await supabase
                .from("room")
                .select("*")
                .eq("id", room_id)
                .single();
            if (error) {
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
            const { data: storeData, error: storeError } = await supabase
                .from("store")
                .select("*")
                .eq("id", roomData.store_id)
                .single();
            if (storeError) {
                console.error("Error fetching store:", storeError);
                setError(storeError);
                return;
            }
            setStore(storeData);
            const { data: menusData, error: menuError } = await supabase
                .from("menu")
                .select("*")
                .eq("store_id", roomData.store_id)
            if (menuError) {
                console.error("Error fetching menus:", menuError);
                setError(menuError);
                return;
            }
            setMenus(menusData.map((menu) => ({ ...menu, quantity: 0 })));
        }
        fetchAll();
    }, [room_id]);

    const handleOrder = async () => {
        if (!store || !menus.length) return;


        const room_order = menus.filter(menu => menu.quantity > 0).map(menu => ({
            menu_id: menu.id,
            quantity: menu.quantity,
            price: menu.menu_price
        }));
        if (room_order.length === 0) {
            alert("주문할 메뉴가 없습니다.");
            return;
        }
        const store_id = store.id;
        const user_id = (await supabase.auth.getUser())?.data?.user?.id || '';
        const total_price = room_order.reduce((total, item) => total + (item.price * item.quantity), 0);
        const created_at = DateToString(Date.now());
        const { data,error } = await supabase
            .from("order")
            .insert({
                store_id,
                room_id,
                user_id,
                room_order,
                total_price,
                created_at
            });

        if (error) {
            console.error("Error placing order:", error);
            alert("주문에 실패했습니다. 다시 시도해주세요.");
        } else {
            alert("주문이 완료되었습니다.");
            setMenus(menus.map(menu => ({ ...menu, quantity: 0 })));
        }
        const { data: orderData, error: orderError } = await supabase
            .from("order")
            .select("*")
            .eq("room_id", room_id)
            .eq("user_id", user_id)
            .order("created_at", { ascending: false })
            .single();
        if (orderError) {
            console.error("Error fetching order:", orderError);
            setError(orderError);
            return;
        }
        setOrder(orderData);
    }

    return (
        <div className={style.room_menu_box}>
            <div className={style.room_menu_header}>
                <img src={menuIcon} alt="메뉴 아이콘" className={style.room_menu_icon} />
                <div className={style.room_menu_title}>
                    메뉴 선택
                </div>
            </div>
            <div className={style.room_menus}>
                {menus && menus.map((menu) => (
                    <RoomMenuItem
                        key={menu.id}
                        menu={menu}
                        setMenus={setMenus}
                    />
                ))}
            </div>
            {menus.length && <div className={style.total_price_box}>
                <div className={style.total_price_value}>
                    {thousands(menus.reduce((total, menu) => (total + (menu.menu_price * menu.quantity)), 0))} 원
                </div>
                <div className={style.total_price_title}>
                    총 금액
                </div>
            </div>}
            {store && menus && <div className={style.room_menu_button_box}>
                {order ? (
                    <button className={style.room_menu_order_button_disabled} disabled>
                        준비 완료
                    </button>
                ) : (menus.reduce((total, menu) => (total + menu.quantity * menu.menu_price), 0) >= store.min_price ? (
                    <button className={style.room_menu_order_button} onClick={handleOrder}>
                        주문하기
                    </button>
                ) : (
                    <button className={style.room_menu_order_button_disabled} disabled>
                        {thousands(store.min_price)} 원 이상 주문 가능
                    </button>
                ))}
            </div>}
        </div>
    );
}
