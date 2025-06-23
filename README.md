# 배달 공구(공동구매) 사이트 기획서

## 1. 프로젝트 개요

### 1.1 프로젝트명
"배달모아" (가칭) - 배달 공동구매 플랫폼

### 1.2 기획 의도 및 목적
- 배달비 절감을 위한 공동구매 플랫폼 제공
- 동일 지역 내 사용자들의 커뮤니티 활성화
- 1인 가구 증가에 따른 소량 주문 시 발생하는 경제적 부담 완화
- 음식 배달 과정에서 발생하는 환경적 영향 최소화

### 1.3 주요 기능 요약
- 위치 기반 배달 공구방 생성 및 참여
- 실시간 채팅 및 의사결정(투표) 시스템
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

### 2.3 공구방 목록 화면
- 선택한 카테고리의 음식점 목록 표시
- 해당 음식점에 대한 현재 진행 중인 공구방 표시
- 필터링 옵션 (거리순, 참여자 수, 마감 임박순 등)
- 새 공구방 생성 버튼

### 2.4 공구방 생성 기능
- 음식점 선택
- 주문 예상 시간대 설정
- 최대 참여자 수 설정
- 최소 주문 금액 달성 여부 표시
- 간단한 방 소개 작성

### 2.5 공구방 상세 화면
- 공구방 정보 (음식점, 예상 주문 시간, 참여자 수 등)
- 참여자 목록 및 방장 표시
- 실시간 채팅 기능
- 배달 받을 위치 투표 시스템
- 메뉴 선택 및 공유 기능
- 결제 방식 조율 기능

### 2.6 주문 및 결제 과정
- 개인별 메뉴 선택 및 취합
- 총 주문 금액 및 1인당 분담금 계산
- 결제 방식 선택 (각자 결제, 한 명이 대표 결제 후 정산)
- 주문 확정 및 배달 현황 추적

### 2.7 배달 완료 및 후속 처리
- 배달 완료 확인
- 공구 참여자 평가
- 음식점 평가 및 리뷰

## 3. 기술 스택

### 3.1 프론트엔드
- React (Create React App 또는 Next.js)
- TypeScript
- Redux 또는 Context API (상태 관리)
- Styled-components 또는 Tailwind CSS (스타일링)
- Socket.IO (실시간 채팅)
- React Router (라우팅)
- Axios (API 요청)

### 3.2 백엔드
- Node.js + Express 또는 NestJS
- MongoDB 또는 PostgreSQL (데이터베이스)
- JWT (인증)
- Socket.IO (실시간 통신)
- Geolocation API (위치 기반 서비스)

### 3.3 배포 및 인프라
- AWS (EC2, S3) 또는 Vercel/Netlify
- Docker (컨테이너화)
- CI/CD 파이프라인 (GitHub Actions)

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

### 5.3 공구방 생성 화면
- 단계별 생성 프로세스
- 음식점 선택
- 방 제목 및 설명 입력
- 최대 참여자 수 설정
- 예상 주문 시간대 선택
- 배달 받을 기본 위치 선택

### 5.4 공구방 상세 화면
- 상단: 방 정보 (제목, 음식점, 참여자 수, 주문 예정 시간 등)
- 중앙 좌측: 참여자 목록
- 중앙 우측: 실시간 채팅창
- 하단: 배달 위치 투표 시스템
- 우측 사이드바: 메뉴 선택 및 주문 현황

### 5.5 사용자 프로필
- 기본 정보 (닉네임, 프로필 이미지)
- 참여 이력
- 평가 점수
- 기본 주소 설정

## 6. 구현 로드맵

### 6.1 1단계 (MVP - 최소 기능 제품)
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
- `<ProfilePage />`: 사용자 프로필
- `<SettingsPage />`: 설정 페이지

### 7.3 기능별 컴포넌트
- `<ChatBox />`: 채팅 컴포넌트
- `<LocationVote />`: 위치 투표 컴포넌트
- `<ParticipantList />`: 참여자 목록
- `<MenuSelector />`: 메뉴 선택 컴포넌트
- `<PaymentCalculator />`: 결제 금액 계산기
- `<Map />`: 지도 표시 컴포넌트
- `<Notification />`: 알림 컴포넌트

## 8. 주요 추가 고려사항

### 8.1 보안
- 사용자 인증 및 권한 관리
- 개인정보 보호 (위치 정보 등)
- 채팅 내용 암호화

