// server.js (Express 예시)
const express = require("express");
const fetch = require("node-fetch");
const app = express();

const GEOCODE_URL = "https://maps.apigw.ntruss.com/map-geocode/v2/geocode";
const CLIENT_ID = "네이버_CLIENT_ID";
const CLIENT_SECRET = "네이버_CLIENT_SECRET";

app.get("/geocode", async (req, res) => {
  const { address } = req.query;
  const url = `${GEOCODE_URL}?query=${encodeURIComponent(address)}`;
  const apiRes = await fetch(url, {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": CLIENT_ID,
      "X-NCP-APIGW-API-KEY": CLIENT_SECRET,
    },
  });
  const data = await apiRes.json();
  res.json(data); // 내 서버가 CORS 허용이므로 프론트에서 호출 가능
});

app.listen(3001, () => {
  console.log("프록시 서버 3001번 포트에서 실행 중");
});
