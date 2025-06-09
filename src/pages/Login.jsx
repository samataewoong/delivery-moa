import { useEffect, useState } from "react";
import supabase from "../config/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import style from "./Login.module.css";

function Login() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [session, setSession] = useState("");
  const navigate = useNavigate();

  // 닉네임 불러오기
  const fetchNickname = async (user_id) => {
    const { data } = await supabase
      .from("user")
      .select("nickname")
      .eq("id", user_id)
      .single();
    setNickname(data?.nickname);
  };

  // 세션 감지
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user);
    });

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

    return () => subscription.unsubscribe();
  }, []);

  // 로그인
  const handleLogin = async () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요!");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setEmail("");
    setPassword("");
    setSession(null);

    if (data.user) {
      alert("로그인 성공!");
      setUser(data.user);
      fetchNickname(data.user.id);
      navigate("/mainpage");
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert("로그아웃 실패! " + error.message);
    setEmail("");
    setPassword("");
    navigate("/mainpage");
  };

  return (
    <>
      <div className={style["login-container"]}>
        {user && nickname ? (
          <div id="user_login">
            {navigate("/mainpage")}
          </div>
        ) : (
          <div className={style["login-box"]}>
            <div className={style["login-left"]}>
              <img
                src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/login_logo.png"
                alt="배달모아 로고"
                className={style["login-logo"]}
              />
            </div>
            <div className={style["login-right"]}>
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className={style["login-options"]}>
                <Link to="/forgotpw">비밀번호 찾기</Link>
                <Link to="/register">회원가입</Link>
              </div>
              <button className={style["login-button"]} onClick={handleLogin}>
                로그인
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Login;
