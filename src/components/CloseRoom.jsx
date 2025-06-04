import { useState, useRef, useEffect } from "react";
import supabase from "../config/supabaseClient";
import styles from "./CloseRoom.module.css";

export default function CloseRoom({ userId, closeModule }) {
    const [userAddress, setUserAddress] = useState("");
    const [roomList, setRoomList] = useState([]); // 전체 room 객체 리스트
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;

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

            const { data: rooms, error: roomError } = await supabase
                .from("room")
                .select("id, room_name, room_address");

            if (roomError) {
                console.log("Error fetching rooms:", roomError);
            } else {
                setRoomList(rooms || []);
            }
        };

        fetchUserData();
    }, [userId]);

    useEffect(() => {
        if (!userAddress || !window.kakao || !window.kakao.maps) return;

        const geocoder = new window.kakao.maps.services.Geocoder();

        geocoder.addressSearch(userAddress, (userResult, userStatus) => {
            if (userStatus === window.kakao.maps.services.Status.OK) {
                const userCoords = new window.kakao.maps.LatLng(
                    userResult[0].y,
                    userResult[0].x
                );

                // 지도 생성 (유저 중심)
                if (!mapInstance.current) {
                    mapInstance.current = new window.kakao.maps.Map(mapRef.current, {
                        center: userCoords,
                        level: 3,
                    });
                } else {
                    mapInstance.current.setCenter(userCoords);
                }

                // 유저 마커
                new window.kakao.maps.Marker({
                    map: mapInstance.current,
                    position: userCoords,
                    title: "내 위치",
                    image: new window.kakao.maps.MarkerImage(
                        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                        new window.kakao.maps.Size(24, 35)
                    ),
                });

                // 방 좌표 변환 및 마커 표시
                roomList.forEach((room) => {
                    geocoder.addressSearch(room.room_address, (roomResult, roomStatus) => {
                        if (roomStatus === window.kakao.maps.services.Status.OK) {
                            const roomCoords = new window.kakao.maps.LatLng(
                                roomResult[0].y,
                                roomResult[0].x
                            );

                            // 거리 계산 (3km 이내만 표시)
                            // const distance = window.kakao.maps.geometry.spherical.computeDistanceBetween(
                            //     userCoords,
                            //     roomCoords
                            // );
                            const boguen = true;
                            if (boguen) {
                                const marker = new window.kakao.maps.Marker({
                                    map: mapInstance.current,
                                    position: roomCoords,
                                    title: room.room_name,
                                    image: new window.kakao.maps.MarkerImage(
                                        "https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/popular/popular_1.jpg",
                                        new window.kakao.maps.Size(24, 35)
                                    ),

                                });

                                const infowindow = new window.kakao.maps.InfoWindow({
                                    content: `<div style="padding:5px; font-size:14px;">
                              <strong>${room.room_name}</strong><br/>
                              ${room.room_address}
                            </div>`,
                                });

                                window.kakao.maps.event.addListener(marker, "click", () => {
                                    infowindow.open(mapInstance.current, marker);
                                });
                            }
                        } else {
                            console.error("방 주소 검색 실패:", roomStatus);
                        }
                    });
                });
            } else {
                console.error("유저 주소 검색 실패:", userStatus);
            }
        });
    }, [userAddress, roomList]);

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div ref={mapRef} style={{ width: "100%", height: "400px" }} />
                <div className={styles.buttons}>
                    <button className={styles.closeButton} onClick={closeModule}>취소</button>
                </div>
            </div>

        </div>

    )
};
