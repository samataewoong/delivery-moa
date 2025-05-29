import style from "./RoomMenuItem.module.css";
import thousands from 'thousands';

export default function RoomMenuItem({
    menu,
    setMenus
}) {

    return (
        <div key={menu.id} className={style.menu_item}>
            <div className={style.menu_quantity_box}>
                <div className={setMenus ? (menu.quantity < 1 ? [style.menu_quantity_disabled,style.menu_quantity_sub].join(' ') : style.menu_quantity_sub) : ([style.menu_quantity_transparent,style.menu_quantity_sub].join(' '))} onClick={() => {
                    setMenus((prevMenus) => (
                        prevMenus.map((m) => (
                            m.id === menu.id ? { ...m, quantity: m.quantity < 1 ? m.quantity : m.quantity - 1 } : m
                        ))
                    ));
                }}>
                    -
                </div>
                <div className={style.menu_quantity}>{menu.quantity}</div>
                <div className={setMenus ? style.menu_quantity_add : [style.menu_quantity_add, style.menu_quantity_transparent].join(' ')} onClick={() => {
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