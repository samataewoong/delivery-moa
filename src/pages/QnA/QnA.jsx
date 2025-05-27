import { useEffect, useState } from "react";
import SideMenu from "../../components/sidemenu";
import supabase from "../../config/supabaseClient";

export default function QnABoard() {
  const [posts, setPosts] = useState([]); // 게시글 목록
  const [title, setTitle] = useState("");
  const [q_contents, setQ_contents] = useState("");
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [user_id, setUser_id] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !q_contents.trim()) return;
    const { error } = await supabase
      .from("qna")
      .insert([{ title, q_contents, user_id, created_at: new Date() }]);
    if (error) {
      setMessage("등록 실패: " + error.message);
    } else {
      setMessage("질문이 등록되었습니다!");
      setTitle("");
      setQ_contents("");
      const { data } = await supabase.from("qna").select("*");
      setPosts(data);
    }
  };

  useEffect(
    () =>
      async function fetchPosts() {
        const { data, error } = await supabase.from("qna").select("*");
        if (error) {
          console.error("질문 목록 불러오기 실패:", error.message);
          setPosts([]);
        } else {
          // .order("id", { ascending: false });
          //   if (!error) setPosts(data);
          setPosts(data || []);
        }
        fetchPosts();
      },
    []
  );

  return (
    <div>
      <SideMenu />
      <h1>QnA 게시판</h1>
      <div style={{ border: "1px solid #ccc", padding: 10, marginBottom: 20 }}>
        <h3>질문 등록</h3>
        <input
          placeholder="uuid"
          value={user_id}
          onChange={(e) => setUser_id(e.target.value)}
          style={{ width: 250, marginBottom: 4 }}
        />
        <br />
        <input
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: 250, marginBottom: 4 }}
        />
        <br />
        <textarea
          placeholder="내용"
          value={q_contents}
          onChange={(e) => setQ_contents(e.target.value)}
          rows={3}
          style={{ width: 250, marginBottom: 4 }}
        />
        <br />
        <button onClick={handleSubmit}>질문 등록</button>
        {message && <p>{message}</p>}
      </div>

      <h3>질문 목록</h3>
      <ul>
        {posts.map((post) => (
          <li key={post.id} style={{ marginBottom: 12 }}>
            <button
              style={{
                background: "none",
                border: "none",
                color: "blue",
                textDecoration: "underline",
                cursor: "pointer",
                fontSize: 16,
              }}
              onClick={() => setSelected(selected === post.id ? null : post.id)}
            >
              {post.title}
            </button>
            <span style={{ color: "#aaa", marginLeft: 10 }}>
              ({post.created_at && post.created_at.substring(0, 16)})
            </span>
            {/* 펼쳐진 상태면 내용 표시 */}
            {selected === post.id && (
              <div
                style={{
                  marginTop: 8,
                  background: "#f8f8f8",
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #eee",
                }}
              >
                <div style={{ whiteSpace: "pre-line" }}>{post.q_contents}</div>
                {/* 필요시 닫기 버튼 추가 가능 */}
                <button
                  style={{ marginTop: 5 }}
                  onClick={() => setSelected(null)}
                >
                  닫기
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
