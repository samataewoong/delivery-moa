import { useState } from "react";
import SideMenu from "../components/sidemenu";

export default function CashChargePage() {
  const [point, setPoint] = useState(5000); // 초기 보유 포인트
  const [chargeAmount, setChargeAmount] = useState("");
  const [charges, setCharges] = useState([]); // 충전 이력
  const [message, setMessage] = useState("");

  const handleCharge = () => {
    const amount = Number(chargeAmount);
    if (!amount || amount < 1000) {
      setMessage("최소 1000원 이상만 충전 가능합니다.");
      return;
    }
    setPoint(point + amount);
    setCharges([
      ...charges,
      {
        id: charges.length + 1,
        amount,
        date: new Date().toLocaleString(),
      },
    ]);
    setChargeAmount("");
    setMessage("충전이 완료되었습니다!");
  };

  return (
    <div>
      <SideMenu />
      <h1>캐쉬 포인트 충전 및 확인</h1>

      <h2>
        내 포인트: <span style={{ color: "green" }}>{point}원</span>
      </h2>

      <div style={{ margin: "16px 0" }}>
        <input
          type="number"
          value={chargeAmount}
          onChange={(e) => setChargeAmount(e.target.value)}
          placeholder="충전 금액 (최소 1000원)"
          min="1000"
          step="1000"
        />
        <button onClick={handleCharge}>충전</button>
      </div>

      {message && (
        <p style={{ color: message.includes("완료") ? "green" : "red" }}>
          {message}
        </p>
      )}

      <h3>충전 이력</h3>
      <ul>
        {charges.length === 0 ? (
          <li>충전 이력이 없습니다.</li>
        ) : (
          charges.map((charge) => (
            <li key={charge.id}>
              {charge.amount}원 충전 ({charge.date})
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
