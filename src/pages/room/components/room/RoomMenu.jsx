import style from "./RoomMenu.module.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../../config/supabaseClient";
import RoomMenuItem from "./RoomMenuItem";
import thousands from 'thousands';
import selectMenu from "../../../../functions/menu/SelectMenu";
import selectRoom from "../../../../functions/room/SelectRoom";
import selectOrder from "../../../../functions/order/SelectOrder";
import insertOrder from "../../../../functions/order/InsertOrder";
import getAuthUser from "../../../../functions/auth/GetAuthUser";
import selectStore from "../../../../functions/store/SelectStore";
import selectUser from "../../../../functions/user/SelectUser";
import updateRoomJoin from "../../../../functions/room_join/UpdateRoomJoin";
import updateUser from "../../../../functions/user/UpdateUser";

export default function RoomMenu({ room_id }) {
    const navigate = useNavigate();
    const [menus, setMenus] = useState([]);
    const [error, setError] = useState(null);
    const [store, setStore] = useState(null);
    const [order, setOrder] = useState(null);
    const [user, setUser] = useState(null);
    const menuIcon = 'https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/cart.png';

    useEffect(() => {
        const orderSubscribe = supabase
            .realtime
            .channel('realtime:order')
            .on("postgres_changes", (payload) => {
                if (payload.op === "INSERT") {
                    if (payload.new.room_id === room_id && payload.new.user_id === user_id) {
                        setOrder(payload.new);
                    }
                }
            });
        const userSubscribe = supabase
            .channel('realtime:user')
            .on("postgres_changes", (payload) => {
                if (payload.new.id === user_id) {
                    setUser(payload.new);
                }
            });
        async function fetchAll() {
            let user_id = null;
            try {
                const { id } = await getAuthUser();
                user_id = id;
            } catch (error) {
                alert("로그인 정보를 가져오는데 실패하였습니다. 다시 로그인 해 주세요.");
                navigate("/login");
                return;
            }

            if (!user_id) {
                alert("로그인 정보를 가져오는데 실패하였습니다. 다시 로그인 해 주세요.");
                navigate("/login");
                return;
            }
            try {
                const userData = await selectUser({ user_id });
                setUser(userData[0]);
            } catch (error) {
                console.error("Error fetching user:", error);
            }
            try {
                const roomData = await selectRoom({ room_id: Number(room_id) });
                if (roomData && roomData.length > 0) {
                    const storeData = await selectStore({ store_id: roomData[0].store_id });
                    setStore(storeData[0]);
                }
                if (roomData && roomData.length > 0) {
                    const menuData = await selectMenu({ store_id: roomData[0].store_id });
                    setMenus(menuData.map((menu) => ({ ...menu, quantity: 0 })));
                }
                if (user_id) {
                    const orderData = await selectOrder({ room_id, user_id });
                    if (orderData) setOrder(orderData[0]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error);
            }
        }
        fetchAll();
        return () => {
            orderSubscribe.unsubscribe()
        };
    }, [room_id]);

    const handleOrder = async () => {
        if (!store || !menus.length) return;


        const room_order = menus.filter(menu => menu.quantity > 0);
        if (room_order.length === 0) {
            alert("주문할 메뉴가 없습니다.");
            return;
        }
        if(!confirm("주문하시겠습니까?\n주문시 주문 취소 및 변경이 불가능합니다.")) return;
        const store_id = store.id;
        const { id: user_id } = await getAuthUser();
        const total_price = room_order.reduce((total, item) => total + (item.menu_price * item.quantity), 0);
        try {
            await insertOrder({
                store_id,
                room_id,
                user_id,
                room_order,
                total_price
            });
            await updateUser({
                user_id,
                cash: user.cash - total_price,
            });
            const orderData = await selectOrder({ room_id, user_id });
            setOrder(orderData[0]);
            await updateRoomJoin({
                room_id,
                user_id,
                status: "준비 완료"
            });
            navigate(`/ordercomplete/${orderData[0].order_id}`);
        } catch (error) {
            console.error("Error inserting order:", error);
            alert("주문에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }

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
                {menus && !order ? (
                    menus.map((menu) => (
                        <RoomMenuItem
                            key={menu.id}
                            menu={menu}
                            setMenus={setMenus}
                        />
                    ))
                ) : (
                    order && order.room_order.length > 0 && (
                        order.room_order.map((roomOrder) => (
                            <RoomMenuItem
                                key={roomOrder.id}
                                menu={roomOrder}
                            />
                        ))
                    )
                )}
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
                    (user?.cash >= menus.reduce((total, menu) => (total + menu.quantity * menu.menu_price), 0)) ? (
                        <button className={style.room_menu_order_button} onClick={handleOrder}>
                            주문하기
                        </button>
                    ) : (
                        <button className={style.room_menu_order_button_disabled} disabled>
                            잔액이 부족합니다
                        </button>
                    )
                ) : (
                    <button className={style.room_menu_order_button_disabled} disabled>
                        {thousands(store.min_price)} 원 이상 주문 가능
                    </button>
                ))}
            </div>}
        </div>
    );
}
