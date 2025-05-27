import React from 'react';
import './GonguModel.css'; //

const GroupBuyComplete = () => {
  const handlePaymentClick = (e) => {
    e.preventDefault();
    alert('결제 페이지로 이동합니다.');
    // 실제 구현에서는 결제 페이지로 리다이렉트
    // window.location.href = '/payment';
  };

  return (

    <div className="group-buy-container">
      <div className="group-buy-header">공구 완료 안내</div>
      
      <div className="group-buy-content-section">
        <div className="group-buy-success-message">목표 인원 달성 성공! (7/5명)</div>
      </div>
      
      <div className="group-buy-divider" />
      
      <div className="group-buy-content-section">
        <div className="group-buy-section-title">주문 내역</div>
        <ul className="group-buy-order-list">
          <li>음식 A: 3개</li>
          <li>음식 B: 2개</li>
          <li>음식 C: 2개</li>
        </ul>
      </div>
      
      <div className="group-buy-divider" />
      
      <div className="group-buy-content-section">
        <div className="group-buy-section-title">결제 안내</div>
        <div className="group-buy-payment-info">
          개별 결제 금액: <strong>12,500원</strong>
        </div>
        <button 
          className="group-buy-payment-button" 
          onClick={handlePaymentClick}
        >
          결제 페이지로 이동하기
        </button>
      </div>
      
      <div className="group-buy-divider" />
      
      <div className="group-buy-content-section">
        <div className="group-buy-notification">배달 상황은 채팅방에서 공유드리겠습니다.</div>
      </div>
    </div>
  );
};

export default GroupBuyComplete;