import { useNavigate } from "react-router-dom";
import supabase from "../../config/supabaseClient";
import { useEffect } from "react";

export default function MustBeLoggedIn() {
    const navigate = useNavigate();
    useEffect(() => {
        supabase.auth.onAuthStateChange((event, user) => {
            if (!user) {
                alert('로그인이 필요합니다.');
                navigate('/login');
            }
        });
        async function fetchAuth() {
            try {
                const { user } = await supabase.auth.getCurrentUser();
                if (!user) {
                    navigate('/login');
                }
            } catch (error) {
                alert('로그인이 필요합니다.');
                navigate('/login');
            }
        }
        return () => {
            supabase.auth.onAuthStateChange(null, null);
        };
    }, []);
    return (<></>);
}