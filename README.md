# 배달 공구(공동구매) 사이트 기획서

## 1. 프로젝트 개요

### 1.1 프로젝트명
"배달모아"

### 1.2 기획 의도 및 목적
- 배달비 절감을 위한 공동구매 플랫폼 제공
- 동일 지역 내 사용자들의 커뮤니티 활성화
- 1인 가구의 배달비 효용 증대

### 1.3 주요 기능 요약
- 위치 기반 공구방 생성 및 참여
- 실시간 채팅 시스템
- 카테고리별 음식점 및 공구방 검색/필터링
- 사용자 프로필 및 평가 시스템

## 2. 주요 기능 상세

### 2.1 사용자 관리
- 회원가입/로그인 (일반, 소셜 로그인)
- 사용자 프로필 관리 (닉네임, 프로필 이미지, 선호 음식)
- 위치 정보 설정 및 관리 (기본 주소, 대략적 위치)

### 2.2 메인 화면
- 음식 카테고리 표시 (한식, 중식, 일식, 양식, 분식, 카페/디저트 등)
- 현재 내 주변에서 진행 중인 인기 공구방 하이라이트
- 최근 이용한 음식점 및 공구방 퀵 액세스

- ### 2.3 지도 화면
- Kakao map 지도 표시
- 지도상 마커를 통한 사용자 위치 및 공구방 위치 표시
- 공구방 마커 클릭시 공구방 정보 오버레이 제공
- 진행중인 공구방 List와 해당 공구방 마커 클릭시 매치
- 실시간 사용자 위치 조정 및 가까운 거리의 공구방 자동 필터링  

### 2.4 공구방 목록 화면
- 선택한 카테고리의 음식점 목록 표시
- 해당 음식점에 대한 현재 진행 중인 공구방 표시
- 필터링 옵션 (거리순, 참여자 수, 마감 임박순 등)
- 새 공구방 생성 버튼

### 2.5 공구방 생성 기능
- 음식점 선택
- 최대 참여자 수 설정
- 최소 주문 금액 달성 여부 표시
- 간단한 방 소개 작성

### 2.6 공구방 상세 화면
- 공구방 정보 (음식점, 예상 주문 시간, 참여자 수 등)
- 참여자 목록 및 방장 표시
- 실시간 채팅 기능

### 2.7 주문 및 결제 과정
- 개인별 메뉴 선택 및 취합
- 결제 방식 선택 (각자 결제, 한 명이 대표 결제 후 정산)
- 주문 확정

### 2.8 배달 완료 및 후속 처리
- 배달 완료 확인
- 공구 참여자 평가
- 음식점 평가 및 리뷰

## 3. 기술 스택

### 3.1 프론트엔드
- React (Create React App 또는 Next.js)
- Redux (상태 관리)
- Styled-components
- React Router (라우팅)

### 3.2 백엔드
- Supabse / PostgreSQL (데이터베이스)
- JWT (인증)
- Kakaomap API (위치 기반 서비스)

### 3.3 배포 및 인프라
- GitHub Pages (정적 배포)

## 4. 데이터 구조

### 4.1 사용자 (User)
```javascript
{
  id: String,
  email: String,
  password: String (암호화),
  nickname: String,
  profileImage: String (URL),
  location: {
    address: String,
    coordinates: [Number, Number] // [longitude, latitude]
  },
  preferredCategories: [String],
  rating: Number,
  participationHistory: [RoomId],
  createdRooms: [RoomId]
}
```

### 4.2 공구방 (Room)
```javascript
{
  id: String,
  title: String,
  restaurant: {
    id: String,
    name: String,
    category: String,
    minOrderAmount: Number
  },
  host: UserId,
  participants: [UserId],
  maxParticipants: Number,
  status: String, // "모집중", "주문완료", "배달완료" 등
  orderTime: Date,
  location: {
    address: String,
    coordinates: [Number, Number]
  },
  locationOptions: [
    {
      address: String,
      votes: [UserId]
    }
  ],
  totalAmount: Number,
  messages: [MessageId],
  createdAt: Date,
  updatedAt: Date
}
```

### 4.3 메시지 (Message)
```javascript
{
  id: String,
  roomId: RoomId,
  userId: UserId,
  content: String,
  timestamp: Date,
  type: String // "text", "image", "system" 등
}
```

### 4.4 음식점 (Restaurant)
```javascript
{
  id: String,
  name: String,
  category: String,
  address: String,
  coordinates: [Number, Number],
  minOrderAmount: Number,
  deliveryFee: Number,
  menu: [
    {
      name: String,
      price: Number,
      description: String,
      image: String (URL)
    }
  ],
  rating: Number,
  reviews: [ReviewId]
}
```

