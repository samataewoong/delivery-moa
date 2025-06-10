import { useRef, useState, useEffect } from "react";
import supabase from "../config/supabaseClient";
import styles from "./CloseRoom.module.css";
import { getCoordinates } from "../functions/maps/Coord";
import { getDistance } from "../functions/maps/Distance";
import { useNavigate } from "react-router-dom";

export default function CloseRoom({ userId, roomList, onSelectRoomId }) {
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

		const userSubscribe = supabase
			.realtime
			.channel(`realtime:close_room_address_watch_on_user_${userId}`)
			.on(
				"postgres_changes",
				{ event: '*', schema: 'public', table: 'user' },
				(payload) => {
					if (payload.new.id === userId) {
						setUserAddress(payload.new.address);
					}
				}
			)
			.subscribe();
        const roomSubscribe = supabase
            .realtime
            .channel("realtime:room_watch_on_close_room_page")
            .on(
                "postgres_changes",
                { event: '*', schema: 'public', table: 'room' },
                (payload) => {
                    fetchUserData();
                }
            )
            .subscribe();

		fetchUserData();
		return () => {
			userSubscribe.unsubscribe();
		};
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
			mapInstance.current = new window.kakao.maps.Map(mapRef.current, {
				center: userCoords,
				level: 3,
			});
			mapInstance.current.setCenter(userCoords);

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
					const markerPosition = marker.getPosition();
					const overlayContent = `
            <div class="${styles.mapOverlay}">
              <div id="roomImage-${room.id}">
                <img class="${styles.infowindowImg}" alt="undefined 이미지" title="공구방으로 이동합니다"
                  src="https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/imgfile/store/store_${room.store_id}.jpg"
                />
              </div>
              <strong id="roomName-${room.id}" class="${styles.mapRoomName}">
                ${room.room_name}
              </strong>
                <button id="closeButton-${room.id}" class="${styles.infowindowClose}" style="cursor:pointer; border:none; background:none; font-weight:bold;">×</button>
              <div id="roomAddress-${room.id}" class="${styles.mapAddress}">${room.room_address}</div><div>(${Math.floor(room.distance * 10) / 10}km)</div>
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
						if (typeof onSelectRoomId === "function") {
							onSelectRoomId(room.id);
						}
						
						setTimeout(() => {
							const closeBtn = document.getElementById(`closeButton-${room.id}`);
							if (closeBtn) {
								closeBtn.onclick = () => {
									customOverlay.setMap(null);
									currentOverlay.current = null;
								};
							}
							const clickRoom = async () => {
								const roomJoinData = await selectRoomJoin({ room_id: room.id, user_id: userId });
								if (roomJoinData.length > 0) {
									navigate(`/room/${room.id}`);
									return;
								}
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

		<div
			className={styles.closeMap}
			ref={mapRef}
		></div>

	) : (

		<div className={styles.closeMap}>
			<p>로그인이 필요합니다.</p>
		</div>

	);
}
