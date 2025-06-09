import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from "../config/supabaseClient";

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // 사용자가 로그인된 상태인지 확인
        supabase.auth.getUser().then(({ data: { user } }) => {
            setIsLoggedIn(!!user);
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password) {
            setMessage('❗ 새 비밀번호를 입력해 주세요.');
            return;
        }

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setMessage('❌ 비밀번호 변경 실패: ' + error.message);
        } else {
            setMessage('✅ 비밀번호가 변경되었어요! 로그인 페이지로 이동 중...');
            setTimeout(() => navigate('/login'), 2000);
        }
    };

    if (!isLoggedIn) {
        return <p>접근 권한이 없습니다. 이메일 링크를 통해 접속해주세요.</p>;
    }

    return (
        <div>
            <form onSubmit={handleSubmit} >
                <h2>🔒 새 비밀번호 설정</h2>
                <input
                    type="password"
                    placeholder="새 비밀번호 입력"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">비밀번호 변경하기</button>
                {message && <p>{message}</p>}
            </form>

        </div>

    );

}