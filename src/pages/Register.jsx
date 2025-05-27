import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const [address, setAddress] = useState(""); // ✅ 주소 상태 추가

    const navigate = useNavigate();

    const checkNicknameDuplicate = async () => {
        if (!nickname.trim()) {
            alert("닉네임을 입력해주세요!");
            return;
        }

        const { data } = await supabase
            .from("user")
            .select("nickname")
            .eq("nickname", nickname)
            .single();

        if (data) {
            alert("이미 사용 중인 닉네임입니다.");
        } else {
            alert("사용 가능한 닉네임입니다!");
        }
    };

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword || !nickname || !address) {
            alert("모든 필드를 입력해주세요!");
            return;
        }

        if (password !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다!");
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { nickname },
            },
        });

        if (error) {
            alert("회원가입 실패! " + error.message);
            return;
        }

        const user = data.user;

        if (user) {
            const { error: insertError } = await supabase
                .from("user")
                .insert([
                    {
                        id: user.id,
                        nickname,
                        address, // ✅ 주소 함께 저장
                        user_rating: 50,
                        cash: 0,
                    },
                ]);

            if (insertError) {
                console.log(insertError.message);
            }
        }

        alert("이메일 인증을 해주세요!");
        navigate("/"); // 메인으로 이동
    };

    return (
        <div>
            <h2>회원가입</h2>
            <table>
                <tbody>
                    <tr>
                        <td>이메일</td>
                        <td>
                            <input
                                type="email"
                                placeholder="이메일"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>비밀번호</td>
                        <td>
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>비밀번호 확인</td>
                        <td>
                            <input
                                type="password"
                                placeholder="비밀번호 확인"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {confirmPassword && confirmPassword !== password && (
                                <div style={{ color: "red", fontSize: "0.8rem" }}>
                                    비밀번호가 일치하지 않습니다.
                                </div>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>닉네임</td>
                        <td>
                            <input
                                type="text"
                                placeholder="닉네임"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={checkNicknameDuplicate}
                                style={{ marginLeft: "8px" }}
                            >
                                중복확인
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td>주소</td>
                        <td>
                            <input
                                type="text"
                                placeholder="주소를 입력해주세요"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
            <br />
            <button onClick={() => navigate("/")}>취소</button>
            <button onClick={handleRegister}>회원가입</button>
        </div>
    );
}

export default Register;
