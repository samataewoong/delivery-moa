import { useEffect, useRef } from "react";

function MapComponent({ address }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!address) return;

    // 카카오 맵이 로드된 상태에서 실행
    if (window.kakao && window.kakao.maps) {
      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.addressSearch(address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

          // 지도 생성
          const map = new window.kakao.maps.Map(mapRef.current, {
            center: coords,
            level: 3,
          });

          // 마커 생성
          const marker = new window.kakao.maps.Marker({
            map: map,
            position: coords,
          });
        } else {
          console.error("주소 검색 실패", status);
        }
      });
    }
  }, [address]);

  return <div ref={mapRef} style={{ width: "100%", height: "400px" }} />;
}

export default MapComponent;
