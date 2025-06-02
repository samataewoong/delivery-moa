import { useState, useEffect } from "react";
import styles from "./MyPage.module.css";
import { useOutletContext } from "react-router-dom";
import supabase from "../../config/supabaseClient";
import FormattedDate from "../../components/FormattedDate";
import Modal from "../../components/Modal";

export default function MyQnA() {
  // user 정보
  const { userSession, userId } = useOutletContext();

  // QnA 리스트 상태
  const [qnaList, setQnaList] = useState([]);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;

  // 답변 열기 상태 (열려있는 QnA id 저장)
  const [showAnswerId, setShowAnswerId] = useState(null);

  // 답변 토글 함수
  const toggleAnswer = (id) => {
    setShowAnswerId((prev) => (prev === id ? null : id));
  };

  // QnA 삭제 함수
  async function reviewDelete(qnaId) {
    const confirmed = window.confirm("정말로 이 문의를 삭제하시겠습니까?");
    if (!confirmed) return;

    const { error } = await supabase.from("qna").delete().eq("id", qnaId);

    if (error) {
      console.error("리뷰 삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    } else {
      console.log("리뷰 삭제 성공");
      // 삭제된 항목 상태에서 제거
      setQnaList((prev) => prev.filter((qna) => qna.id !== qnaId));
      // 만약 삭제 후 현재 페이지가 빈 페이지가 되면 이전 페이지로 이동
      const totalPages = Math.ceil((qnaList.length - 1) / itemsPerPage);
      if (currentPage > totalPages - 1) {
        setCurrentPage(totalPages - 1);
      }
    }
  }

  // 유저 아이디가 바뀌면 데이터 불러오기
  useEffect(() => {
    if (!userId) return;

    async function fetchUserData() {
      const { data, error } = await supabase
        .from("qna")
        .select("id, title, q_contents, q_answer, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }); // 최신순 정렬

      if (error) {
        console.error("Error fetching user data:", error);
      } else {
        setQnaList(data || []);
        setCurrentPage(0); // 불러올 때 페이지 초기화
      }
    }

    fetchUserData();
  }, [userId]);

  // 페이지네이션: 현재 페이지에 보여줄 QnA 목록
  const paginatedQna = qnaList.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const totalPages = Math.ceil(qnaList.length / itemsPerPage);

  //modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [writing, setWriting] = useState(false); // optional
  const [loading, setLoading] = useState(false);

  return (
    <>
      <button className={styles.qnaWriteBtn} onClick={() => setModalOpen(true)}>
        문의 남기기
      </button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <form
          className={styles.qnaWriteForm}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newTitle.trim() || !newContent.trim()) {
              alert("제목과 내용을 입력해주세요.");
              return;
            }
            setLoading(true);
            const { error, data } = await supabase.from("qna").insert([
              {
                user_id: userId,
                title: newTitle,
                q_contents: newContent,
                created_at: new Date().toISOString(),
              },
            ]);
            setLoading(false);

            if (error) {
              alert("등록 중 오류가 발생했습니다.");
            } else {
              setQnaList((prev) => [
                {
                  id: data[0].id,
                  title: newTitle,
                  q_contents: newContent,
                  created_at: new Date().toISOString(),
                  q_answer: null,
                },
                ...prev,
              ]);
              setNewTitle("");
              setNewContent("");
              setModalOpen(false);
              setCurrentPage(0);
            }
          }}
        >
          <h3>문의 남기기</h3>
          <input
            className={styles.qnaInput}
            placeholder="문의 제목"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={loading}
          />
          <textarea
            className={styles.qnaTextarea}
            placeholder="문의 내용"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            disabled={loading}
            rows={6}
          />
          <div className={styles.qnaWriteBtns}>
            <button type="submit" disabled={loading}>
              등록
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={loading}
            >
              취소
            </button>
          </div>
        </form>
      </Modal>

      {paginatedQna.length === 0 ? (
        <p>문의 내역이 없습니다.</p>
      ) : (
        paginatedQna.map((qna) => (
          <div
            key={qna.id}
            className={styles.myQna}
            onClick={() => toggleAnswer(qna.id)}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.qnaDate}>
              <h1>
                <FormattedDate dateString={qna.created_at} />
              </h1>
            </div>
            <div className={styles.qnaTitle}>
              <b>Q. {qna.title}</b>
              <div className={styles.qnaContent}>
                <h2>{qna.q_contents}</h2>
              </div>
              <h3>답변유무 {qna.q_answer ? "Yes" : "No"}</h3>
              <button
                className={styles.deleteReview}
                onClick={(e) => {
                  e.stopPropagation(); // 부모 onClick 중복 방지
                  reviewDelete(qna.id);
                }}
              >
                리뷰 삭제
              </button>
            </div>
            {qna.q_answer && showAnswerId === qna.id && (
              <div className={styles.answer}>
                <b>A.</b>
                <br />
                <h4>{qna.q_answer}</h4>
              </div>
            )}
          </div>
        ))
      )}

      {/* 페이지 네비게이션 */}
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
    </>
  );
}
