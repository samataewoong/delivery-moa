import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from "../../config/supabaseClient";
import style from './OrderModel.module.css'; 
import Header from "../../components/Header";
import thousands from 'thousands';
import selectRoom from "../../functions/room/SelectRoom";

const OrderComplete = () => {
  const { order_id } = useParams();
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        // 1. 주문 기본 정보 조회
        const { data: orderData, error: orderError } = await supabase
          .from('order')
          .select('*')
          .eq('order_id', order_id)
          .single();

        if (orderError) throw orderError;

        // 2. 공구방 정보 조회 (selectRoom 함수 사용)
        if (orderData.room_id) {
          try {
            const roomData = await selectRoom({ room_id: orderData.room_id });
            if (roomData.length > 0) {
              setRoomInfo(roomData[0]);
            }
          } catch (roomError) {
            console.error('공구방 정보 조회 오류:', roomError);
          }
        }

        // 3. 주문 항목 파싱
        let items = [];
        if (orderData.room_order) {
          try {
            items = typeof orderData.room_order === 'string' 
              ? JSON.parse(orderData.room_order) 
              : orderData.room_order;
            
            if (!Array.isArray(items)) {
              items = [items];
            }
          } catch (parseError) {
            console.error('JSON 파싱 오류:', parseError);
            items = [];
          }
        }

        // 4. 메뉴 상세 정보 조회
        const menuIds = items.map(item => item.menu_id).filter(Boolean);
        let menus = [];
        
        if (menuIds.length > 0) {
          const { data: menuData, error: menuError } = await supabase
            .from('menu')
            .select('*')
            .in('menu_id', menuIds);
          
          if (!menuError) {
            menus = menuData;
          }
        }

        // 5. 메뉴 정보와 주문 항목 결합
        const combinedItems = items.map(item => {
          const menuInfo = menus.find(m => m.menu_id === item.menu_id) || {};
          return {
            ...item,
            menu_name: item.menu_name || menuInfo.menu_name,
            menu_price: item.menu_price || menuInfo.menu_price
          };
        });

        setOrderDetails(orderData);
        setOrderItems(combinedItems);
        setLoading(false);
      } catch (err) {
        console.error('주문 조회 중 오류:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [order_id]);

  const goToGroupPurchase = () => {
    if (orderDetails?.room_id) {
      navigate(`/room/${orderDetails.room_id}`);
    }
  };

  const goToHome = () => {
    navigate('/mainpage');
  };

  const goToReview = () => {
  if (orderDetails?.room_id) {
    navigate(`/review/${orderDetails.room_id}`);
  } else {
    alert("room_id가 존재하지 않아 리뷰 페이지로 이동할 수 없습니다.");
  }
};

  if (loading) return <div className={style.loading}>주문 정보를 불러오는 중...</div>;
  if (error) return <div className={style.error}>오류 발생: {error}</div>;

  return (
    <>
      <Header />
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
                <span className={style.infoLabel}>공구방 ID: </span>
                <span className={style.infoValue}>{orderDetails.room_id}</span>
              </div>
              <div className={style.infoRow}>
                <span className={style.infoLabel}>공구방 이름: </span>
                <span className={style.infoValue}>
                  {roomInfo?.room_name || '공구방 이름 없음'}
                </span>
              </div>
              <div className={style.infoRow}>
                <span className={style.infoLabel}>주문 번호: </span>
                <span className={style.infoValue}>{orderDetails.order_id}</span>
              </div>
              <div className={style.infoRow}>
                <span className={style.infoLabel}>주문 일자: </span>
                <span className={style.infoValue}>
                  {new Date(orderDetails.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className={style.orderItems}>
            <h3>주문 내역</h3>
            {orderItems.length > 0 ? (
              orderItems.map((item, idx) => (
                <div key={idx} className={style['order-item']}>
                  <div>{item.menu_name || `메뉴 ${idx + 1}`}</div>
                  <div className={style.menu_quantity}>{item.quantity ? `${item.quantity}개` : ''}</div>
                  <div>{thousands(item.menu_price || 0)}원</div>
                </div>
              ))
            ) : (
              <div className={style.noItems}>주문한 메뉴가 없습니다.</div>
            )}
          </div>

          <div className={style.total}>
            <strong>총 금액: {thousands(orderDetails?.total_price || 0)}원</strong>
          </div>
        </div>

        <div className={style.notice}>
          <p>
            <i className="fas fa-info-circle"></i> 주문이 만족스러웠다면 리뷰 또는 평가를 남겨주세요.
          </p>
        </div>

        <div className={style.buttons}>
          <button 
            className={`${style.btn} ${style["btn-primary"]}`} 
            onClick={goToGroupPurchase}
          >
            공구방 바로가기
          </button>
          <button 
            className={`${style.btn} ${style["btn-secondary"]}`} 
            onClick={goToHome}
          >
            홈으로
          </button>
          <button 
            className={`${style.btn} ${style["btn-review"]}`} 
            onClick={goToReview}
          >
            리뷰작성
          </button>
        </div>
      </div>
    </>
  );
};

export default OrderComplete;