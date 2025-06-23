import { useState, useEffect } from "react";
import styles from "./MyPage.module.css";
import { useOutletContext } from "react-router-dom";
import supabase from "../../config/supabaseClient";
import FormattedDate from "../../components/FormattedDate";
import EditModal from "./EditModal"; // ✅ 모달 import
import Modal from "../../components/Modal";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import QnaWriteModal from "./QnaWriteModal";

export default function MyQnA() {
  const { userSession, userId } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [qnaList, setQnaList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showAnswerId, setShowAnswerId] = useState(null);
  const [editQnaById, setEditQnaById] = useState(null);
  const [editing, setEditing] = useState(false);

  const itemsPerPage = 3;

  //최초 로딩 + 실시간 구독
  useEffect(() => {
    //QnA 록록 불러오기
    const fetchQnaList = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from("qna")
        .select("id, title, q_contents, q_answer, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      setQnaList(error ? [] : data);
      setCurrentPage(0);
      setLoading(false);
    };

    fetchQnaList();

    //실시간 구독
    const channel = supabase
      .channel("realtime:user_qna_watch_on_mypage")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "qna" },
        (payload) => {
          if (
            payload.new?.user_id === userId ||
            payload.old?.user_id === userId
          ) {
            fetchQnaList();
          }
        }
      )
      .subscribe();

    console.log("userId in MyQnA:", userId); //<- 유저id 확인용
    if (!userId) return;

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const toggleAnswer = (id) => {
    setShowAnswerId((prev) => (prev === id ? null : id));
  };

  const reviewDelete = async (qnaId) => {
    const confirmed = window.confirm("문의를 삭제하시겠습니까?");
    if (!confirmed) return;

    const { error } = await supabase.from("qna").delete().eq("id", qnaId);
    if (error) {
      alert("삭제 중 오류가 발생했습니다.");
    } else {
      setQnaList((prev) => prev.filter((qna) => qna.id !== qnaId));
      const totalPages = Math.ceil((qnaList.length - 1) / itemsPerPage);
      if (currentPage > totalPages - 1) {
        setCurrentPage(totalPages - 1);
      }
    }
  };

  const editStart = (qna) => {
    const confirmed = window.confirm("문의를 수정하시겠습니까?");
    if (!confirmed) return;
    setEditQnaById(qna.id);
    setEditing(true);
  };

  const closeModal = () => {
    setEditing(false);
    setEditQnaById(null);
    // fetchUserData(); // 수정된 데이터 반영
  };

  const paginatedQna = qnaList.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const totalPages = Math.ceil(qnaList.length / itemsPerPage);
  //modal
  const [modalOpen, setModalOpen] = useState(false);

  const handleQnaInsert = async ({ title, contents }) => {
    const { error, data } = await supabase.from("qna").insert([
      {
        user_id: userId,
        title,
        q_contents: contents,
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) {
      alert("등록 중 오류");
      return;
    }
    //등록 성공 시
    // fetchUserData();
    setCurrentPage(0);
  };

  return (
    <>
      <div className={styles.qnaButtonWrapper}>
        <button
          className={styles.qnaWriteBtn}
          onClick={() => setModalOpen(true)}
        >
          문의 남기기
        </button>
      </div>

      {/* 문의 작성 모달 */}
      <QnaWriteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleQnaInsert}
        userId={userId}
      />

      {loading ? (
        <>
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <div key={i} className={styles.qnaSkeletonCard}>
              <div className={`${styles.qnaSkeletonBox} ${styles.qnaLong}`} />
              <div className={`${styles.qnaSkeletonBox} ${styles.qnaMedium}`} />
              <div className={`${styles.qnaSkeletonBox} ${styles.qnaShort}`} />
            </div>
          ))}
        </>
      ) : paginatedQna.length === 0 ? (
        <p>문의 내역이 없습니다.</p>
      ) : (
        paginatedQna.map((qna) => (
          <div key={qna.id} className={styles.myQna}>
            <div className={styles.qnaDate}>
              <FormattedDate dateString={qna.created_at} />
            </div>
            <div className={styles.qnaTitle}>
              <b>Q. {qna.title}</b>
              <div className={styles.qnaContent}>
                <textarea
                  className={styles.qnaTextArea}
                  disabled
                  value={qna.q_contents}
                />
              </div>
              <div className={styles.qnaanswer}>
                답변유무 {qna.q_answer ? "Yes" : "No"}
              </div>
              <div
                style={qna.q_answer ? { cursor: "pointer" } : {}}
                onClick={() => toggleAnswer(qna.id)}
              >
                <button
                  className={styles.deleteReview}
                  onClick={(e) => {
                    e.stopPropagation();
                    reviewDelete(qna.id);
                  }}
                >
                  리뷰삭제
                </button>
                {qna.q_answer ? (
                  ""
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      editStart(qna);
                    }}
                    className={styles.editReview}
                  >
                    수정하기
                  </button>
                )}
                {qna.q_answer ? (
                  <ArrowDropDownIcon className={styles.downIcon} />
                ) : (
                  ""
                )}
              </div>
            </div>
            {qna.q_answer && showAnswerId === qna.id && (
              <div className={styles.answer}>
                <b>A.</b>
                <h4>{qna.q_answer}</h4>
              </div>
            )}
          </div>
        ))
      )}

      {totalPages > 1 && (
        <div className={styles.qnaPages}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
          >
            이전
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={i === currentPage ? styles.activePage : ""}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
            }
            disabled={currentPage === totalPages - 1}
          >
            다음
          </button>
        </div>
      )}

      {editing && editQnaById && (
        <EditModal qnaId={editQnaById} onClose={closeModal} />
      )}
    </>
  );
}
