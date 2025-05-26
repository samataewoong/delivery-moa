import { useState } from "react";

export default function DummyPayment() {
  const [paid, setPaid] = useState(false);
  const [orders, setOrders] = useState([]);
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");

  const handlePay = () => {
    //결제 처리(더미)
    setPaid(true);
    setOrders([
      ...orders,
      {
        id: orders.length + 1,
        item,
        price: Number(price),
        date: new Date().toISOString(),
      },
    ]);
    setItem("");
    setPrice("");
  };

  return (
    <div>
      <h1>더미 결제 시스템</h1>
      <div>
        <input
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="상품명"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          placeholder="금액"
        />
        <button onClick={handlePay} disabled={!item || !price}>
          결제
        </button>
      </div>

      {paid && <p style={{ color: "green" }}>결제가 완료됐습니다.</p>}

      <h2>결제 내역(더미)</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            {order.item} - {order.price}원 ({order.date})
          </li>
        ))}
      </ul>
    </div>
  );
}
