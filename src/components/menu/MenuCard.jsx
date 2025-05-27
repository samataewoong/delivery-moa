import { useEffect, useState } from "react";
import stlye from "./MenuCard.module.css";
export default function MenuCard({
    menu_id,
    quantity,
}) {
    const [menu, setMenu] = useState({});
    const [menu_image, setMenuImage] = useState("");
    useEffect(() => {
        // Fetch menu data when component mounts
        const fetchMenu = async () => {
            const { data, error } = await supabase
                .from("menu")
                .select("*")
                .eq("id", menu_id)
                .single();

            if (error) {
                console.error("Error fetching menu:", error);
            } else {
                setMenu(data);
                const { data: image, error } = supabase
                    .from('image')
                    .select('*')
                    .eq("id",data.img_id)
                    .single();
                if (error) {
                    console.error("Error fetching menu image:", error);
                }
                if (image) {
                    const { data: imageData } = await supabase
                        .storage
                        .from(image.bucket)
                        .getPublicUrl(`${image.folder}/${image.filename}`);
                    setMenuImage(imageData.getPublicUrl);
                }
            }
        };

        fetchMenu();
    }, [menu_id]);
    return (
        <div style={{ padding: "10px" }}>
            <div className={style.menu_card}>
                <img className={style.menu_image} src={menu_image} alt={menu.menu_name} />
                <div className={style.menu_name}>{menu.menu_name}</div>
                <div className={style.menu_price}>{menu.menu_price}원</div>
                {typeof quantity != 'undefined' && <div className={style.menu_quantity}>
                    {quantity}개
                </div>}
            </div>
        </div>
    );
}
