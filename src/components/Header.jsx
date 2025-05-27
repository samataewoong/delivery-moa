import "./Header.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import Login from "../pages/Login";
import supabase from "../config/supabaseClient";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const user = Login();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    }
    const [keyword, setKeyword] = useState("")
    const search = () => {
        alert(`검색어: ${keyword}`);
    }
    return (
        <>
            <div className="header">
                <div className="container">
                    <div className="hLogo">
                        <img src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/sign/imgfile/main_img/header_logo.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzBhY2NlOGJhLWVmOTktNDBmMS04MGUzLTE3NWRhYTdkMTJmNiJ9.eyJ1cmwiOiJpbWdmaWxlL21haW5faW1nL2hlYWRlcl9sb2dvLnBuZyIsImlhdCI6MTc0ODMxMDI4MCwiZXhwIjoxNzc5ODQ2MjgwfQ.a0PuoJ5QU3bqpBdFuZMLQ1ExwtTbRU2KEd-o7tYmlB0"></img>
                    </div>
                    <div className="search">
                        < input type="text" className="search_value"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="음식점 또는 메뉴를 검색해보세요" />
                        <button onClick={search} className="search_btn">검색</button>
                    </div>
                    <div className="hamburger">
                        <button onClick={toggleMenu} className="hamburger_btn">
                            <img src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/hamburger-md.png"></img>
                        </button>
                    </div>
                    {isOpen && (
                        <div className="hamburger_nav">
                            <img className="mypage_icon" src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/home-black.png" />
                            <div className="mypage_text">마이페이지</div>
                            <div className="user_coin">
                                <div className="userName"><b>홍길동님</b></div>
                                <img className="coin_imo" src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/coin.png" />
                                <div className="coin_confirm">37000</div>
                            </div>
                            <div className="event_banner">
                                <img className="event_banner1" src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/event_banner1.png"></img>
                                <img className="event_banner2" src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/main_img/event_banner2.png"></img>
                            </div>
                            <div>
                                <h3>참여중인 채팅방 목록</h3>

                            </div>
                        </div>
                    )}
                </div>
            </div>


        </>

    )
}