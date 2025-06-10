import { useNavigate } from "react-router-dom";
import styles from "./MyPage.module.css";
import { useEffect, useState } from "react";
import supabase from "../../config/supabaseClient";
import FormattedDate from "../../components/FormattedDate";

export default function UserInfo() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [session, setSession] = useState(null);

  // 닉네임 불러오기
  const fetchUserInfo = async (user) => {
    if (!user) return;

    setEmail(user.email);
    setCreatedAt(user.created_at);

    const { data, error } = await supabase
      .from("user")
      .select("nickname")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("닉네임 불러오기 실패:", error);
    } else {
      setNickname(data.nickname);
    }
  };

  // 현재 로그인된 유저 정보 갖고오기
  useEffect(() => {
    // 현재 사용자 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setSession({ user }); // 세션 정보 저장
        fetchUserInfo(user);  // 유저 정보 불러오기
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setSession(session);
        fetchUserInfo(session.user);
      }
      else {
        setSession(null);
        setEmail("");
        setNickname("");
        setCreatedAt("");
      }
    });

    return () => subscription.unsubscribe(); // 언마운트 시 정리
  }, []);

  const quitButton = () => {
    alert("회원탈퇴는 관리자에게 문의주세요.");
  };
  const editButton = () => {
    navigate("../edituser");
  };

  return (
    <div className={styles.userInfo}>
      <div className={styles.infoRow}>
        <div className={styles.label}>닉네임:</div>
        <div className={styles.value}> {nickname} </div>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.label}>이메일:</div>
        <div className={styles.value}>{email}</div>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.label}>가입일:</div>
        <div className={styles.value}><FormattedDate dateString={createdAt} /></div>
      </div>
      <div className={styles.myButtonContainer}>
        <button className={styles.myButtonEdit} onClick={editButton}>수정하기</button>
        <button className={styles.myButtonQuit} onClick={quitButton}>회원탈퇴</button>
      </div>
    </div>
    
  );
}
