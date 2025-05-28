import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MyPage.module.css";

export default function EditUser() {
    // db update 구현해야함
    const navigate = useNavigate();

    const [nickname, setNickname] = useState("공구곰");
    const [userAddress, setUserAddress] = useState("서울특별시 종로구 종각 종각로30 -120");
    const [passWord, setPassWord] = useState("123456");
    const nickNameChange = (e) => {
        setNickname(e.target.value);
    }
    const addressChange = (e) => {
        setUserAddress(e.target.value);
    }
    const passWordChange = (e) => {
        setPassWord(e.target.value);
    }
    const [showPassword, setShowPassword] = useState(false);

    const eyeClick = () => setShowPassword(prev => !prev);

    const editComplete = () => {
        alert("수정이 완료되었습니다.");
        navigate("../userinfo");
    }    
    return (
        <div className={styles.userInfo}>
            <div className={styles.infoRow}>
                <div className={styles.label}>닉네임:</div>
                <input
                    type="text"
                    className={styles.editInput}
                    id="editNickname"
                    onChange={nickNameChange}
                    value={nickname}
                />
            </div>
            <div className={styles.infoRow}>
                <div className={styles.label}>이메일:</div>
                <input
                    type="text"
                    className={styles.editInput}
                    value="gonggu@example.com"
                    readOnly
                />
            </div>
            <div className={styles.infoRow}>
                <div className={styles.label}>비밀번호:</div>
                <div className={styles.passwordEye}>
                    <input
                        type="text"
                        id="editPassWord"
                        onChange={passWordChange}
                        value={showPassword ? passWord : "*".repeat(passWord.length)}
                    />
                    <ion-icon
                        id="pwEyes"
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        onClick={eyeClick}
                    ></ion-icon>
                </div>
            </div>
            <div className={styles.infoRow}>
                <div className={styles.label}>주소:</div>
                <input
                    type="text"
                    className={styles.editInput}
                    id="editAddress"
                    onChange={addressChange}
                    value={userAddress}
                />
            </div>
            <div className={styles.infoRow}>
                <div className={styles.label}>가입일:</div>
                <input
                    type="text"
                    className={styles.editInput}
                    value="2024-03-12"
                    readOnly
                />
            </div>
            <button className={styles.editButton} onClick={editComplete}>수정완료</button>
        </div>
    )
}
