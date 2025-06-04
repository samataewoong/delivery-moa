import { useState, useEffect } from "react";
import supabase from "../../config/supabaseClient";

export default function OrderList() {
  const [userId, setUserId] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  //로그인된 유저 uuid 가져옴
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setUserId(""); //로그인 안 됐거나 에러
      } else {
        setUserId(user.id); //uuid
      }
    };
    fetchUser();
  }, []);

  // userId가 설정 -> 주문내역
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId.trim()) {
        setOrders([]);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("order")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("주문 불러오기 에러:", error);
        setOrders([]);
      } else {
        setOrders(data);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [userId]);

  return (
    <div>
      <h2>내 주문 내역</h2>
      {loading ? (
        <p> 불러오는 중...</p>
      ) : orders.length === 0 ? (
        <p>주문 재녁이 없습니다.</p>
      ) : (
        orders.map((order) => {
          // 각 주무의 room_order 내 uuid 일치 항목 찾기
          const myOrderItems = (order.room_order || []).filter(
            (item) => item.uuid === userId
          );

          //내 주문 합계
          const myTotal = myOrderItems.reduce(
            (sum, item) => sum + item.menu_price * item.quantity,
            0
          );

          return (
            <li key={order.order_id}>
              주문번호: {order.order_id}
              <br />방 ID: {order.room_id}
              <br />
              가게 ID: {order.store_id}
              <br />
              내가 결제한 금액: {myTotal}원<br />
              주문상세:
              <ul>
                {myOrderItems.length === 0 ? (
                  <li>이 주문에 내 주문 데이터 없음</li>
                ) : (
                  myOrderItems.map((item, idx) => (
                    <li key={idx}>
                      메뉴: {item.menu_name} <br />
                      수량: {item.quantity}개 <br />
                      가격: {item.menu_price}원 <br />
                      소계: {item.menu_price * item.quantity}원
                    </li>
                  ))
                )}
              </ul>
              생성일: {order.created_at}
            </li>
          );
        })
      )}
    </div>
  );
}
