import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import supabase from "../../config/supabaseClient";
import style from './GonguModel.module.css'; 
import Header from "../../components/Header";

const GroupBuyComplete = () => {
  const { room_id } = useParams();

  const [orders, setOrders] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [roomInfo, setRoomInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // 1. 주문 내역 불러오기
      const { data: orderData, error: orderError } = await supabase
        .from('order')
        .select(`
          order_id,
          room_id,
          total_price,
          menu:menu_id (
            menu_name
          )
        `)
        .eq('room_id', room_id);

      if (orderError) {
        console.error("주문 데이터 오류:", orderError.message);
      } else {
        setOrders(orderData);
      }

      // 2. 결제 금액 불러오기 (모든 주문의 총액 ÷ 인원 수)
      const { data: roomData, error: roomError } = await supabase
        .from('room')
        .select('max_people')
        .eq('room_id', room_id)
        .single();

      if (roomError) {
        console.error("룸 데이터 오류:", roomError.message);
      } else {
        setRoomInfo(roomData);
      }

      if (orderData && roomData) {
        const total = orderData.reduce((sum, o) => sum + (o.total_price || 0), 0);
        const individual = total / roomData.max_people;
        setPaymentAmount(individual);
      }
    };

    fetchData();
  }, [room_id]);

  const handlePaymentClick = (e) => {
    e.preventDefault();
    alert('결제 페이지로 이동합니다.');
    // window.location.href = `/payment/${room_id}`;
  };

  return (
    <>
    <Header/>
    <div className={style["group-buy-container"]}>
      <div className={style["group-buy-header"]}>공구 완료 안내</div>

      <div className={style["group-buy-content-section"]}>
        <div className={style["group-buy-success-message"]}>
          목표 인원 달성 성공! ({roomInfo?.max_people}명 모집 완료)
        </div>
      </div>

      <div className={style["group-buy-divider"]} />

      <div className={style["group-buy-content-section"]}>
        <div className={style["group-buy-section-title"]}>주문 내역</div>
        <ul className={style["group-buy-order-list"]}>
          {orders.map((order) => (
            <li key={order.order_id}>
              {order.menu?.menu_name || "알 수 없음"} - {order.total_price.toLocaleString()}원
            </li>
          ))}
        </ul>
      </div>

      <div className={style["group-buy-divider"]} />

      <div className={style["group-buy-content-section"]}>
        <div className={style["group-buy-section-title"]}>결제 안내</div>
        <div className={style["group-buy-payment-info"]}>
          개별 결제 금액: <strong>{Math.round(paymentAmount).toLocaleString()}원</strong>
        </div>
        <button 
          className={style["group-buy-payment-button"]} 
          onClick={handlePaymentClick}
        >
          결제 페이지로 이동하기
        </button>
      </div>

      <div className={style["group-buy-divider"]} />

      <div className={style["group-buy-content-section"]}>
        <div className={style["group-buy-notification"]}>
          배달 상황은 채팅방에서 공유드리겠습니다.
        </div>
      </div>
    </div>
    </>
  );
};

export default GroupBuyComplete;
