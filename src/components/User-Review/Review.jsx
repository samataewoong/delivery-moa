import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../config/supabaseClient";
import styles from "./ReviewModel.module.css";
import { FaStar } from "react-icons/fa";
import selectRoom from "../../functions/room/SelectRoom";
import selectUser from "../../functions/user/SelectUser";

const Review = () => {
  const { room_id } = useParams();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [ratings, setRatings] = useState({});
  const [roomInfo, setRoomInfo] = useState(null);
  const navigate = useNavigate();

  const basic_profile =
    "https://epfwvrafnhdgvyfcrhbo.supabase.co/storage/v1/object/public/profile-image/mypagePerson.png";

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
        .select("id, nickname, profile_url")
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
    if (participants.length !== Object.keys(ratings).length) {
  alert("모든 사용자에게 별점을 주세요!");
  return;
}
    for (const [userId, rating] of Object.entries(ratings)) {
      try {
        const userData = await selectUser({ user_id: userId });
        let userRating = userData[0]?.user_rating ?? 50;

        const newRating = userRating + (rating - 3);
        userRating = Math.max(0, Math.min(100, newRating));

        const { error } = await supabase
          .from("user")
          .update({ user_rating: userRating })
          .eq("id", userId);

        if (error) {
          console.error(`user ${userId} 업데이트 실패:`, error.message);
        }
      } catch (error) {
        console.error(`user ${userId} 정보 불러오기 실패:`, error.message);
      }
    }

    alert("모든 별점 평가가 저장되었습니다.");
    navigate("/mainpage", { replace: true });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {roomInfo ? `${roomInfo.room_name} 방의 사용자 평가하기` : "사용자 평가하기"}
      </h2>

      <div className={styles.userList}>
        {participants.map((user) => (
          <div key={user.id} className={styles.userBox}>
            <img
              src={user.profile_url || basic_profile}
              alt="프로필"
              className={styles.profileImage}
              onError={(e) => (e.target.src = basic_profile)}
            />
            <div className={styles.nickname}>{user.nickname}</div>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((n) => (
                <FaStar
                  key={n}
                  size={20}
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
  );
};

export default Review;