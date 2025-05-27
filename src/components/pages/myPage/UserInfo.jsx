import { useNavigate } from "react-router-dom";

export default function UserInfo({selectedMenu}) {
    const navigate = useNavigate();
    const quitButton = () => {
        alert("진짜 탈퇴??");
    }
    const editButton = () => {
        navigate("../edituser");
    }
    return (
        <div className="userInfo">
            <div className="infoRow">
                <div className="label">닉네임:</div>
                <div className="value">공구곰</div>
            </div>
            <div className="infoRow">
                <div className="label">이메일:</div>
                <div className="value">gonggu@example.com</div>
            </div>
            <div className="infoRow">
                <div className="label">주소:</div>
                <div className="value">서울특별시 종로구 종각 종각로30 -120</div>
            </div>
            <div className="infoRow">
                <div className="label">가입일:</div>
                <div className="value">2024-03-12</div>
            </div>
            <div className="myButtonContainer">
                <button onClick={editButton}>수정하기</button>
                <button onClick={quitButton}>회원탈퇴</button>
            </div>
        </div>

    )
}