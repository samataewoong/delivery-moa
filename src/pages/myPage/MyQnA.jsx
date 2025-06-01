import { useState, useEffect } from "react";
import styles from "./MyPage.module.css";
import { useOutletContext } from "react-router-dom";
import supabase from "../../config/supabaseClient";
import FormattedDate from "../../components/FormattedDate";

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
    const confirmed = window.confirm("문의를 삭제하시겠습니까?");
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
  };
  // QnA 업데이트 함수
  // id 체킹
  const [editQnaById, setEditQnaById] = useState("");
  // 수정중 체크
  const [editing, setEditing] = useState(false);
  // 수정 내용
  const [editedContents, setEditedContents] = useState("");
  // 수정하기 버튼
  const editStart = (qna) => {
    const confirmed = window.confirm("문의를 수정하시겠습니까?");
    if (!confirmed) return;
    setEditQnaById(qna.id);
    setEditing(true);
  };
  // 수정완료 버튼
  async function editDone(editQnaById) {
    const { data, error } = await supabase.from('qna').update({ q_contents: editedContents }).eq('id', editQnaById);
    if (error) {
      console.error("업데이트 실패", error);
    } else {
      console.log("업데이트 성공");
    }
    setEditing(false);
  };
  // 수정버튼 랜더링 함수
  const renderEditButton = (qna) => {
    if (qna.id === editQnaById && editing) {
      // 수정 중일 때
      return (
        <button onClick={() => editDone(editQnaById)} className={styles.editReview}>수정완료</button>
      );
    }

    if (!qna.q_answer) {
      // 답변 없고, 수정 중 아닐 때 수정하기 버튼
      return (
        <button onClick={() => editStart(qna)} className={styles.editReview}>수정하기</button>
      );
    }

    // 그 외 버튼 없음
    return null;
  };

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

  return (
    <>
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
                <textarea className={styles.qnaTextArea} value={qna.q_contents} disabled={!editing} onChange={(e) => setEditedContents(e.target.value)} style={{
                  border: !editing ? "none" : undefined
                }} />
              </div>
              <h3>답변유무 {qna.q_answer ? "Yes" : "No"}</h3>
              <button
                className={styles.deleteReview}
                onClick={(e) => {
                  e.stopPropagation(); // 부모 onClick 중복 방지
                  reviewDelete(qna.id);
                }}
              >
                리뷰삭제
              </button>
              {renderEditButton(qna)}
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
              setCurrentPage((prev) =>
                Math.min(prev + 1, totalPages - 1)
              )
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
