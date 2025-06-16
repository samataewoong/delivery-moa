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
            redirectTo: 'http://localhost:5173/delivery-moa/resetpw',
        });

        if (error) {
            setMessage('❌ 이메일 전송 실패: ' + error.message);
        } else {
            setMessage('📧 이메일을 확인해 주세요! 비밀번호 재설정 링크가 전송되었어요.');
        }
    };

    // 닉네임 수정 저장
    const editComplete = async () => {
        if (!session || !session.user) {
            alert("로그인 정보가 없습니다");
            return;
        }

        const userId = session.user.id;

        // 닉네임 중복 확인(본인 제외)
        const {data: existingUser, error} = await supabase
        .from("user")
        .select("id")
        .eq("nickname", nickname)
        .neq("id",userId)
        .single();

        if(existingUser){
            alert("이미 사용 중인 닉네임입니다");
            return;
        }

        // 중복 아니면 닉네임 수정
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
                <button className={styles.editnameButton} onClick={editComplete}>
                    수정
                </button>
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
                <div className={styles.label}>가입일:</div>
                <input
                    type="text"
                    className={styles.editInput}
                    readOnly
                    value={DateToString(createdAt)}
                />
            </div>


            <div className={styles.info_Row}>
                <button onClick={sendResetEmail} className={styles.editemailButton}>
                    비밀번호 변경 / 이메일 전송
                </button>
            </div>
        </div>
    );
}
