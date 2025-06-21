import { useRef, useState, useEffect } from "react";
import supabase from "../config/supabaseClient";
import styles from "./CloseRoom.module.css";
import { getDistance } from "../functions/maps/Distance";
import { useNavigate } from "react-router-dom";

export default function CloseRoom({ userId, roomList, onSelectRoomId }) {
  const navigate = useNavigate();

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const geocoder = useRef(null);
  const userMarker = useRef(null);
  const currentOverlay = useRef(null);
  const roomMarkers = useRef([]);

  const [userAddress, setUserAddress] = useState("");
  const [userCoords, setUserCoords] = useState(null);

  // DB에 주소 업데이트 함수
  const updateAddress = async (newAddress) => {
    const { data, error } = await supabase
      .from("user")
      .update({ address: newAddress })
      .eq("id", userId);
    if (error) {
      console.log("주소 변경 실패:", error);
    }
  };

  // 1. userId 관련 데이터 fetch 및 실시간 구독
  useEffect(() => {
    if (!userId) return;

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

    // supabase realtime 구독 - user address 변경 감지
    const userSubscribe = supabase
      .channel(`realtime:close_room_address_watch_on_user_${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user" },
        (payload) => {
          if (payload.new.id === userId) {
            setUserAddress(payload.new.address);
          }
        }
      )
      .subscribe();

    // room 테이블 변경 감지 (필요시 user 데이터 다시 fetch)
    const roomSubscribe = supabase
      .channel("realtime:room_watch_on_close_room_page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room" },
        () => {
          fetchUserData();
        }
      )
      .subscribe();

    return () => {
      userSubscribe.unsubscribe();
      roomSubscribe.unsubscribe();
    };
  }, [userId]);

  // 2. 지도 초기화 및 userAddress 변경 시 좌표 변환, userMarker 위치 업데이트
  useEffect(() => {
    if (!userAddress || !window.kakao || !window.kakao.maps) return;

    if (!mapInstance.current) {
      mapInstance.current = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 기본 위치 서울
        level: 3,
      });
      geocoder.current = new window.kakao.maps.services.Geocoder();
    }

    geocoder.current.addressSearch(userAddress, (result, status) => {
      if (status !== window.kakao.maps.services.Status.OK) {
        console.error("주소 검색 실패:", status);
        return;
      }

      const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
      setUserCoords(coords);
      mapInstance.current.setCenter(coords);

      if (!userMarker.current) {
        userMarker.current = new window.kakao.maps.Marker({
          map: mapInstance.current,
          position: coords,
          title: "내 위치",
          draggable: true,
          image: new window.kakao.maps.MarkerImage(
            "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
            new window.kakao.maps.Size(24, 35)
          ),
        });

        window.kakao.maps.event.addListener(userMarker.current, "dragend", () => {
          const newPos = userMarker.current.getPosition();
          setUserCoords(newPos);

          geocoder.current.coord2Address(newPos.getLng(), newPos.getLat(), (res, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const newAddress = res[0].address.address_name;
              setUserAddress(newAddress);
              updateAddress(newAddress);
              console.log("변경된 주소:", newAddress);
            }
          });
        });
      } else {
        userMarker.current.setPosition(coords);
      }
    });
  }, [userAddress]);

  // 3. userCoords, roomList 변경 시 방 마커 관리
  useEffect(() => {
    if (!userCoords || !mapInstance.current || !geocoder.current) return;

    // 기존 방 마커 모두 제거
    roomMarkers.current.forEach((marker) => marker.setMap(null));
    roomMarkers.current = [];

    roomList.forEach((room) => {
      geocoder.current.addressSearch(room.room_address, (roomResult, roomStatus) => {
        if (roomStatus !== window.kakao.maps.services.Status.OK) {
          console.error("방 주소 검색 실패:", roomStatus);
          return;
        }

        const roomCoords = new window.kakao.maps.LatLng(roomResult[0].y, roomResult[0].x);

        const distanceInKm = getDistance(
          { lat: userCoords.getLat(), lng: userCoords.getLng() },
          { lat: roomResult[0].y, lng: roomResult[0].x }
        );

        if (distanceInKm > 1) return;

        const marker = new window.kakao.maps.Marker({
          map: mapInstance.current,
          position: roomCoords,
          title: room.room_name,
          image: new window.kakao.maps.MarkerImage(
            `${import.meta.env.BASE_URL}/web_logo.png`,
            new window.kakao.maps.Size(38.55, 33.55)
          ),
        });

        roomMarkers.current.push(marker);

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
            <div id="roomAddress-${room.id}" class="${styles.mapAddress}">${room.room_address}</div>
            <div>(${Math.floor(room.distance * 10) / 10}km)</div>
          </div>`;

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: markerPosition,
          content: overlayContent,
          yAnchor: 1.2,
        });

        window.kakao.maps.event.addListener(marker, "click", () => {
          if (currentOverlay.current) {
            currentOverlay.current.setMap(null);
          }
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
                onSelectRoomId(null);
              };
            }

            const clickRoom = async () => {
              // 예: 방 입장 여부 확인 함수 (구현 필요)
              // const roomJoinData = await selectRoomJoin({ room_id: room.id, user_id: userId });
              // if (roomJoinData.length > 0) {
              //   navigate(`/room/${room.id}`);
              //   return;
              // }
              if (!window.confirm(`"${room.room_name}" 공구방으로 이동하시겠습니까?`)) return;
              navigate(`/room/${room.id}`);
            };

            const clickRoute = () => {
              window.open(
                `https://map.kakao.com/link/to/${encodeURIComponent(room.room_name)},${roomResult[0].y},${roomResult[0].x}`,
                "_blank"
              );
            };

            const roomImage = document.getElementById(`roomImage-${room.id}`);
            if (roomImage) roomImage.onclick = clickRoom;
            const roomName = document.getElementById(`roomName-${room.id}`);
            if (roomName) roomName.onclick = clickRoom;
            const roomAddress = document.getElementById(`roomAddress-${room.id}`);
            if (roomAddress) roomAddress.onclick = clickRoute;
          }, 0);
        });
      });
    });
  }, [userCoords, roomList, onSelectRoomId, userId, navigate]);

  return userId ? (
    <div className={styles.closeMap} ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
  ) : (
    <div className={styles.closeMap}>
      <p>로그인이 필요합니다.</p>
    </div>
  );
}
