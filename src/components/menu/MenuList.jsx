import supabase from "../../config/supabaseClient";
import MenuCard from "./MenuCard";

export default function MenuList({
    store_id,
}) {
    const { data: menus, error } = supabase
        .from("menu")
        .select("*")
        .eq("store_id", store_id);

    return (
        <div>
            {menus.map((menu) => (
                <MenuCard
                    key={`${menu.store_id}-${menu.id}`}
                    menu_id={menu.id}
                />
            ))}
        </div>
    );
}
