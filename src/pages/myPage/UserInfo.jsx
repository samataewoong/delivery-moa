import { useNavigate } from "react-router-dom";
import styles from "./MyPage.module.css";

export default function UserInfo({ selectedMenu }) {
  const navigate = useNavigate();
  const quitButton = () => {
    alert("진짜 탈퇴??");
  };
  const editButton = () => {
    navigate("../edituser");
  };
  return (
    <div className={styles.userInfo}>
      <div className={styles.infoRow}>
        <div className={styles.label}>닉네임:</div>
        <div className={styles.value}>공구곰</div>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.label}>이메일:</div>
        <div className={styles.value}>gonggu@example.com</div>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.label}>주소:</div>
        <div className={styles.value}>서울특별시 종로구 종각 종각로30 -120</div>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.label}>가입일:</div>
        <div className={styles.value}>2024-03-12</div>
      </div>
      <div className={styles.myButtonContainer}>
        <button onClick={editButton}>수정하기</button>
        <button onClick={quitButton}>회원탈퇴</button>
      </div>
    </div>
  );
}