## 5. 화면 설계

### 5.1 메인 페이지
- 상단 헤더: 로고, 검색창, 로그인/회원가입 버튼
- 음식 카테고리 그리드 (이미지와 함께 표시)
- 내 주변 활성화된 공구방 미리보기 (5-6개)
- 하단 푸터: 서비스 정보, 이용약관 등

### 5.2 카테고리별 음식점 & 공구방 목록
- 음식점 목록 (카드 형태로 표시)
- 음식점 이름, 별점, 최소 주문 금액, 배달비
- 현재 진행 중인 공구방 수 표시
- 공구방 목록 (음식점별로 그룹화)
- 방 제목, 참여자 수/최대 참여자 수
- 예상 주문 시간, 현재 주문 총액
- 우측 상단에 새 공구방 생성 버튼

### 5.3 지도 페이지
- 거리 필터링된 공구방List
- 지도 및 마커 표시
- 마커 클릭시 공구방 정보 overay

### 5.4 공구방 생성 화면
- 단계별 생성 프로세스
- 음식점 선택
- 방 제목 및 설명 입력
- 최대 참여자 수 설정
- 예상 주문 시간대 선택
- 배달 받을 기본 위치 선택

### 5.5 공구방 상세 화면
- 상단: 방 정보 (제목, 음식점, 참여자 수, 주문 예정 시간 등)
- 중앙 좌측: 참여자 목록
- 중앙 우측: 실시간 채팅창
- 하단: 배달 위치 투표 시스템
- 우측 사이드바: 메뉴 선택 및 주문 현황

### 5.6 사용자 프로필
- 기본 정보 (닉네임, 프로필 이미지)
- 참여 이력
- 평가 점수
- 기본 주소 설정

## 6. 구현 로드맵

### 6.1 1단계 
- 기본 사용자 관리 (회원가입/로그인)
- 카테고리별 음식점 목록 표시
- 공구방 생성 및 참여 기능
- 기본 채팅 기능

### 6.2 2단계
- 실시간 알림 시스템
- 위치 투표 기능
- 사용자 평가 시스템
- 메뉴 선택 및 공유 기능

### 6.3 3단계
- 결제 연동
- 배달 추적 시스템
- 리뷰 및 평점 시스템
- 모바일 최적화

### 6.4 4단계 (향후 확장)
- 음식점 제휴 시스템
- 배달앱 API 연동
- 정기 공구 시스템
- 레시피 공유 및 식재료 공구 확장

## 7. 리액트 컴포넌트 구조

### 7.1 공통 컴포넌트
- `<Header />`: 상단 네비게이션 바
- `<Footer />`: 하단 정보 영역
- `<CategoryCard />`: 음식 카테고리 표시
- `<RestaurantCard />`: 음식점 정보 카드
- `<RoomCard />`: 공구방 정보 카드
- `<Button />`: 다양한 스타일의 버튼
- `<Input />`: 입력 필드
- `<Modal />`: 팝업 모달
- `<Loading />`: 로딩 인디케이터

### 7.2 페이지 컴포넌트
- `<HomePage />`: 메인 페이지
- `<LoginPage />`: 로그인 페이지
- `<SignupPage />`: 회원가입 페이지
- `<CategoryPage />`: 카테고리별 음식점 목록
- `<RestaurantPage />`: 음식점 상세 정보
- `<RoomListPage />`: 공구방 목록
- `<RoomCreatePage />`: 공구방 생성
- `<RoomDetailPage />`: 공구방 상세 정보
- `<CloseRoomPage />`: 지도페이지

## 8. 주요 추가 고려사항

### 8.1 보안
- 사용자 인증 및 권한 관리
- 개인정보 보호 (위치 정보 등)
- 채팅 내용 암호화

### 8.2 UX/UI
- 직관적인 사용자 경험 설계
- 접근성 고려 (색상 대비)
- 
## 9. 기대 효과 및 비즈니스 모델

### 9.1 기대 효과
- 사용자 배달비 절감
- 소셜 커뮤니티 형성
- 1인 가구를 위한 경제적 배달 솔루션 제공
- 배달 과정에서의 환경 영향 감소

### 9.2 비즈니스 모델
- 제휴 음식점 광고 수익
- 프리미엄 회원제 (추가 기능 제공)
- 결제 시스템 연동 수수료
- 데이터 분석 및 마케팅 인사이트 제공

## 10. ERD(Entity Relationship Diagram)

### 10.1 주요 엔티티 및 관계

