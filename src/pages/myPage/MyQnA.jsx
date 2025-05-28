import { useState } from "react";
import styles from "./MyPage.module.css";

export default function MyQnA() {
    const [showAnswer, setShowAnswer] = useState(false);
    const toggleAnswer = () => setShowAnswer(prev => !prev);

    return (
        <div className={styles.myQna} onClick={toggleAnswer}>
            <div className={styles.qnaDate}>
                <p>2025-02-15</p>
            </div>
            <div className={styles.qnaTitle}>
                <p>이거 왜 안돼요??</p>
                <p>답변유무 yes/no</p>
                <button>삭제</button>
            </div>
            {showAnswer && <div><b>안녕</b></div>}
        </div>
    )
}
