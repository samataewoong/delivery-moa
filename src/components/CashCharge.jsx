import { useState, useEffect } from "react";
import supabase from "../config/supabaseClient";
import styles from "./CashCharge.module.css";

export default function CashCharge() {
  const [userId, setUserId] = useState("");
  const [currentCash, setCurrentCash] = useState(0);
  const [amount, setAmount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("신한 ****1234");
  const presetAmounts = [10000, 50000, 100000, 1000000];

  // 로그인한 유저 uuid와 캐시 조회
  useEffect(() => {
    const fetchUserAndCash = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data, error } = await supabase
          .from("user")
          .select("cash")
          .eq("id", user.id)
          .single();
        if (data) setCurrentCash(data.cash);
      }
    };
    fetchUserAndCash();
  }, []);

  // 충전 처리
  const handleCharge = async () => {
    const chargeAmount = parseInt(amount, 10);
    if (!chargeAmount || chargeAmount <= 0) {
      alert("올바른 금액을 입력하세요");
      return;
    }
    const { data, error } = await supabase
      .from("user")
      .update({ cash: currentCash + chargeAmount })
      .eq("id", userId)
      .select();

    if (error) {
      alert("충전에 실패했습니다: " + (error.message || JSON.stringify(error)));
    } else if (!data || data.length === 0) {
      alert("충전이 정상적으로 반영되지 않았습니다. (데이터 없음)");
    } else {
      alert("충전 완료!");
      window.close();
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* 상단 타이틀 */}
      <div className={styles.headerRow}>
        <button className={styles.backButton} onClick={() => window.close()}>
          &larr;
        </button>
        <h2 className={styles.title}>캐시 충전</h2>
        <span className={styles.reserve}>배달모아</span>
      </div>
      {/* 안내문구 */}
      <div className={styles.guide}>충전할 금액을 입력해 주세요.</div>

      {/* 프리셋 버튼 */}
      <div className={styles.presetRow}>
        {presetAmounts.map((v) => (
          <button
            type="button"
            key={v}
            className={styles.presetButton}
            onClick={() => setAmount(String(Number(amount || 0) + v))}
          >
            +{v >= 10000 ? v / 10000 + "만" : v.toLocaleString()}
          </button>
        ))}
      </div>

      {/* 금액 입력 */}
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
        placeholder="충전할 금액"
        className={styles.amountInput}
        min={0}
      />

      {/* 현재 캐시 */}
      <div
        style={{
          marginBottom: 20,
          fontWeight: 500,
          color: "#174C4F",
          fontSize: 16,
        }}
      >
        현재 보유 캐시:{" "}
        <span style={{ color: "#FF6B6B" }}>
          {currentCash.toLocaleString()} 원
        </span>
      </div>

      {/* 충전 버튼 */}
      <button
        className={styles.chargeButton}
        disabled={!amount || parseInt(amount, 10) <= 0}
        onClick={handleCharge}
      >
        충전하기
      </button>
    </div>
  );
}

// import { useState, useEffect } from "react";
// import supabase from "../config/supabaseClient";
// import styles from "./CashCharge.module.css";

// export default function CashCharge() {
//   const [userId, setUserId] = useState("");
//   const [currentCash, setCurrentCash] = useState(0);
//   const [amount, setAmount] = useState("");

//   // 로그인한 유저 uuid 가져오기
//   useEffect(() => {
//     const fetchUserAndCash = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (user) {
//         setUserId(user.id);

//         //현재 cash 불러오기
//         const { data, error } = await supabase
//           .from("user")
//           .select("cash")
//           .eq("id", user.id)
//           .single();
//         if (data) setCurrentCash(data.cash);
//       }
//     };
//     fetchUserAndCash();
//   }, []);

//   // 충전 처리
//   const handleCharge = async () => {
//     const chargeAmount = parseInt(amount, 10);
//     if (!chargeAmount || chargeAmount <= 0) {
//       alert("올바른 금액을 입력하세요");
//       return;
//     }
//     const { data, error } = await supabase
//       .from("user")
//       .update({ cash: currentCash + chargeAmount })
//       .eq("id", userId)
//       .select();

//     if (error) {
//       alert("충전에 실패했습니다: " + (error.message || JSON.stringify(error)));
//     } else if (!data || data.length === 0) {
//       alert("충전이 정상적으로 반영되지 않았습니다. (데이터 없음)");
//     } else {
//       alert("충전 완료");
//       if (window.opener) {
//         window.opener.location.reload();
//       }
//       window.close();
//     }
//   };

//   return (
//     <div>
//       <h3>캐시 충전</h3>
//       <p>현재 캐시: {currentCash} 원</p>
//       <input
//         type="number"
//         value={amount}
//         onChange={(e) => setAmount(e.target.value)}
//         placeholder="충전할 금액"
//         className={styles.input}
//       />
//       <button onClick={handleCharge}>충전</button>
//     </div>
//   );
// }
