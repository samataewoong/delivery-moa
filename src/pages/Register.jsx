import { useState } from "react";
import supabase from "../config/supabaseClient";

function Register() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState("");

    // if(!email || !password || !nickname){
    //     alert('모든 필드를 입력해주세요!');
    //     return;
    // }

    const handleRegister = async () => {

        // Auth 회원가입
        const { data, error } = await supabase.auth.signUp({
            email: email, 
            password: password,
            options: {
                data: {nickname},
            },
        });

        if (error) {
            alert("회원가입 실패!" + error.message);
            return;
        }

        const user = data.user;

        // Auth 성공하면 닉네임 등 정보 user 테이블 insert
        if (user) {
            const { error } = await supabase
                .from("user")
                .insert([
                    {
                        id: user.id,
                        nickname,
                        user_rating: 50,
                        cash: 0
                    }
                ]);

            if (error) {
                return console.log(error.message);
            }
        }
    }

    return (
        <>
            <div>
                <input type="email" placeholder="이메일을 입력하세요"></input>
                <input type="password" placeholder="비밀번호를 입력하세요"></input>
                <input type="text" placeholder="닉네임을 입력하세요"></input>
                <button onClick={handleRegister}> 회원가입하기 </button>
            </div>
        </>
    )
}
export default Register;