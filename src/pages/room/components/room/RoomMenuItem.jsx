import style from "./RoomMenuItem.module.css";
import thousands from 'thousands';
import { useEffect, useState } from "react";

export default function RoomMenuItem({
    menu,
    setMenus
}) {
    const menuQuantityAddButton = 'https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/menu_quantity_add_button.png';
    const menuQuantitySubButton = 'https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/menu_quantity_sub_button.png';
    const menuQuantitySubButtonDisabled = 'https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/menu_quantity_sub_button_disabled.png';
    const [quantity, setQuantity] = useState(menu.quantity);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div key={menu.id} className={style.menu_item}>
            <div className={style.menu_quantity_box}>
                {setMenus ? (
                    (menu.quantity == 0 ? (
                        <img src={menuQuantitySubButtonDisabled} className={style.menu_quantity_sub} />
                    ) :(
                        <img src={menuQuantitySubButton} className={style.menu_quantity_sub} onClick={() => {
                            setMenus((prevMenus) => (
                                prevMenus.map((m) => (
                                    m.id === menu.id && m.quantity > 0? {
                                    ...m,
                                        quantity: m.quantity - 1
                                    } : m
                                ))
                            ));
                        }}/>
                    )
                )) : (
                    <div className={style.menu_quantity_sub}></div>
                )}
                <div className={style.menu_quantity}>{menu.quantity}</div>
                {setMenus? (
                    <img src={menuQuantityAddButton} className={style.menu_quantity_add} onClick={() => {
                        setMenus((prevMenus) => (
                            prevMenus.map((m) => (
                                m.id === menu.id ? { ...m, quantity: m.quantity + 1 } : m
                            ))
                        ));
                    }}/>
                ) : (
                    <div className={style.menu_quantity_add}></div>
                )}
            </div>
            <div 
                className={style.menu_name} 
                onMouseEnter={() => setIsHovered(true)} 
                onMouseLeave={() => setIsHovered(false)}
            >
                {menu.menu_name}
            </div>
            {isHovered && <div className={style.tooltip}>{menu.menu_name}</div>}
            {(!isHovered) && <div className={style.menu_price}>{thousands(`${menu.menu_price}`)}</div>}
        </div>
    );
}