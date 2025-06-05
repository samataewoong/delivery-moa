import React, { useEffect, useState } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../config/supabaseClient";
import styles from "./ReviewModel.module.css";
import { FaStar } from "react-icons/fa";
import Header from "../../components/Header";
import selectRoom from "../../functions/room/SelectRoom";


const Review = () => {
  const { room_id } = useParams(); // URL에서 room_id 추출
  const [currentUserId, setCurrentUserId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [ratings, setRatings] = useState({});
  const [roomInfo, setRoomInfo] = useState(null);
  const navigate = useNavigate();

  


  // 현재 로그인한 유저 ID 가져오기
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    fetchCurrentUser();
  }, []);

  // 방 정보 불러오기
  useEffect(() => {
    if (!room_id) return;

    const fetchRoomInfo = async () => {
      const result = await selectRoom({ room_id });
      if (result && result.length > 0) {
        setRoomInfo(result[0]);
      }
    };

    fetchRoomInfo();
  }, [room_id]);

  // 참여자 불러오기
  useEffect(() => {
    if (!room_id || !currentUserId) return;

    const fetchParticipants = async () => {
      const { data: joins, error: joinError } = await supabase
        .from("room_join")
        .select("user_id")
        .eq("room_id", room_id);

      if (joinError) {
        console.error("room_join 에러:", joinError.message);
        return;
      }

      const otherUserIds = joins
        .map((j) => j.user_id)
        .filter((uid) => uid !== currentUserId);

      if (otherUserIds.length === 0) {
        setParticipants([]);
        return;
      }

      const { data: users, error: userError } = await supabase
        .from("user")
        .select("id, nickname")
        .in("id", otherUserIds);

      if (userError) {
        console.error("user 테이블 에러:", userError.message);
        return;
      }

      setParticipants(users);
    };

    fetchParticipants();
  }, [room_id, currentUserId]);

  const handleRating = (userId, value) => {
    setRatings((prev) => ({ ...prev, [userId]: value }));
  };

  const handleSubmit = async () => {
    for (const [userId, rating] of Object.entries(ratings)) {
      const { error } = await supabase
        .from("user")
        .update({ user_rating: rating })
        .eq("id", userId);

      if (error) {
        console.error(`user ${userId} 업데이트 실패:`, error.message);
      }
    }

    alert("모든 별점 평가가 저장되었습니다.");
    navigate('/mainpage');
    
  };

  return (
    <>
      <div className={styles.container}>
        <h2 className={styles.title}>
          {roomInfo
            ? `${roomInfo.room_name} 방의 사용자 평가하기`
            : "사용자 평가하기"}
        </h2>

        <div className={styles.userList}>
          {participants.map((user) => (
            <div key={user.id} className={styles.userBox}>
              <div className={styles.nickname}>{user.nickname}</div>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <FaStar
                    key={n}
                    size={24}
                    className={
                      n <= (ratings[user.id] || 0)
                        ? styles.activeStar
                        : styles.inactiveStar
                    }
                    onClick={() => handleRating(user.id, n)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <button className={styles.submitBtn} onClick={handleSubmit}>
          제출하기
        </button>
      </div>
    </>
  );
};

export default Review;
