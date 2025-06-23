import { useState, useEffect } from "react";
import supabase from "../../config/supabaseClient";
import styles from "./MyPage.module.css";

export default function OrderList() {
  const [userId, setUserId] = useState("");

  const [openOrderIds, setOpenOrderIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [orders, setOrders] = useState([]);

  const itemsPerPage = 5;

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      setUserId(error || !user ? "" : user.id);
    };
    fetchUser();
  }, []);

  //총 주문 갯수 얻기 (페이지 버튼 갯수 계산용)
  useEffect(() => {
    if (!userId) return;
    const fetchCount = async () => {
      const { count } = await supabase
        .from("order")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      setTotalCount(count || 0);
    };
    fetchCount();
  }, [userId]);

  //현재 페이지 데이터만 fetch
  useEffect(() => {
    if (!userId) return;
    const fetchOrders = async () => {
      const from = currentPage * itemsPerPage;
      const to = from + itemsPerPage - 1;
      const { data, error } = await supabase
        .from("order")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to);
      setOrders(error ? [] : data);
    };
    fetchOrders();
  }, [userId, currentPage]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  //펼치기 핸들러
  const toggleOrder = (order_id) => {
    setOpenOrderIds((prev) =>
      prev.includes(order_id)
        ? prev.filter((id) => id !== order_id)
        : [...prev, order_id]
    );
  };

  return (
    <div className="styles.order_body">
      {orders.length === 0 ? (
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
                    {total.toLocaleString()}원
                  </span>
                  <span
                    style={{
                      marginLeft: 10,
                      color: "#ff6b6b",
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
                            &nbsp;({item.menu_price.toLocaleString()}원 ×{" "}
                            {item.quantity}개) &nbsp;=&nbsp;
                            <b>
                              {(
                                item.menu_price * item.quantity
                              ).toLocaleString()}
                              원
                            </b>
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

      {/* {페이지네이션 버튼} */}
      {totalPages > 1 && (
        <div className={styles.qnaPages}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
            disabled={currentPage === 0}
          >
            이전
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              style={{
                fontWeight: currentPage === i ? "bold" : "normal",
                margin: "0 2px",
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages - 1))
            }
            disabled={currentPage === totalPages - 1}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
