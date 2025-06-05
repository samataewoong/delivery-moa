import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './GonguModel.module.css';
import supabase from "../../config/supabaseClient";
import selectRoom from "../../functions/room/SelectRoom";
import thousands from 'thousands';

const GonguComplete = () => {
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
        
        const { data: orderData, error: orderError } = await supabase
          .from('order')
          .select('*')
          .eq('order_id', order_id)
          .single();

        if (orderError) throw orderError;

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
    } else {
      navigate('/mainpage');
    }
  };

  const goToReview = () => {
    if (orderDetails?.room_id) {
      navigate(`/review/${orderDetails.room_id}`);
    } else {
      alert("room_id가 존재하지 않아 리뷰 페이지로 이동할 수 없습니다.");
    }
  };

  if (loading) return <div className={styles.loading}>주문 정보를 불러오는 중...</div>;
  if (error) return <div className={styles.error}>오류 발생: {error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <i className={`fas fa-check-circle ${styles.checkmark}`}></i>
        <h1 className={styles.title}>공구 주문이 완료되었습니다!</h1>
      </div>
      
      <p className={styles.description}>주문해주셔서 감사합니다. 배달이 완료되었습니다.</p>
      
      <div className={styles.orderInfo}>
        <h2>주문 정보</h2>
        <div className={styles.infoRow}>
          <div className={styles.infoLabel}>주문번호</div>
          <div className={styles.infoValue}>{orderDetails?.order_id || 'N/A'}</div>
        </div>
        <div className={styles.infoRow}>
          <div className={styles.infoLabel}>공구명</div>
          <div className={styles.infoValue}>{roomInfo?.room_name || '공구방 이름 없음'}</div>
        </div>
        
        {orderItems.map((item, index) => (
          <React.Fragment key={index}>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>주문상품</div>
              <div className={styles.infoValue}>{item.menu_name || `메뉴 ${index + 1}`}</div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>주문수량</div>
              <div className={styles.infoValue}>{item.quantity ? `${item.quantity}개` : '수량 정보 없음'}</div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>상품금액</div>
              <div className={styles.infoValue}>{thousands(item.menu_price || 0)}원</div>
            </div>
          </React.Fragment>
        ))}
        
        <div className={styles.infoRow}>
          <div className={styles.infoLabel}>총 금액</div>
          <div className={styles.infoValue}>{thousands(orderDetails?.total_price || 0)}원</div>
        </div>
        <div className={styles.infoRow}>
          <div className={styles.infoLabel}>배달완료</div>
          <div className={styles.infoValue}>
            {orderDetails?.delivered_at 
              ? new Date(orderDetails.delivered_at).toLocaleString() 
              : '배달 완료 시간 정보 없음'}
          </div>
        </div>
      </div>
      
      <button 
        className={styles.button} 
        onClick={goToReview}
      >
        리뷰 작성하기
      </button>
      <button 
        className={`${styles.button} ${styles.buttonSecondary}`} 
        onClick={goToGroupPurchase}
      >
        공구방 바로가기
      </button>
    </div>
  );
};

export default GonguComplete;