import { Link, Outlet, useLocation } from 'react-router-dom';
import GaugeBar from '../../components/gaugeBar';
import MyHeader from './MyHeader';
import styles from './MyPage.module.css';
import Header from '../../components/Header';
import supabase from '../../config/supabaseClient';
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function MyPage() {
    const navigate = useNavigate();
    //user 정보
    const [session, setSession] = useState(null);
    const [myUserId, setMyUserId] = useState(null);
    const [myNickname, setMyNickname] = useState("");
    const [myCash, setMyCash] = useState(0);
    const [myTemperature, setMyTemperature] = useState("");
    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) {
                alert('로그인이 필요합니다.');
                navigate('/', { replace: true }); // replace로 뒤로 가기 방지
                return;
            }

            setSession(session);

            const { data, error } = await supabase
                .from('user')
                .select('nickname, cash, user_rating')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error('유저정보 조회 실패:', error);
            } else {
                setMyNickname(data.nickname);
                setMyCash(data.cash);
                setMyTemperature(data.user_rating);
                setMyUserId(session.user.id);
            }
        };

        fetchUserData();
    }, [navigate]);


    const currentMenu = location.pathname.split('/').pop();
    const menuList = [
        { name: '회원정보', path: 'userinfo' },
        { name: '주문내역', path: 'orderlist' },
        { name: '문의내역', path: 'myqna' }
    ];

    return (
        <>
            <Header />
            <div className={styles.myPage}>
                {/* 왼쪽 메뉴 */}
                <div className={styles.myPageLeft}>
                    <div className={styles.profile}>
                        <h2 className={styles.userName}>
                            {myNickname} 님
                        </h2>
                        <br />
                        <GaugeBar value={myTemperature} />
                        <div className={styles.myCash}>
                            <span className={styles.label}>내 캐시:</span>
                            <span className={styles.amount}>{myCash}원</span>
                            <button className={styles.chargeButton}>충전</button>
                        </div>
                    </div>
                    <div className={styles.myMenu}>
                        <ul className={styles.myMenuUl}>
                            {menuList.map(({ name, path }) => (
                                <li key={path} className={styles.myMenuLi}>
                                    <Link
                                        to={`/mypage/${path}`}
                                        style={{
                                            textDecoration: 'none',
                                            fontWeight: currentMenu === path ? 'bold' : 'normal',
                                            color: 'black',
                                        }}
                                    >
                                        {name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 오른쪽 콘텐츠 */}
                <div className={styles.myPageRight}>
                    <MyHeader menuList={menuList} />
                    <Outlet context={{ userSession: session, userId: myUserId }} />
                </div>
            </div>
        </>
    );
}
