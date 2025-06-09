import { useRef, useState, useEffect } from "react";
import supabase from "../config/supabaseClient";
import styles from "./CloseRoom.module.css";
import { getCoordinates } from "../functions/maps/Coord";
import { getDistance } from "../functions/maps/Distance";
import { useNavigate } from "react-router-dom";

export default function CloseRoom({ userId, roomList }) {
	const navigate = useNavigate();
	const [userAddress, setUserAddress] = useState("");
	const mapRef = useRef(null);
	const mapInstance = useRef(null);
	const currentOverlay = useRef(null); // 현재 열린 커스텀 오버레이 추적

	useEffect(() => {
		const fetchUserData = async () => {
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
		};

		fetchUserData();
	}, [userId]);

	useEffect(() => {
		if (!userAddress || !window.kakao || !window.kakao.maps) return;

		const geocoder = new window.kakao.maps.services.Geocoder();

		geocoder.addressSearch(userAddress, (userResult, userStatus) => {
			if (userStatus !== window.kakao.maps.services.Status.OK) {
				console.error("유저 주소 검색 실패:", userStatus);
				return;
			}

			const userCoords = new window.kakao.maps.LatLng(userResult[0].y, userResult[0].x);

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

			// 방 마커 생성
			roomList.forEach((room) => {
				geocoder.addressSearch(room.room_address, (roomResult, roomStatus) => {
					if (roomStatus !== window.kakao.maps.services.Status.OK) {
						console.error("방 주소 검색 실패:", roomStatus);
						return;
					}

					const roomCoords = new window.kakao.maps.LatLng(roomResult[0].y, roomResult[0].x);
					const distanceInKm = getDistance(
						{ lat: userResult[0].y, lng: userResult[0].x },
						{ lat: roomResult[0].y, lng: roomResult[0].x }
					);
					if (distanceInKm > 1) return;
					const marker = new window.kakao.maps.Marker({
						map: mapInstance.current,
						position: roomCoords,
						title: room.room_name,
						image: new window.kakao.maps.MarkerImage(
							`${import.meta.env.BASE_URL}/web_logo.png`,
							new window.kakao.maps.Size(30, 35)
						),
					});

					const buttonCss = styles.infowindowClose;
					const roomImg = styles.infowindowImg;
					const markerPosition = marker.getPosition();

					const overlayContent = `
            <div style="
              position: relative;
              background: white;
              padding: 5px;
              border-radius: 7px;
              border: solid 3px #2f82e9; 
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              max-width: 220px;
            ">
              <div id="roomImage-${room.id}">
                <img class="${roomImg}" alt="undefined 이미지"
                  src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/store/store_${room.store_id}.jpg"
                  style="width: 100%; border-radius: 5px 5px 0 0;"
                />
              </div>
              <strong id="roomName-${room.id}" style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                ${room.room_name}
              </strong>
                <button id="closeButton-${room.id}" class="${buttonCss}" style="cursor:pointer; border:none; background:none; font-weight:bold;">×</button>
              <div id="roomAddress-${room.id}" style="margin-top: 4px;">${room.room_address}</div>
            </div>`;

					const customOverlay = new window.kakao.maps.CustomOverlay({
						position: markerPosition,
						content: overlayContent,
						yAnchor: 1.2,
					});

					window.kakao.maps.event.addListener(marker, "click", () => {
						// 기존 오버레이 닫기
						if (currentOverlay.current) {
							currentOverlay.current.setMap(null);
						}
						// 새 오버레이 열기
						customOverlay.setMap(mapInstance.current);
						currentOverlay.current = customOverlay;

						setTimeout(() => {
							const closeBtn = document.getElementById(`closeButton-${room.id}`);
							if (closeBtn) {
								closeBtn.onclick = () => {
									customOverlay.setMap(null);
									currentOverlay.current = null;
								};
							}
							const clickRoom = () => {
								if (!window.confirm(`"${room.room_name}" 공구방으로 이동하시겠습니까?`)) return;
								navigate(`/room/${room.id}`);
							};
							const clickRoute = () => {
								window.open(`https://map.kakao.com/link/to/${encodeURIComponent(room.room_name)},${roomResult[0].y},${roomResult[0].x}`, "_blank");
							};
							const roomImage = document.getElementById(`roomImage-${room.id}`);
							if (roomImage) {
                roomImage.onclick = clickRoom;
              }
							const roomName = document.getElementById(`roomName-${room.id}`);
							if (roomName) {
								roomName.onclick = clickRoom;
							}
							const roomAddress = document.getElementById(`roomAddress-${room.id}`);
							if (roomAddress) {
								roomAddress.onclick = clickRoute;
							}
						}, 0);
					});
				});
			});
		});
	}, [userAddress, roomList]);
	return userId ? (
		<div className={styles.mapContainer}>
			<div
				className={styles.closeMap}
				ref={mapRef}
				style={{ width: "950px", height: "600px" }}
			></div>
		</div>
	) : (
		<div className={styles.mapContainer}>
			<div
				className={styles.closeMap}
				style={{ width: "900px", height: "400px" }}
			>
				<p>로그인이 필요합니다.</p>
			</div>
		</div>
	);
}
