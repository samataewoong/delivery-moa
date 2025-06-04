import { useState } from "react";
import SideMenu from "../components/sidemenu";

const dummyProducts = [
  { id: 1, name: "치즈 피자", price: 12000 },
  { id: 2, name: "햄버거 세트", price: 9000 },
  { id: 3, name: "짜장면", price: 7000 },
  { id: 4, name: "콜라", price: 2000 },
];

export default function PointOrderWithQuantity() {
  const [userPoint, setUserPoint] = useState(30000);
  const [selected, setSelected] = useState([]); // 선택된 상품 id 배열
  const [quantities, setQuantities] = useState({}); // 상품 id별 수량
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  // 체크박스 선택/해제
  const handleSelect = (id) => {
    setSelected(
      (prev) =>
        prev.includes(id)
          ? prev.filter((sid) => sid !== id) // 선택 해제
          : [...prev, id] // 선택 추가
    );
    setQuantities((prev) =>
      // 선택 해제라면 해당 id를 객체에서 제거
      // 선택 추가라면 기존 객체에 id: 1 추가
      prev[id]
        ? Object.fromEntries(
            Object.entries(prev).filter(([key]) => Number(key) !== id)
          )
        : { ...prev, [id]: 1 }
    );
    setMessage("");
  };

  // 수량 변경
  const handleQuantityChange = (id, value) => {
    if (value < 1) return;
    setQuantities((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // 선택 상품 리스트 및 합계 계산
  const selectedProducts = dummyProducts.filter((p) => selected.includes(p.id));
  const total = selectedProducts.reduce(
    (sum, p) => sum + p.price * (quantities[p.id] || 1),
    0
  );

  const handlePay = () => {
    if (selected.length === 0) {
      setMessage("음식을 한 개 이상 선택하세요!");
      return;
    }
    if (userPoint < total) {
      setMessage("포인트가 부족합니다!");
      return;
    }
    setUserPoint((point) => point - total);
    setOrders([
      ...orders,
      {
        id: orders.length + 1,
        items: selectedProducts
          .map((p) => `${p.name} × ${quantities[p.id] || 1}`)
          .join(", "),
        price: total,
        date: new Date().toLocaleString(),
      },
    ]);
    setSelected([]);
    setQuantities({});
    setMessage("결제 완료!");
  };
  const handleCharge = () => {
    setUserPoint((point) => point + 10000);
    setMessage("1만 포인트 충전 완료!");
  };

  return (
    <div>
      <SideMenu />
      <h3>포인트 결제 (수량 조절/체크박스)</h3>
      <div>
        내 포인트: <b style={{ color: "green" }}>{userPoint}원</b>
        <button onClick={handleCharge}>포인트 1만 충전</button>
      </div>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {dummyProducts.map((p) => (
          <li key={p.id} style={{ marginBottom: 8 }}>
            <label>
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                onChange={() => handleSelect(p.id)}
              />
              {p.name} ({p.price}원)
            </label>
            {selected.includes(p.id) && (
              <input
                type="number"
                min="1"
                style={{ width: 50, marginLeft: 8 }}
                value={quantities[p.id] || 1}
                onChange={(e) =>
                  handleQuantityChange(p.id, Number(e.target.value))
                }
              />
            )}
            {selected.includes(p.id) && (
              <span style={{ marginLeft: 8 }}>
                (소계: {p.price * (quantities[p.id] || 1)}원)
              </span>
            )}
          </li>
        ))}
      </ul>
      <div style={{ margin: "10px 0" }}>
        <b>합계:</b> {total}원
      </div>
      <button onClick={handlePay}>결제하기</button>
      {message && (
        <p style={{ color: message === "결제 완료!" ? "green" : "red" }}>
          {message}
        </p>
      )}

      <hr />
      <h4>주문 내역</h4>
      <ul>
        {orders.length === 0 ? (
          <li>주문 내역이 없습니다.</li>
        ) : (
          orders.map((order) => (
            <li key={order.id}>
              [{order.date}] {order.items} ({order.price}원)
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
