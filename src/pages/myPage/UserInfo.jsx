import { useNavigate } from "react-router-dom";
import styles from "./MyPage.module.css";
import { useEffect, useState } from "react";
import supabase from "../../config/supabaseClient";

export default function UserInfo({ selectedMenu }) {
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
    confirm("정말 탈퇴하시겠습니까?");
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
        <div className={styles.label}>주소:</div>
        <div className={styles.value}>서울특별시 종로구 종각 종각로30 -120</div>
      </div>
      <div className={styles.infoRow}>
        <div className={styles.label}>가입일:</div>
        <div className={styles.value}>{createdAt}</div>
      </div>
      <div className={styles.myButtonContainer}>
        <button onClick={editButton}>수정하기</button>
        <button onClick={quitButton}>회원탈퇴</button>
      </div>
    </div>
  );
}
