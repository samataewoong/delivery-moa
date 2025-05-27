import { useState } from "react";
import { dummyProducts } from "../data/products";
import SideMenu from "../components/sidemenu";

export default function Order() {
  const [selectedId, setSelectedId] = useState("");
  const [paid, setPaid] = useState(false);

  const selectedProduct = dummyProducts.find(
    (p) => p.id === Number(selectedId)
  );

  const handlePay = () => {
    setPaid(true);
  };

  return (
    <div>
      <SideMenu />
      <h1>가상 결제 테스트</h1>
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <option value="">상품 선택</option>
        {dummyProducts.map((product) => (
          <option value={product.id} key={product.id}>
            {product.name} ({product.price}원)
          </option>
        ))}
      </select>
      {selectedProduct && (
        <div style={{ margin: "16px 0" }}>
          <b>상품명:</b> {selectedProduct.name} <br />
          <b>가격:</b> {selectedProduct.price}원 <br />
          <b>설명:</b> {selectedProduct.desc}
        </div>
      )}
      <button onClick={handlePay} disabled={!selectedId}>
        결제하기
      </button>
      {paid && <p style={{ color: "green" }}>결제가 완료됐습니다!</p>}
    </div>
  );
}
