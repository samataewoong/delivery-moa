import { useEffect, useState } from "react";

const express = require("express");
const fetch = require("node-fetch");
const app = express();

const GEOCODE_URL = "https://maps.apigw.ntruss.com/map-geocode/v2/geocode";
const NAVER_CLIENT_ID = "pgsir80tsx"; // 네이버에서 발급받은 Client ID
const NAVER_CLIENT_SECRET = "";

function NaverMapGeocode() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_CLIENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      // 기본 지도 생성 (서울시청)
      const map = new window.naver.maps.Map("map", {
        center: new window.naver.maps.LatLng(37.5665, 126.978),
        zoom: 12,
      });

      // 위치 정보 요청
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (Position) => {
            const lat = Position.coords.latitude;
            const lng = Position.coords.longitude;
            // 지도 중심을 내 위치로 이동
            map.setCenter(new window.naver.maps.LatLng(lat, lng));
            // 마커도 같이 찍기
            new window.naver.maps.Marker({
              position: new window.naver.maps.LatLng(lat, lng),
              map: map,
              title: "내 위치",
            });
          },
          (error) => {
            alert("위치 정보를 사용할 수 없습니다.");
          }
        );
      }

      // window에 map 저장 (geocoding 버튼에서 활용)
      window._naverMap = map;
    };
  }, []);

  // Geocoding API 호출
  const handleGeocode = async () => {
    const url = `${GEOCODE_URL}?query=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET,
      },
    });
    const data = await res.json();
    setResult(data);

    // 지도 및 마커 표시 (지도 로드 완료 후만)
    if (data.addresses && data.addresses.length > 0 && window._naverMap) {
      const { y, x } = data.addresses[0];
      const pos = new window.naver.maps.LatLng(y, x);
      window._naverMap.setCenter(pos);
      new window.naver.maps.Marker({
        position: pos,
        map: window._naverMap,
        title: address,
      });
    }
  };

  return (
    <div>
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="주소 입력"
      />
      <button onClick={handleGeocode}>좌표 변환</button>
      {result && result.addresses && result.addresses.length > 0 && (
        <div>
          <p>위도: {result.addresses[0].y}</p>
          <p>경도: {result.addresses[0].x}</p>
        </div>
      )}
      {result && (!result.addresses || result.addresses.length === 0) && (
        <div>결과 없음</div>
      )}
      <div
        id="map"
        style={{ width: "100%", height: "400px", marginTop: 20 }}
      ></div>
    </div>
  );
}

export default NaverMapGeocode;

// import { useEffect, useState } from "react";

// const GEOCODE_URL = "https://maps.apigw.ntruss.com/map-geocode/v2/geocode";
// const NAVER_CLIENT_ID = "pgsir80tsx"; // 네이버에서 발급받은 Client ID
// const NAVER_CLIENT_SECRET = "GQaXHNeyGOaoCb6D5Nt1mJw7KrGTKYIdOTjgi3r0";

// function NaverMap() {
//   useEffect(() => {
//     // 스크립트 동적 추가
//     const script = document.createElement("script");
//     script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_CLIENT_ID}`;
//     script.async = true;
//     0;

//     document.head.appendChild(script);

//     script.onload = () => {
//       //기본 지도 생성 (서울시청)
//       const map = new window.naver.maps.Map("map", {
//         center: new window.naver.maps.LatLng(37.5665, 126.978),
//         zoom: 12,
//       });

//       //위치 정보 요청
//       if ("geolocation" in navigator) {
//         navigator.geolocation.getCurrentPosition(
//           (Position) => {
//             const lat = Position.coords.latitude;
//             const lng = Position.coords.longitude;
//             // 지도 중심을 내 위치로 이동
//             map.setCenter(new window.naver.maps.LatLng(lat, lng));
//             // 마커도 같이 찍기
//             new window.naver.maps.Marker({
//               position: new window.naver.maps.LatLng(lat, lng),
//               map: map,
//               title: "내 위치",
//             });
//           },
//           (error) => {
//             alert("위치 정보를 사용할 수 없습니다.");
//           }
//         );
//       } else {
//         alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
//       }
//     };
//   }, []);

//   //Geocoding API

//   return <div id="map" style={{ width: "50%", height: "400px" }}></div>;
// }

// // export default NaverMap;
// export default NaverMap;
