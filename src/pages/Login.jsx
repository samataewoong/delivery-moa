import { useEffect, useState } from "react";
import supabase from "../config/supabaseClient";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function Login() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  // 닉네임 불러오기
  const fetchNickname = async (user_id) => {
    const { data } = await supabase
      .from("user")
      .select("nickname")
      .eq("id", user_id)
      .single();

    setNickname(data.nickname);
  };

  // 세션 및 사용자 정보 가져오기
  useEffect(() => {
    // 현재 사용자 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      }
    });

    // 실시간 세션 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        fetchNickname(session.user.id);
      } else {
        setUser(null);
        setNickname("");
      }
    });

    return () => subscription.unsubscribe(); // 정리
  }, []);

  // 로그인
  const handleLogin = async () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요!");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert("로그인 실패!");
      return;
    }

    if (data.user) {
      alert("로그인 성공!");

      setUser(data.user);
      fetchNickname(data.user.id);
      // 메인페이지로 이동
      navigate("/mainpage");
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("로그아웃 실패!" + error.message);
    }

    setEmail("");
    setPassword("");
    setSession(null);

    // 메인페이지로 이동
    navigate("/mainpage");
  };

  return (
    <>
      <Header />
      <div>
        {/* 로그인된 상태면 ~님, 로그아웃 버튼만 보여줌 */}
        {user && nickname ? (
          <div id="user_login">
            <h2>{nickname}님</h2>
            <button onClick={handleLogout}>로그아웃</button>
          </div>
        ) : (
          <>
            <h2>로그인</h2>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <button onClick={handleLogin}>로그인</button>
          </>
        )}
      </div>
    </>
  );
}

export default Login;
