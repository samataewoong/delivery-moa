import { useState } from 'react';
import supabase from "../config/supabaseClient";
import style from "./ForgotPassword.module.css";

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://localhost:5173/delivery-moa/src/ResetPassword',
        });

        if (error) {
            setMessage('❌ 이메일 전송 실패: ' + error.message);
        } else {
            setMessage('📧 이메일을 확인해 주세요! 비밀번호 재설정 링크가 전송되었어요.');
        }

    };

    return (
        <>
            <div className={style[""]}>
                <form onSubmit={handleSubmit} className={style[""]}>
                    <h2>비밀번호 재설정</h2>
                    <p>가입한 이메일 주소를 입력하면 비밀번호 재설정 링크를 보내드려요.</p>
                    <input
                        type="email"
                        placeholder="이메일 주소 입력"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit">
                        비밀번호 재설정 메일 보내기
                    </button>
                    {message && <p className={style[""]}>{message}</p>}
                </form>
            </div>
        </>


    );

};