#### User (사용자)
- PK: userId
- 속성: email, password, nickname, profileImage, address, coordinates, rating
- 관계:
  - User 1:N Room (생성한 방)
  - User N:M Room (참여하는 방)
  - User 1:N Review (작성한 리뷰)
  - User 1:N UserEvaluation (평가 받은 내역)
  - User 1:N UserEvaluation (평가한 내역)
  - User 1:N Message (작성한 메시지)
  - User 1:N Order (주문 내역)

#### Room (공구방)
- PK: roomId
- FK: hostId (User 참조), restaurantId (Restaurant 참조)
- 속성: title, maxParticipants, status, orderTime, address, coordinates, totalAmount, createdAt, updatedAt
- 관계:
  - Room N:1 User (방장)
  - Room N:M User (참여자)
  - Room N:1 Restaurant (음식점)
  - Room 1:N Message (채팅 메시지)
  - Room 1:N LocationVote (위치 투표)
  - Room 1:1 Order (주문 정보)

#### Restaurant (음식점)
- PK: restaurantId
- 속성: name, category, address, coordinates, minOrderAmount, deliveryFee, rating
- 관계:
  - Restaurant 1:N Room (음식점 관련 공구방)
  - Restaurant 1:N MenuItem (메뉴 항목)
  - Restaurant 1:N Review (리뷰)

#### Message (메시지)
- PK: messageId
- FK: roomId (Room 참조), userId (User 참조)
- 속성: content, timestamp, type
- 관계:
  - Message N:1 Room (속한 방)
  - Message N:1 User (작성자)

#### MenuItem (메뉴 항목)
- PK: menuItemId
- FK: restaurantId (Restaurant 참조)
- 속성: name, price, description, image
- 관계:
  - MenuItem N:1 Restaurant (음식점)
  - MenuItem 1:N OrderItem (주문 항목)

#### Order (주문)
- PK: orderId
- FK: roomId (Room 참조)
- 속성: status, totalAmount, orderTime, deliveryTime
- 관계:
  - Order N:1 Room (공구방)
  - Order 1:N OrderItem (주문 항목)
  - Order N:M User (주문 참여자)

#### OrderItem (주문 항목)
- PK: orderItemId
- FK: orderId (Order 참조), menuItemId (MenuItem 참조), userId (User 참조)
- 속성: quantity, price
- 관계:
  - OrderItem N:1 Order (주문)
  - OrderItem N:1 MenuItem (메뉴 항목)
  - OrderItem N:1 User (주문한 사용자)

#### Review (리뷰)
- PK: reviewId
- FK: userId (User 참조), restaurantId (Restaurant 참조)
- 속성: content, rating, timestamp
- 관계:
  - Review N:1 User (작성자)
  - Review N:1 Restaurant (음식점)

#### UserEvaluation (사용자 평가)
- PK: evaluationId
- FK: evaluatorId (User 참조), evaluatedId (User 참조), roomId (Room 참조)
- 속성: rating, comment, timestamp
- 관계:
  - UserEvaluation N:1 User (평가자)
  - UserEvaluation N:1 User (평가 대상)
  - UserEvaluation N:1 Room (공구방)

### 10.2 ERD 다이어그램

```
User 1 ------ N Room (방장)
 |      |
 |      N
 |      |
 N      |
UserEvaluation
 |      |
 |      |
 N      |
 |      |
User N ------ M Room (참여자)
        |
        |
        N
        |
    Message
        |
        |
        N
        |
Room 1 ------ N LocationVote
 |
 |
 N
 |
Restaurant
 |
 |
 1
 |
 N
MenuItem
 |
 |
 1
 |
 N
OrderItem
 |
 |
 N
 |
Order 1 ------ 1 Room
 |
 |
 N
 |
User
```

## 11. 역할 분담 (6인 개발팀 기준)

### 11.1 프론트엔드 개발자 (2명)

#### 프론트엔드 공동개발
- 담당 파트:
  - 이태웅(팀장) : 발표, 회의 주체, 지도api 연동 및 지도페이지, 마이페이지(회원정보 확인 및 수정, 리뷰 등록 및 수정)
  - 최재현 : 공구방(채팅, 장바구니, 공구진행)
  - 강상욱 : 마이페이지(문의사항 등록 및 수정), 캐쉬 충전
  - 선승희 : 로그인 및 회원가입(이메일 인증), 메인페이지, 헤더, 푸터
  - 박채원 : 메인페이지, 사이드 메뉴 바, 헤더, 푸터
  - 김호수 : 공구방 생성, 가게 리뷰페이지, 주문완료 영수증

### 11.5 협업 방식
- 애자일 스크럼 방식으로 1주 단위 스프린트 진행
- GitHub을 통한 코드 관리
- Figma를 활용한 디자인 협업
