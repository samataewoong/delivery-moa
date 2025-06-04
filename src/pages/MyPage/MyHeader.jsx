import { useLocation } from "react-router-dom";
import styles from "./MyPage.module.css";

export default function MyHeader({ menuList }) {
    const location = useLocation();
    const nowPage = location.pathname.split("/").pop();

    // 기본 메뉴 탐색
    let selectedMenu = menuList.find(menu => menu.path === nowPage)?.name;

    // 예외 처리: edituser → "회원정보 수정"
    if (!selectedMenu && nowPage === "edituser") {
        selectedMenu = "회원정보 수정";
    }

    return (
        <div className={styles.myHeader}>
            {selectedMenu}
        </div>
    );
}
