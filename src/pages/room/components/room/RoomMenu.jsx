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

export default function RoomMenu({
    room,
    store,
    roomMenus,
    setRoomMenus,
    me,
}) {
    const navigate = useNavigate();
    const menuIcon = 'https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/cart.png';
    const [order, setOrder] = useState(null);

    useEffect(() => {
        async function fetchOrder() {
            if (!room || !me) return;
            const orderData = await selectOrder({ room_id: room.id, user_id: me.id });
            if (orderData.length > 0) {
                setOrder(orderData[0]);
            } else {
                setOrder(null);
            }
        }
        const orderSubscribe = supabase
            .realtime
            .channel(`realtime:order_ready_check_on_room_menu_in_room_${room?.id}`)
            .on(
                "postgres_changes",
                { event:'*', schema: 'public', table: 'order' },
                (payload) => {
                if (payload.op === "INSERT") {
                    if (payload.new.room_id === Number(room?.id) && payload.new.user_id === me?.id) {
                        setOrder(payload.new);
                    }
                }
            })
            .subscribe();
        fetchOrder();
        return () => {
            orderSubscribe.unsubscribe();
        };
    }, [room?.id, me?.id]);

    const handleOrder = async () => {
        if (!room || !me) return;
        if (!store || !roomMenus.length) return;


        const room_order = roomMenus.filter(menu => menu.quantity > 0);
        if (room_order.length === 0) {
            alert("주문할 메뉴가 없습니다.");
            return;
        }
        if(!confirm("주문하시겠습니까?\n주문시 주문 취소 및 변경이 불가능합니다.")) return;
        const store_id = room?.store_id;
        const user_id = me?.id;
        const total_price = room_order.reduce((total, item) => total + (item.menu_price * item.quantity), 0);
        try {
            await insertOrder({
                store_id,
                room_id: room?.id,
                user_id: me?.id,
                room_order,
                total_price
            });
            await updateUser({
                user_id: me?.id,
                cash: me?.cash - total_price,
            });
            const orderData = await selectOrder({ room_id: room?.id, user_id: me?.id });
            setOrder(orderData[0]);
            await updateRoomJoin({
                room_id: room?.id,
                user_id: me?.id,
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
                {roomMenus && !order ? (
                    roomMenus.map((menu) => (
                        <RoomMenuItem
                            key={menu.id}
                            menu={menu}
                            setMenus={setRoomMenus}
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
            {roomMenus.length == 0 ? <></> : <div className={style.total_price_box}>
                <div className={style.total_price_value}>
                    {thousands(roomMenus.reduce((total, menu) => (total + (menu.menu_price * menu.quantity)), 0))} 원
                </div>
                <div className={style.total_price_title}>
                    총 금액
                </div>
            </div>}
            {me && roomMenus && <div className={style.room_menu_button_box}>
                {order ? (
                    <button className={style.room_menu_order_button_disabled} disabled>
                        준비 완료
                    </button>
                ) : (roomMenus.reduce((total, menu) => (total + menu.quantity * menu.menu_price), 0) >= store?.min_price ? (
                    (me?.cash >= roomMenus.reduce((total, menu) => (total + menu.quantity * menu.menu_price), 0)) ? (
                        <button className={style.room_menu_order_button} onClick={handleOrder}>
                            주문하기
                        </button>
                    ) : (
                        <button className={style.room_menu_order_button} onClick={() => {
                            window.open("/delivery-moa/cashcharge", "_blank", "width=500,height=700");
                        }} >
                            잔액이 부족합니다. 충전 해 주세요.
                        </button>
                    )
                ) : (
                    <button className={style.room_menu_order_button_disabled} disabled>
                        {thousands(store?.min_price)} 원 이상 주문 가능
                    </button>
                ))}
            </div>}
        </div>
    );
}
