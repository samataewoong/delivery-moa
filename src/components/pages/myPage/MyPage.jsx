import React from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import UserInfo from "./UserInfo";
import EditUser from "./EditUser";
import MyQnA from "./MyQnA";
import MyReview from "./MyReview";
import DeleteAccount from "./DeleteAccount";
import GaugeBar from "./gaugeBar";
import MyHeader from "./MyHeader";
//import styles from "./Mypage.module.css";
import "./my.css";


export default function MyPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const currentMenu = location.pathname.split("/").pop();

    const menuList = [
        { name: "회원정보", path: "userinfo" },
        //{ name: "회원수정", path: "edituser" },
        { name: "문의내역", path: "myqna" },
        { name: "나의평가", path: "myreview" },
        { name: "주문내역", path: "orderlist" },
        { name: "회원탈퇴", path: "deleteaccount" },
    ];
    const selectedMenu = menuList.find(menu => menu.path === currentMenu)?.name;
    return (
        <div className="myPage">
            <div className="myPageLeft">
                <div className="profile">
                    <h2 className="userName">공구곰 님<img src="./img/happyBear.png" className="bearImage" /></h2>
                    <br />
                    <GaugeBar value={40} />
                    <div className="myCash">
                        <span className="label">내 캐시:</span>
                        <span className="amount">200000원</span>
                        <button className="chargeButton" type="button">충전</button>
                    </div>
                </div>
                <div className="myMenu">
                    <ul>
                        {menuList.map(
                            ({ name, path }) => (
                                <li
                                    key={path}
                                    style={{
                                        cursor: "pointer",

                                    }}>
                                    <Link to={`/mypage/${path}`} style={{ textDecoration: "none", fontWeight: currentMenu === path ? "bold" : "normal", color: "black" }}>{name}
                                    </Link>
                                </li>
                            )
                        )}
                    </ul>
                </div>
            </div>
            <div className="myPageRight">
                <MyHeader menuList={menuList} />
                <Routes>
                    
                    <Route path="userinfo" element={<UserInfo />} />
                    <Route path="edituser" element={<EditUser />} />
                    <Route path="myqna" element={<MyQnA />} />
                    <Route path="myreview" element={<MyReview />} />
                    {/* 주문내역 컴포넌트 없으면 빈 요소라도 넣어주세요 */}
                    <Route path="orderlist" element={<div>주문내역 준비중입니다.</div>} />
                    <Route path="deleteaccount" element={<DeleteAccount />} />
                    {/* 기본 경로 리다이렉트 */}
                    <Route path="*" element={<UserInfo selectedMenu={selectedMenu} />} />
                </Routes>

            </div>
        </div>
    )
}   