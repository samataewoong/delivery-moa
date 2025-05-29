import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from "../../config/supabaseClient";
import styles from './ReviewModel.module.css';
import { FaStar } from 'react-icons/fa';
import Header from "../../components/Header";


const ReviewComponent = () => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [orderInfo, setOrderInfo] = useState({
    item: '',
    user: '',
    date: ''
  });

  useEffect(() => {
    // 주문 정보 로딩 (실제로는 API 호출)
    loadOrderInfo();
  }, []);

  useEffect(() => {
    setCharCount(reviewText.length);
  }, [reviewText]);

  const loadOrderInfo = () => {
    // 실제로는 API에서 데이터를 가져와야 함
    const orderData = {
      item: "배달 공구 - 신선한 과일 세트",
      user: "김공구",
      date: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    setOrderInfo(orderData);
  };

  const handleRatingChange = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleReviewChange = (e) => {
    const text = e.target.value;
    if (text.length <= 500) {
      setReviewText(text);
    }
  };

  const handleSubmit = () => {
    if (rating === 0 || reviewText.length < 10) {
      alert('별점을 선택하고 리뷰를 10자 이상 작성해주세요.');
      return;
    }

    // 실제로는 API 호출로 대체
    console.log('제출된 리뷰:', { rating, reviewText });
    alert(`별점 ${rating}점과 리뷰가 제출되었습니다!\n\n${reviewText}`);
    
    // 제출 후 처리 (예: 페이지 이동)
    // window.location.href = '/order-complete';
  };

  return (
    <>
    <Header/>
    <div className={styles.reviewContainer}>
      <div className={styles.reviewHeader}>
        <h2>회원 평가 작성</h2>
        <p>공구 주문자에 대한 솔직한 평가를 남겨주세요</p>
      </div>
      
      <div className={styles.orderInfo}>
        <p><strong>주문 상품:</strong> {orderInfo.item}</p>
        <p><strong>주문자:</strong> {orderInfo.user}</p>
        <p><strong>주문 일시:</strong> {orderInfo.date}</p>
      </div>
      
      <div className={styles.ratingSection}>
        <h3>이 공구 주문자에 대한 만족도는 어떠셨나요?</h3>
        <div className={styles.stars}>
          {[5, 4, 3, 2, 1].map((star) => (
            <React.Fragment key={star}>
              <input
                type="radio"
                id={`star${star}`}
                name="rating"
                value={star}
                checked={rating === star}
                onChange={() => handleRatingChange(star)}
              />
              <label htmlFor={`star${star}`}>
                <FaStar 
                  className={`${styles.starIcon} ${rating >= star ? styles.active : ''}`} 
                />
              </label>
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <div className={styles.reviewContent}>
        <h3>상세 평가 내용</h3>
        <textarea
          value={reviewText}
          onChange={handleReviewChange}
          placeholder="공구 주문자에 대한 상세한 평가를 작성해주세요. (최소 10자 이상)"
          className={styles.reviewTextarea}
        />
        <div className={styles.charCount}>{charCount}/500자</div>
      </div>
      
      <button
        className={`${styles.submitBtn} ${rating > 0 && charCount >= 10 ? '' : styles.disabled}`}
        onClick={handleSubmit}
        disabled={rating === 0 || charCount < 10}
      >
        평가 제출하기
      </button>
    </div>
    </>
  );
};

export default ReviewComponent;