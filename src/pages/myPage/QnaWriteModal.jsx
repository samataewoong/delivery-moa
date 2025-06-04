import { useState } from "react";
import Modal from "../../components/Modal";
import styles from "./QnaWriteModal.module.css";

export default function QnaWriteModal({ open, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!title.trim() || !contents.trim()) {
  //     alert("제목과 내용을 입력하세요.");
  //     return;
  //   }
  //   setLoading(true);
  //   const { error } = await supabase.from("qna").insert([
  //     {
  //       user_id: userId,
  //       title,
  //       q_contents: contents,
  //       created_at: new Date().toISOString(),
  //     },
  //   ]);
  //   setLoading(false);

  //   if (error) {
  //     alert("등록 중 오류가 발생했습니다.");
  //     return;
  //   }
  //   alert("문의가 등록됐습니다.");
  //   setTitle("");
  //   setContents("");
  //   onClose();
  //   if (afterSubmit) afterSubmit();
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !contents.trim()) {
      alert("제목과 내용을 입력하세요.");
      return;
    }
    setLoading(true);
    await onSubmit({ title, contents });
    setLoading(false);
    alert("문의가 등록됐습니다.");
    setTitle("");
    setContents("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.overlay}>
        <form className={styles.modal} onSubmit={handleSubmit}>
          <h3>문의 남기기</h3>
          <div className={styles.editTitle}>
            <input
              className={styles.titleInput}
              placeholder="문의 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>
          <textarea
            className={styles.contentsInput}
            placeholder="문의 내용"
            value={contents}
            onChange={(e) => setContents(e.target.value)}
            disabled={loading}
            rows={6}
          />
          <div className={styles.buttons}>
            <button
              type="submit"
              disabled={loading}
              className={styles.saveButton}
            >
              등록
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={styles.cansleButton}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