### 8.2 UX/UI
- 직관적인 사용자 경험 설계
- 모바일 우선 반응형 디자인
- 접근성 고려 (색상 대비, 스크린 리더 지원)

### 8.3 성능 최적화
- 이미지 최적화
- 코드 스플리팅
- 서버 사이드 렌더링 고려
- 데이터 캐싱

### 8.4 확장성
- 다양한 지역으로 서비스 확장 가능성
- 다국어 지원 고려
- 추가 기능 통합 용이성

## 9. 기대 효과 및 비즈니스 모델

### 9.1 기대 효과
- 사용자 배달비 절감
- 소셜 커뮤니티 형성
- 1인 가구를 위한 경제적 식사 솔루션 제공
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

#### LocationVote (위치 투표)
- PK: voteId
- FK: roomId (Room 참조)
- 속성: address, coordinates
- 관계:
  - LocationVote N:1 Room (공구방)
  - LocationVote N:M User (투표한 사용자)

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

#### 프론트엔드 개발자 1 (UI/UX 책임자)
- 담당 업무:
  - 전체 UI/UX 디자인 시스템 구축
  - 메인 페이지 및 카테고리 페이지 개발
  - 사용자 프로필 및 설정 페이지 개발
  - 공통 컴포넌트 라이브러리 개발
  - 반응형 디자인 및 모바일 최적화
  - UI 테스트 및 사용성 검증

#### 프론트엔드 개발자 2 (기능 책임자)
- 담당 업무:
  - 공구방 생성 및 상세 페이지 개발
  - 실시간 채팅 기능 구현
  - 위치 투표 시스템 구현
  - 주문 및 결제 프로세스 UI 개발
  - 상태 관리 (Redux/Context API) 구현
  - 프론트엔드 테스트 자동화

### 11.2 백엔드 개발자 (2명)

#### 백엔드 개발자 1 (API 책임자)
- 담당 업무:
  - RESTful API 설계 및 개발
  - 데이터베이스 스키마 설계 및 관리
  - 사용자 인증 및 권한 관리 시스템 구현
  - 음식점 및 메뉴 데이터 관리 API 개발
  - API 문서화 및 테스트
  - 성능 최적화 및 모니터링

#### 백엔드 개발자 2 (실시간 시스템 책임자)
- 담당 업무:
  - 실시간 채팅 서버 구현 (WebSocket/Socket.IO)
  - 위치 기반 서비스 및 지오코딩 구현
  - 알림 시스템 개발
  - 투표 시스템 및 실시간 상태 동기화 구현
  - 데이터 캐싱 및 실시간 처리 최적화
  - 서버 스케일링 및 부하 테스트

### 11.3 DevOps/인프라 엔지니어 (1명)
- 담당 업무:
  - 클라우드 인프라 구축 및 관리 (AWS)
  - CI/CD 파이프라인 구축 (GitHub Actions)
  - Docker 컨테이너화 및 배포 자동화
  - 서버 모니터링 및 로깅 시스템 구축
  - 보안 설정 및 취약점 관리
  - 데이터베이스 백업 및 복구 시스템 구축

### 11.4 풀스택 개발자/PM (1명)
- 담당 업무:
  - 프로젝트 관리 및 일정 조율
  - 기술적 의사결정 및 아키텍처 설계
  - 결제 시스템 연동 개발
  - 외부 API (지도, 배달앱 등) 연동
  - 사용자 평가 및 리뷰 시스템 개발
  - QA 및 버그 추적
  - 제품 출시 및 릴리스 관리

### 11.5 협업 방식
- 애자일 스크럼 방식으로 2주 단위 스프린트 진행
- 주 3회 스탠드업 미팅으로 진행 상황 공유
- GitHub을 통한 코드 관리 및 PR 리뷰 시스템 도입
- Jira 또는 Trello를 통한 태스크 관리
- Slack을 통한 일상적인 커뮤니케이션
- Figma를 활용한 디자인 협업
- 격주 회고 미팅을 통한 프로세스 개선

### 11.6 개발 일정
- 1단계 MVP 개발: 2개월
- 2단계 주요 기능 구현: 2개월
- 3단계 고급 기능 및 최적화: 1.5개월
- 베타 테스트 및 QA: 2주
- 출시 준비 및 안정화: 2주