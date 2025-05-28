import { useEffect, useState } from "react";
import supabase from "../config/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "../components/Header";

function Login() {
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

        setNickname(data.nickname)
    }

    // 세션 및 사용자 정보 가져오기
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) fetchNickname(session.user.id);
            else setNickname("");
        });

        return () => subscription.unsubscribe(); // 정리
    }, []);

    const handleLogin = async () => {

        if (!email || !password) {
            alert('이메일과 비밀번호를 입력해주세요!');
            return;
        }

        // 로그인처리
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            alert("로그인 실패! " + error.message);
            return;
        }

        if (data.user) {
            alert("로그인 성공!");

            // 메인페이지로 이동
            //navigate();
        }
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            alert("로그아웃 실패!" + error.message);
        }

        setEmail("");
        setPassword("");
        setSession(null);

        // 메인페이지로 이동
        //navigate();
    };

    return (
        <>
        <Header/>
        <div>
            {/* 로그인된 상태면 ~님, 로그아웃 버튼만 보여줌 */}
            {session && nickname ? (
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
                    /><br />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    /><br />
                    <button onClick={handleLogin}>로그인</button>
                </>
            )}
        </div>
        </>
    );
}

export default Login;