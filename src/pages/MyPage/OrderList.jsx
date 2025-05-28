//order Table column - room.id / store.id / room_order / total_price / created_at / user.id / id
import { useState } from "react";
import DummyPayment from "../CashPay";

const dummyOrders = [
  {
    id: 1,
    room_id: 12,
    item: "피자",
    price: 12000,
    date: 20250523,
    user_id: 1,
    store_id: "가나다",
  },
  {
    id: 2,
    room_id: 23,
    item: "햄부기",
    price: 10000,
    date: 20250523,
    user_id: 2,
    store_id: "맘스터치",
  },
  {
    id: 3,
    room_id: 34,
    item: "짜장면",
    price: 5000,
    date: 20250523,
    user_id: 3,
    store_id: "홍보석",
  },
  {
    id: 4,
    room_id: 45,
    item: "짬뽕",
    price: 7500,
    date: 20250525,
    user_id: 1,
    store_id: "수저가",
  },
];
export default function OrderList() {
  const [inputUserId, setInputUserId] = useState("1");

  const handleChange = (e) => {
    setInputUserId(e.target.value);
  };

  const userId = parseInt(inputUserId, 10);

  const myOrders = !isNaN(userId)
    ? dummyOrders.filter((order) => order.user_id === userId)
    : [];

  return (
    <div>
      <h2>주문 내역 (user_id: {userId})</h2>
      <input
        type="number"
        value={inputUserId}
        onChange={handleChange}
        placeholder="유저ID 입력"
      />

      <ul>
        {/* {dummyOrders.map((order) => ( */}
        {myOrders.length === 0 ? (
          <li>주문 내역이 없습니다.</li>
        ) : (
          myOrders.map((order) => (
            <li key={order.id}>
              주문번호 : {order.room_id}
              <br />
              주문 음식 : {order.item}
              <br />
              가격 : {order.price}원<br />
              가게 id : {order.store_id}
              <br />
              주문날짜 : {order.date}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
