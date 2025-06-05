import { useState, useRef, useEffect } from "react";
import supabase from "../config/supabaseClient";
import styles from "./CloseRoom.module.css";
import { getCoordinates } from "../functions/maps/Coord";
import { getDistance } from "../functions/maps/Distance";

export default function CloseRoom({ userId, roomList }) {
    const [userAddress, setUserAddress] = useState("");
    //const [roomList, setRoomList] = useState([]); // 전체 room 객체 리스트
    const [rooms, setRooms] = useState([]);
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            //if (!userId) return;

            const { data: user, error: userError } = await supabase
                .from("user")
                .select("address")
                .eq("id", userId)
                .single();

            if (userError) {
                console.log("Error fetching user data:", userError);
            } else {
                setUserAddress(user.address);
            }

            // const { data: rooms, error: roomError } = await supabase
            //     .from("room")
            //     .select("id, room_name, room_address");

            // if (roomError) {
            //     console.log("Error fetching rooms:", roomError);
            // } else {
            //     setRoomList(rooms || []);
            // }
        };

        fetchUserData();
    }, [userId]);

    useEffect(() => {
        async function process() {
            try {
                const userCoords = await getCoordinates(userAddress);
                if (!window.kakao || !window.kakao.maps) {
                    throw new Error('Kakao Maps API is not loaded');
                }
                const userKakaoCoords = new window.kakao.maps.LatLng(
                    userCoords.lat,
                    userCoords.lng
                );
                // 지도 생성 (유저 중심)
                if (!mapInstance.current) {
                    mapInstance.current = new window.kakao.maps.Map(mapRef.current, {
                        center: userKakaoCoords,
                        level: 3,
                    });
                } else {
                    mapInstance.current.setCenter(userKakaoCoords);
                }
                new window.kakao.maps.Marker({
                    map: mapInstance.current,
                    position: userKakaoCoords,
                    title: "내 위치",
                    image: new window.kakao.maps.MarkerImage(
                        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                        new window.kakao.maps.Size(24, 35)
                    ),
                });
                let roomsData = [];
                for (const room of roomList) {
                    const roomCoords = await getCoordinates(room.room_address);
                    const roomKakaoCoords = new window.kakao.maps.LatLng(
                        roomCoords.lat,
                        roomCoords.lng
                    );
                    const distance = getDistance(
                        userCoords,
                        roomCoords
                    );
                    if (distance <= 1) {
                        roomsData.push({ ...room, distance });
                        const marker = new window.kakao.maps.Marker({
                            map: mapInstance.current,
                            position: roomKakaoCoords,
                            title: room.room_name,
                            image: new window.kakao.maps.MarkerImage(
                                `${import.meta.env.BASE_URL}/web_logo.png`,
                                new window.kakao.maps.Size(30, 35)
                            ),
                        });

                        const buttonCss = styles.infowindowClose;
                        const roomImg = styles.infowindowImg;
                        const infowindow = new window.kakao.maps.InfoWindow({
                            content: `<div style="position: relative; padding:5px; font-size:14px;">`
                                + `<div>`
                                + `<img class="${roomImg}" alt="undefined 이미지" src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/store/store_${room.store_id}.jpg"></div>`
                                + `<strong>${room.room_name}<button id="closeButton-${room.id}" class="${buttonCss}">x</button></strong><br/>`
                                + `${room.room_address}</div>`,
                        });

                        window.kakao.maps.event.addListener(marker, "click", () => {
                            infowindow.open(mapInstance.current, marker);

                            setTimeout(() => {
                                const closeButton = document.getElementById(`closeButton-${room.id}`);
                                if (closeButton) {
                                    closeButton.onclick = () => infowindow.close();
                                }
                            });
                        });
                    }
                }
                setRooms(roomsData);
            } catch (error) {
                console.error("Error in process function:", error);
            }
        }
        process();
    }, [userAddress, roomList]);

    return userId ? (
        <div className={styles.mapContainer}>
            <div
                className={styles.closeMap}
                ref={mapRef}
                style={{ width: "950px", height: "600px" }}
            ></div>
        </div>
    ) : <div className={styles.mapContainer}>
        <div
            className={styles.closeMap}
            style={{ width: "900px", height: "400px" }}
        >
            <p>로그인이 필요합니다.</p>
        </div>
    </div>
};
