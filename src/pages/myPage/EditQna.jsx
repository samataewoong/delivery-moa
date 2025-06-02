import { useSearchParams } from "react-router-dom"
import { useEffect, useState } from 'react'
import supabase from '../../config/supabaseClient';
import styles from './MyPage.module.css';
import FormattedDate from "../../components/FormattedDate";

export default function EditQna() {
    const [searchParams] = useSearchParams();
    const qnaId = searchParams.get('qnaId');
    const [qnaTitle, setQnaTitle] = useState("");
    const [qnaContents, setQnaContents] = useState("");
    const [editedContents, setEditedContents] = useState(qnaContents);
    const [date, setDate] = useState("");
    const [answer, setAnswer] = useState("");
    useEffect(() => {
        if (!qnaId) return;

        async function fetchUserData() {
            const { data: qna, error } = await supabase
                .from("qna")
                .select("title, q_contents, q_answer, created_at")
                .eq("id", qnaId)
                .single();

            if (error) {
                console.error("Error fetching user data:", error);
            } else {
                setQnaTitle(qna.title);
                setQnaContents(qna.q_contetns);
                setDate(qna.created_at);
                setAnswer(qna.q_answer);
            }
        }
        fetchUserData();
    }, [qnaId]);
    return (
        <div className={styles.myQna}>
            <div className={styles.qnaDate}>
                <h1>
                    <FormattedDate dateString={date}></FormattedDate>
                </h1>
            </div>
            <div className={styles.qnaTitle}>
                <b>Q.{qnaTitle}</b>
            </div>
            <div className={styles.qnaContent}>
                
            </div>
        </div>
    )
}