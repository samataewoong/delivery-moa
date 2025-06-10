import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../config/supabaseClient";
import style from './RoomCreatePage.module.css';
import { useEffect, useState } from "react";
import getAuthUser from "../../functions/auth/GetAuthUser";
import insertRoom from "../../functions/room/InsertRoom";
import selectUser from "../../functions/user/SelectUser";
import selectStore from "../../functions/store/SelectStore";
import selectRoom from "../../functions/room/SelectRoom";
import Header from "../../components/Header";
import MustBeLoggedIn from "../../components/login_check/MustBeLoggedIn";

export default function RoomCreatePage() {
    const navigate = useNavigate();
    const { store_id } = useParams();
    const [roomName, setRoomName] = useState('');
    const [authUser, setAuthUser] = useState(null);
    const [user, setUser] = useState(null);
    const [store, setStore] = useState(null);
    const [roomAddress, setRoomAddress] = useState('');
    const [roomDetailAddress, setRoomDetailAddress] = useState('');
    const [maxPeople, setMaxPeople] = useState(6);
    useEffect(() => {
        async function fetchUser() {
            try {
                const authUserData = await getAuthUser();
                setAuthUser(authUserData);
                const userData = await selectUser({ user_id: authUserData.id });
                if (userData.length > 0) {
                    setUser(userData[0]);
                    setRoomAddress(userData[0].address);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        }
        fetchUser();
    }, []);
    useEffect(() => {
        async function fetchStore() {
            try {
                const storeData = await selectStore({ store_id });
                setStore(storeData[0]);
            } catch (error) {
                console.error('Error fetching store:', error);
            }
        }
        fetchStore();
    }, [store_id]);
    useEffect(() => {
        if (store) {
            setRoomName(`같이 ${store.store_name}에서 주문 할 사람 구해요`);
        }
    }, [store]);
    const handleCreateRoom = async () => {
        if (!roomName) {
            alert('공구방 이름을 입력하세요.');
            return;
        }
        if (maxPeople < 2) {
            alert('인원수는 2명 이상이어야 합니다.');
            return;
        }
        try {
            await insertRoom({
                room_name: roomName,
                room_address: `${roomAddress} ${roomDetailAddress}`,
                max_people: maxPeople,
                leader_id: authUser.id,
                store_id: store_id
            });
            const roomData = await selectRoom({
                room_name: roomName,
                room_address: `${roomAddress} ${roomDetailAddress}`,
                max_people: maxPeople,
                leader_id: authUser.id,
                store_id: store_id,
            });
            if (roomData.length > 0) {
                alert('공구방을 성공적으로 만들었습니다.');
                navigate(`/room/${roomData[0].id}`);
            } else {
                alert('공구방을 만드는데 실패하였습니다. 나중에 다시 시도 해 주세요.')
            }

        } catch (error) {
            alert('공구방을 만드는데 실패하였습니다. 나중에 다시 시도 해 주세요.')
            console.error('Error creating room:', error);
        }

    }
    return (
        <>
            <MustBeLoggedIn />
            <div className={style.container}>
                <div className={style.room_create_page_box}>
                    <h1>공구방 생성</h1>
                    <div className={style.input_label_box}>
                        <div className={style.label_box}>공구방 이름</div>
                        <input className={style.input_box} type="text" placeholder="공구방 이름" value={roomName} onChange={(e) => {
                            setRoomName(e.target.value);
                        }} />
                    </div>
                    <div className={style.input_label_box}>
                        <div className={style.label_box}>공구방 주소</div>
                        <input className={style.input_box} type="text" placeholder="공구방 주소" value={roomAddress} />
                    </div>
                    <div className={style.input_label_box}>
                        <div className={style.label_box}>공구방 상세 주소</div>
                        <input className={style.input_box} type="text" placeholder="공구방 상세 주소" value={roomDetailAddress} onChange={(e) => {
                            setRoomDetailAddress(e.target.value);
                        }} />
                    </div>
                    <div className={style.input_label_box}>
                        <div className={style.label_box}>공구방 인원수</div>
                        <input className={style.input_box} type="number" placeholder="공구방 인원수" value={maxPeople} onChange={(e) => {
                            setMaxPeople(parseInt(e.target.value));
                        }} />
                    </div>
                    <input className={[style.input_box, style.input_button_box].join(' ')} type="button" value="생성" onClick={handleCreateRoom} />
                </div>
            </div>
        </>
    )
}