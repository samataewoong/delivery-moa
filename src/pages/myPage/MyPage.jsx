import { Link, Outlet, useLocation } from 'react-router-dom';
import GaugeBar from '../../components/gaugeBar';
import MyHeader from './MyHeader';
import styles from './MyPage.module.css';
import Header from '../../components/Header';

export default function MyPage() {
  const location = useLocation();
  const currentMenu = location.pathname.split('/').pop();

  const menuList = [
    { name: '회원정보', path: 'userinfo' },
    { name: '문의내역', path: 'myqna' },
    { name: '나의평가', path: 'myreview' },
    { name: '주문내역', path: 'orderlist' },
  ];

  return (
    <>
      <Header />
      <div className={styles.myPage}>
        {/* 왼쪽 메뉴 */}
        <div className={styles.myPageLeft}>
          <div className={styles.profile}>
            <h2 className={styles.userName}>
              공구곰 님
            </h2>
            <br />
            <GaugeBar value={40} />
            <div className={styles.myCash}>
              <span className={styles.label}>내 캐시:</span>
              <span className={styles.amount}>200000원</span>
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
          <Outlet />
        </div>
      </div>
    </>
  );
}
