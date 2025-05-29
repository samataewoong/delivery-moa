import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MyPage.module.css";
import supabase from "../../config/supabaseClient";

export default function EditUser() {
    // db update 구현해야함
    const navigate = useNavigate();

    const [nickname, setNickname] = useState("");

    const [passWord, setPassWord] = useState("");
    const [email, setEmail] = useState("");
    const [createdAt, setCreatedAt] = useState("");
    const [session, setSession] = useState(null);


    // 현재 로그인된 유저 정보 갖고오기
    useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);

        if (session?.user) {
            const user = session.user;

            // 이메일, 가입일 설정
            setEmail(user.email);
            setCreatedAt(user.created_at);

            // 추가 유저 정보 가져오기 (user 테이블)
            const { data, error } = await supabase
                .from("user")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error) {
                console.error("추가 유저 정보 불러오기 실패:", error);
            } else {
                setNickname(data.nickname);
                setPassWord(data.password);
            }
        } else {
            setEmail("");
            setNickname("");
            setPassWord("");
            setCreatedAt("");
        }
    });

    return () => subscription.unsubscribe(); // 언마운트 시 정리
}, []);


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
                    value={email}
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
                        value={showPassword ? passWord : "*".repeat(passWord)}
                    />
                    <ion-icon
                        id="pwEyes"
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        onClick={eyeClick}
                    ></ion-icon>
                </div>
            </div>
            <div className={styles.infoRow}>
                <div className={styles.label}>가입일:</div>
                <input
                    type="text"
                    className={styles.editInput}
                    value={createdAt}
                    readOnly
                />
            </div>
            <button className={styles.editButton} onClick={editComplete}>수정완료</button>
        </div>
    )
}
