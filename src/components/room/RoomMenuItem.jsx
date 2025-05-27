import style from "./RoomMenuItem.module.css";
import { useEffect, useState } from "react";
import thousands from 'thousands';

export default function RoomMenuItem({
    menu,
    setMenus
}) {

    return (
        <div key={menu.id} className={style.menu_item}>
            <div className={style.menu_quantity_box}>
                <div className={menu.quantity < 1 ? style.menu_quantity_disabled : style.menu_quantity_sub} onClick={() => {
                    setMenus((prevMenus) => (
                        prevMenus.map((m) => (
                            m.id === menu.id ? { ...m, quantity: m.quantity < 1 ? m.quantity : m.quantity - 1 } : m
                        ))
                    ));
                }}>
                    -
                </div>
                <div className={style.menu_quantity}>{menu.quantity}</div>
                <div className={style.menu_quantity_add} onClick={() => {
                    setMenus((prevMenus) => (
                        prevMenus.map((m) => (
                            m.id === menu.id ? { ...m, quantity: m.quantity + 1 } : m
                        ))
                    ));
                }}>
                    +
                </div>
            </div>
            <div className={style.menu_name}>{menu.menu_name}</div>
            <div className={style.menu_price}>{thousands(`${menu.menu_price}`)}</div>
        </div>
    );
}