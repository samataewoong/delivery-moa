import React from 'react';
import './OrderModel.css';

const OrderComplete = () => {
  const goToGroupPurchase = () => {
    alert('공구방으로 이동합니다');
    //window.location.href = '/';
  };

  const goToHome = () => {
    alert('홈으로 이동합니다');
    //window.location.href = '/';
  };

  return (
    <div className="container">
      <div className="header">
        <i className="fas fa-check-circle"></i>
        <h1>주문이 완료되었습니다!</h1>
      </div>

      <div className="order-info">
        <h2>주문 정보</h2>
        <div id="orderDetails">{/* 동적 주문 정보 */}</div>
        <div className="order-items" id="orderItems">{/* 주문 항목 */}</div>
        <div className="total" id="orderTotal">{/* 총 금액 */}</div>
      </div>

      <div className="notice">
        <p>
          <i className="fas fa-info-circle"></i> 주문이 만족스러웠다면 리뷰 또는 평가를  남겨주세요.
        </p>
      </div>

      <div className="buttons">
        <button className="btn btn-primary" onClick={goToGroupPurchase}>
          공구방 바로가기
        </button>
        <button className="btn btn-secondary" onClick={goToHome}>
          홈으로
        </button>
      </div>
    </div>
  );
};

export default OrderComplete;
