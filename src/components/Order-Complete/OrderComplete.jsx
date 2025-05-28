import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from "../../config/supabaseClient";
import style from'./OrderModel.module.css'; 

const OrderComplete = () => {
  const { order_id } = useParams();
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('order')
        .select(`
          *,
          menu:menu_id (
            menu_name,
            menu_price
          )
        `)
        .eq('order_id', order_id)
        .single();

      if (error) {
        console.error('주문 정보 조회 오류:', error.message);
        return;
      }

      setOrderDetails(data);
      setOrderItems([data.menu]); // 단일 메뉴 기준
      setTotalPrice(data.total_price || 0);
    };

    fetchOrder();
  }, [order_id]);

  const goToGroupPurchase = () => {
    if (orderDetails?.room_id) {
      navigate(`/room/${orderDetails.room_id}`);
    }
  };

  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className={style.container}>
      <div className={style.header}>
        <i className="fas fa-check-circle"></i>
        <h1>주문이 완료되었습니다!</h1>
      </div>

      <div className={style.orderInfo}>
        <h2>주문 정보</h2>
        {orderDetails && (
          <div className={style.orderDetails}>
            <div className={style.infoRow}>
              <span className={style.infoLabel}>공구방 ID</span>
              <span className={style.infoValue}>{orderDetails.room_id}</span>
            </div>
            <div className={style.infoRow}>
              <span className={style.infoLabel}>주문 일자</span>
              <span className={style.infoValue}>
                {new Date(orderDetails.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        )}

         <div className={style.orderItems}> 
          {orderItems.map((item, idx) => (
            <div key={idx} className={style.orderItem}>
              <span>{item.menu_name}</span>
              <span>{item.menu_price.toLocaleString()}원</span>
            </div>
          ))}
        </div>

        <div className={style.total}>
          총 금액: {totalPrice.toLocaleString()}원
        </div>
      </div>

      <div className={style.notice}>
        <p>
          <i className="fas fa-info-circle"></i> 주문이 만족스러웠다면 리뷰 또는 평가를 남겨주세요.
        </p>
      </div>

      <div className={style.buttons}>
        <button className={[style["btn"],style["btn-primary"]].join(' ')} 
        onClick={goToGroupPurchase}>
          공구방 바로가기
        </button>
        <button className={[style["btn"],style["btn-secondary"]].join(' ')}
         onClick={goToHome}>
          홈으로
        </button>
      </div>
    </div>
  );
};

export default OrderComplete;
