import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './GonguModel.module.css';
import supabase from "../../config/supabaseClient";
import selectRoom from "../../functions/room/SelectRoom";
import thousands from 'thousands';

const GonguComplete = () => {
  const { room_id } = useParams(); // ✅ room_id 기반으로 변경
  const navigate = useNavigate();

  const [roomInfo, setRoomInfo] = useState(null);
  const [participants, setParticipants] = useState([]); // [{ user_id, nickname, orders: [...] }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!room_id) throw new Error('room_id가 필요합니다.');

        // 1. 공구방 정보 조회
        const roomData = await selectRoom({ room_id });
        if (roomData.length > 0) setRoomInfo(roomData[0]);

        // 2. order 테이블에서 room_id 기준 전체 주문 조회
        const { data: orders, error: orderError } = await supabase
          .from('order')
          .select('*')
          .eq('room_id', room_id);

        if (orderError) throw orderError;

        // 3. 주문 내역 파싱 및 menu_id/user_id 수집
        const userIdSet = new Set();
        const menuIdSet = new Set();

        orders.forEach(order => {
          userIdSet.add(order.user_id);

          let parsed = [];
          try {
            parsed = typeof order.room_order === 'string'
              ? JSON.parse(order.room_order)
              : order.room_order;
            if (!Array.isArray(parsed)) parsed = [parsed];
          } catch {
            parsed = [];
          }

          order.parsedItems = parsed;

          parsed.forEach(item => {
            if (item.menu_id) menuIdSet.add(item.menu_id);
          });
        });

        // 4. 메뉴 정보 조회
        let menus = [];
        const menuIds = Array.from(menuIdSet);
        if (menuIds.length > 0) {
          const { data: menuData, error: menuError } = await supabase
            .from('menu')
            .select('id, menu_name, menu_price')
            .in('id', menuIds);
          if (!menuError) menus = menuData;
        }

        // 5. 사용자 닉네임 조회
        let userProfiles = [];
        const userIds = Array.from(userIdSet);
        if (userIds.length > 0) {
          const { data: userData, error: userError } = await supabase
            .from('user')
            .select('id, nickname')
            .in('id', userIds);
          if (!userError) userProfiles = userData;
        }

        const getUserName = (userId) => {
          const user = userProfiles.find(u => u.id === userId);
          return user?.nickname || '이름 없음';
        };

        // 6. 메뉴 정보 매핑
        orders.forEach(order => {
          order.items = order.parsedItems.map(item => {
            const menuInfo = menus.find(m => m.id === item.menu_id) || {};
            return {
              ...item,
              menu_name: item.menu_name || menuInfo.menu_name,
              menu_price: item.menu_price || menuInfo.menu_price
            };
          });
        });

        // 7. 유저별로 주문 그룹화
        const grouped = new Map();
        orders.forEach(order => {
          const userId = order.user_id;
          const nickname = getUserName(userId);

          if (!grouped.has(userId)) {
            grouped.set(userId, {
              user_id: userId,
              nickname,
              orders: []
            });
          }

          grouped.get(userId).orders.push(order);
        });

        setParticipants(Array.from(grouped.values()));
        setLoading(false);
      } catch (err) {
        console.error('에러 발생:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [room_id]);

  const goToGroupPurchase = () => {
    if (roomInfo?.id) {
      navigate(`/room/${roomInfo.id}`);
    } else {
      navigate('/mainpage');
    }
  };

  const goToReview = () => {
    if (roomInfo?.id) {
      navigate(`/review/${roomInfo.id}`);
    } else {
      alert("room_id가 없어 리뷰 페이지로 이동할 수 없습니다.");
    }
  };

  if (loading) return <div className={styles.loading}>주문 정보를 불러오는 중...</div>;
  if (error) return <div className={styles.error}>오류 발생: {error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <i className={`fas fa-check-circle ${styles.checkmark}`}></i>
        <h1 className={styles.title}>공구가 완료되었습니다!</h1>
      </div>
      
      <p className={styles.description}>공구방 배달이 완료되었습니다. 전체 주문 내역을 확인하세요.</p>

      <div className={styles.orderInfo}>
        <h2>공구방 정보</h2>
        <div className={styles.infoRow}>
          <div className={styles.infoLabel}>공구방 이름</div>
          <div className={styles.infoValue}>{roomInfo?.room_name || '공구방 이름 없음'}</div>
        </div>

        <h2>참여자별 주문 내역</h2>
        {participants.map(part => (
          <div key={part.user_id} className={styles.participantCard}>
            <h3>{part.nickname} 님의 주문</h3>

            {part.orders.map(order => (
              <div key={order.order_id} className={styles.orderCard}>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>주문번호</div>
                  <div className={styles.infoValue}>{order.order_id}</div>
                </div>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>주문 일자</div>
                  <div className={styles.infoValue}>
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>총 금액</div>
                  <div className={styles.infoValue}>{thousands(order.total_price || 0)}원</div>
                </div>

                <h4>상품 내역</h4>
                {order.items.map((item, i) => (
                  <div key={i} className={styles.itemCard}>
                    <div className={styles.infoRow}>
                      <div className={styles.infoLabel}>상품명</div>
                      <div className={styles.infoValue}>{item.menu_name}</div>
                    </div>
                    <div className={styles.infoRow}>
                      <div className={styles.infoLabel}>수량</div>
                      <div className={styles.infoValue}>{item.quantity}개</div>
                    </div>
                    <div className={styles.infoRow}>
                      <div className={styles.infoLabel}>금액</div>
                      <div className={styles.infoValue}>{thousands(item.menu_price)}원</div>
                    </div>
                  </div>
                ))}
                <hr />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.notice}>
        <p><i className="fas fa-info-circle"></i> 주문이 만족스러웠다면 리뷰를 남겨주세요!</p>
      </div>

      <button className={styles.button} onClick={goToReview}>
        리뷰 작성하기
      </button>
      <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={goToGroupPurchase}>
        공구방 바로가기
      </button>
    </div>
  );
};

export default GonguComplete;
