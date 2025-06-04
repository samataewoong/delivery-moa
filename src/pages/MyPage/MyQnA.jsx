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

  const [qnaList, setQnaList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showAnswerId, setShowAnswerId] = useState(null);
  const [editQnaById, setEditQnaById] = useState(null);
  const [editing, setEditing] = useState(false);

  const itemsPerPage = 3;

  // ✅ 데이터 가져오는 함수 분리
  const fetchUserData = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("qna")
      .select("id, title, q_contents, q_answer, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user data:", error);
      setQnaList([]);
    } else {
      setQnaList(data || []);
      setCurrentPage(0);
    }
  };

  useEffect(() => {
    fetchUserData();
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
    setEditing(true); // ✅ 모달 열기
  };

  // ✅ 모달 닫기 함수
  const closeModal = () => {
    setEditing(false);
    setEditQnaById(null);
    fetchUserData(); // 수정된 데이터 반영
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
    fetchUserData();
    setCurrentPage(0);
  };

  return (
    <>
      <button className={styles.qnaWriteBtn} onClick={() => setModalOpen(true)}>
        문의 남기기
      </button>

      {/* 문의 작성 모달 */}
      <QnaWriteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleQnaInsert}
        userId={userId}
      />

      {paginatedQna.length === 0 ? (
        <p>문의 내역이 없습니다.</p>
      ) : (
        paginatedQna.map((qna) => (
          <div key={qna.id} className={styles.myQna}>
            <div className={styles.qnaDate}>
              <h1>
                <FormattedDate dateString={qna.created_at} />
              </h1>
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
              <h3>답변유무 {qna.q_answer ? "Yes" : "No"}</h3>
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

      {/* ✅ 수정 모달 삽입 */}
      {editing && editQnaById && (
        <EditModal qnaId={editQnaById} onClose={closeModal} />
      )}
    </>
  );
}
