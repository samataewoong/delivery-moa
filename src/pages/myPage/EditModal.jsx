import { useEffect, useState } from "react";
import styles from "./EditModal.module.css";
import pageStyles from "./MyPage.module.css";
import supabase from "../../config/supabaseClient";
import FormattedDate from "../../components/FormattedDate";

export default function EditModal({ qnaId, onClose }) {
  const [qnaData, setQnaData] = useState(null);
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const now = new Date().toISOString();
  // QnA 데이터 불러오기
  useEffect(() => {
    const fetchQna = async () => {
      const { data, error } = await supabase
        .from("qna")
        .select("title, q_contents, created_at")
        .eq("id", qnaId)
        .single();

      if (error) {
        console.error("QnA 불러오기 실패:", error);
        return;
      }

      setQnaData(data);
      setTitle(data.title);
      setContents(data.q_contents);
      setDate(data.created_at);
      setLoading(false);
    };

    fetchQna();
  }, [qnaId]);

  // 수정 요청
  const handleUpdate = async () => {
    const { error } = await supabase
      .from("qna")
      .update({ title, q_contents: contents, created_at: now })
      .eq("id", qnaId);

    if (error) {
      alert("수정 실패");
      console.error(error);
    } else {
      alert("리뷰가 수정되었습니다.");
      onClose(); // 모달 닫기
    }
  };

  if (loading) return <div className={styles.modal}>로딩 중...</div>;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>문의 수정</h2>
        <div className={styles.qnaDate}>
          <h1>
            <FormattedDate dateString={date} />
          </h1>
        </div>
        <div className={styles.editTitle}>
          <b>Q. </b>
          <input
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <textarea
            className={styles.contentsInput}
            value={contents}
            onChange={(e) => setContents(e.target.value)}
          />
        </div>
        <div className={styles.buttons}>
          <button className={styles.saveButton} onClick={handleUpdate}>
            저장
          </button>
          <button className={styles.cansleButton} onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
