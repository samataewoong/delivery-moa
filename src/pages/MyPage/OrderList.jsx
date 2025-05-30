import { useState, useEffect } from "react";
import supabase from "../../config/supabaseClient";

export default function OrderList() {
  const [userId, setUserId] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openOrderIds, setOpenOrderIds] = useState([]); //펼쳐진 주문 id배열

  //로그인된 유저 정보 가져옴
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      setUserId(error || !user ? "" : user.id);
      //   if (error || !user) {
      //     setUserId(""); //로그인 안 됐거나 에러
      //   } else {
      //     setUserId(user.id); //uuid
      //   }
    };
    fetchUser();
  }, []);

  // 내 주문내역 불러오기.
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setOrders([]);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("order")
        .select("*")
        .eq("user_id", userId);

      //   if (error) setOrders([]);
      // else setOrders(data);
      setOrders(error ? [] : data);
      setLoading(false);
    };
    fetchOrders();
  }, [userId]);

  //펼치기 핸들러
  const toggleOrder = (order_id) => {
    setOpenOrderIds((prev) =>
      prev.includes(order_id)
        ? prev.filter((id) => id !== order_id)
        : [...prev, order_id]
    );
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", margin: "16px 0" }}>내 주문 내역</h2>
      {loading ? (
        <p>불러오는 중...</p>
      ) : orders.length === 0 ? (
        <p>주문 내역이 없습니다.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {orders.map((order) => {
            const total = (order.room_order || []).reduce(
              (sum, item) => sum + item.menu_price * item.quantity,
              0
            );
            return (
              <li
                key={order.order_id}
                style={{
                  marginBottom: "18px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "18px",
                  background: "#f9f9fa",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {/* 카드 헤더: 가게/방/총액/생성일 등 요약 */}
                <div
                  onClick={() => toggleOrder(order.order_id)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <b style={{ fontSize: "1.1rem" }}>
                      {order.store_id}번 가게 | 방 {order.room_id}
                    </b>
                    <div style={{ color: "#555", fontSize: "0.95rem" }}>
                      주문번호: {order.order_id}
                      &nbsp;|&nbsp; 생성일:{" "}
                      {order.created_at?.slice(0, 16).replace("T", " ")}
                    </div>
                  </div>
                  <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                    {total}원
                  </span>
                  <span
                    style={{
                      marginLeft: 10,
                      color: "#0056b3",
                      fontSize: "0.95rem",
                    }}
                  >
                    {openOrderIds.includes(order.order_id)
                      ? "▲ 접기"
                      : "▼ 펼치기"}
                  </span>
                </div>
                {/* 펼치기 영역: 메뉴 상세 */}
                {openOrderIds.includes(order.order_id) && (
                  <div style={{ marginTop: "12px" }}>
                    <ul
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: "disc inside",
                      }}
                    >
                      {(order.room_order || []).length === 0 ? (
                        <li style={{ color: "#888" }}>주문 메뉴가 없습니다.</li>
                      ) : (
                        (order.room_order || []).map((item, idx) => (
                          <li key={idx} style={{ marginBottom: "4px" }}>
                            <b>{item.menu_name}</b>
                            &nbsp;({item.menu_price}원 × {item.quantity}개)
                            &nbsp;=&nbsp;
                            <b>{item.menu_price * item.quantity}원</b>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
//   return (
//     <div>
//       <h2>내 주문 내역</h2>
//       {loading ? (
//         <p> 불러오는 중...</p>
//       ) : orders.length === 0 ? (
//         <p>주문 재녁이 없습니다.</p>
//       ) : (
//         orders.map((order) => (
//           <li key={order.order_id}>
//             주문번호: {order.order_id}
//             <br />방 ID: {order.room_id}
//             <br />
//             가게 ID: {order.store_id}
//             <br />
//             주문상세:
//             <ul>
//               {(order.room_order || []).map((item, idx) => (
//                 <li key={idx}>
//                   메뉴: {item.menu_name} <br />
//                   수량: {item.quantity}개 <br />
//                   가격: {item.menu_price}원 <br />
//                   소계: {item.menu_price * item.quantity}원
//                 </li>
//               ))}
//             </ul>
//             결제 금액:{" "}
//             {(order.room_order || []).reduce(
//               (sum, item) => sum + item.menu_price * item.quantity,
//               0
//             )}
//             원<br />
//           </li>
//         ))
//       )}
//     </div>
//   );
// }
