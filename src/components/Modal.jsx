import styles from "./Modal.module.css";

export default function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()} // 모달 클릭 시 닫힘 방지
      >
        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
