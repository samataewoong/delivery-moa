import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MyPage.module.css";
import supabase from "../../config/supabaseClient";
import DateToString from "../../utils/DateToString";

export default function EditUser() {
    const navigate = useNavigate();

    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [createdAt, setCreatedAt] = useState("");
    const [session, setSession] = useState(null);

    // 현재 로그인된 유저 정보 불러오기
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);

            if (session?.user) {
                const user = session.user;

                // 이메일과 가입일 저장
                setEmail(user.email ?? "");
                setCreatedAt(user.created_at ?? "");

                // 닉네임 가져오기 (user 테이블)
                const { data, error } = await supabase
                    .from("user")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (error) {
                    console.error("추가 유저 정보 불러오기 실패:", error);
                } else {
                    setNickname(data?.nickname ?? "");
                }
            } else {
                setEmail("");
                setNickname("");
                setCreatedAt("");
            }
        });

        return () => subscription.unsubscribe(); // 언마운트 시 정리
    }, []);

    const nickNameChange = (e) => {
        setNickname(e.target.value ?? "");
    };

    // 비밀번호 재설정 링크 이메일 전송
    const sendResetEmail = async () => {
        const email = session?.user?.email;
        if (!email) {
            alert("이메일 정보가 없습니다.");
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "http://localhost:5173/resetpw", // 배포 시 도메인으로 바꿔줘야 함
        });

        if (error) {
            alert("이메일 전송 실패: " + error.message);
        } else {
            alert("📧 비밀번호 재설정 링크가 이메일로 전송되었습니다.");
        }
    };

    // 닉네임 수정 저장
    const editComplete = async () => {
        if (!session || !session.user) {
            alert("로그인 정보가 없습니다");
            return;
        }

        const userId = session.user.id;

        const { error: nicknameError } = await supabase
            .from("user")
            .update({
                nickname: nickname,
            })
            .eq("id", userId);

        if (nicknameError) {
            console.log("닉네임 업데이트 실패", nicknameError);
            return;
        }

        alert("수정이 완료되었습니다!");
        navigate("../userinfo");
    };

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
                        style={{ border: "none", outline: "none" }}
                        type={showPassword ? "text" : "password"}
                        id="editPassWord"
                        onChange={passWordChange}
                        value={password}
                        placeholder="6자 이상 입력하세요"
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
                    readOnly
                    value={DateToString(createdAt)}
                />
            </div>

            <button className={styles.editButton} onClick={editComplete}>
                수정완료
            </button>
        </div>
    );
}
