import { useEffect } from "react";

const NAVER_CLIENT_ID = "ncp_iam_BPAMKR4IWqTwCZLU0j6t"; // 네이버에서 발급받은 Client ID

function NaverMap() {
  useEffect(() => {
    // 스크립트 동적 추가
    const script = document.createElement("script");
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_CLIENT_ID}`;
    script.async = true;0.
    
    document.head.appendChild(script);

    script.onload = () => {
      // 스크립트 로드 후 지도 생성
      // window.naver는 스크립트 로드 후에만 사용 가능
      const map = new window.naver.maps.Map("map", {
        center: new window.naver.maps.LatLng(37.5665, 126.978), // 서울시청
        zoom: 12,
      });
    };
  }, []);

  return <div id="map" style={{ width: "100%", height: "400px" }}></div>;
}

export default NaverMap;
