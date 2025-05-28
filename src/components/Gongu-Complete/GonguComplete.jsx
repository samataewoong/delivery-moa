import React from 'react';
import style from './GonguModel.module.css'; 

const GroupBuyComplete = () => {
  const handlePaymentClick = (e) => {
    e.preventDefault();
    alert('결제 페이지로 이동합니다.');
  };

  return (
    <div className={style["group-buy-container"]}>
      <div className={style["group-buy-header"]}>공구 완료 안내</div>

      <div className={style["group-buy-content-section"]}>
        <div className={style["group-buy-success-message"]}>목표 인원 달성 성공! (7/5명)</div>
      </div>

      <div className={style["group-buy-divider"]} />

      <div className={style["group-buy-content-section"]}>
        <div className={style["group-buy-section-title"]}>주문 내역</div>
        <ul className={style["group-buy-order-list"]}>
          <li>음식 A: 3개</li>
          <li>음식 B: 2개</li>
          <li>음식 C: 2개</li>
        </ul>
      </div>

      <div className={style["group-buy-divider"]} />

      <div className={style["group-buy-content-section"]}>
        <div className={style["group-buy-section-title"]}>결제 안내</div>
        <div className={style["group-buy-payment-info"]}>
          개별 결제 금액: <strong>12,500원</strong>
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
  );
};

export default GroupBuyComplete;
