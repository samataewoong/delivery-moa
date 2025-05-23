//order Table column - room.id / store.id / room_order / total_price / created_at / user.id / id

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
];

export default function OrderList() {
  const myOrders = dummyOrders.filter((order) => order.user_id === userId);

  return (
    <div>
      <h2>주문 내역</h2>
      <ul>
        {dummyOrders.map((order) => (
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
        ))}
      </ul>
    </div>
  );
}
