import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EditUser() {
    // db update 구현해야함
    const navigate = useNavigate();

    const [nickname, setNickname] = useState("공구곰");
    const [userAddress, setUserAddress] = useState("서울특별시 종로구 종각 종각로30 -120");
    const [passWord, setPassWord] = useState("123456");
    const nickNameChange = (e) => {
        setNickname(e.target.value);
    }
    const addressChange = (e) => {
        setUserAddress(e.target.value);
    }
    const passWordChange = (e) => {
        setPassWord(e.target.value);
    }
    const [showPassword, setShowPassword] = useState(false);

    const eyeClick = () => setShowPassword(prev => !prev);

    const editComplete = () => {
        alert("수정이 완료되었습니다.");
        navigate("../userinfo");
    }    
    return (
        <div className="userInfo">
            <div className="infoRow">
                <div className="label">닉네임:</div>
                <input type="text" className="editInput" id="editNickname" onChange={nickNameChange} value={nickname}>
                </input>
            </div>
            <div className="infoRow">
                <div className="label">이메일:</div>
                <input type="text" className="editInput" value="gonggu@example.com" readOnly>
                </input>
            </div>
            <div className="infoRow">
                <div className="label">비밀번호:</div>
                <div className="passwordEye">
                    <input type="text" id="editPassWord" onChange={passWordChange} value={showPassword ? passWord : "*".repeat(passWord.length)}></input>
                    <ion-icon id="pwEyes" name={showPassword ? "eye-off-outline" : "eye-outline"} onClick={eyeClick}></ion-icon>
                </div>
            </div>
            <div className="infoRow">
                <div className="label">주소:</div>
                <input type="text" className="editInput" id="editAddress" onChange={addressChange} value={userAddress}></input>
            </div>
            <div className="infoRow">
                <div className="label">가입일:</div>
                <input type="text" className="editInput" value="2024-03-12" readOnly>
                </input>
            </div>
            <button className="editButton" onClick={editComplete} >수정완료</button>
        </div>
    )
}