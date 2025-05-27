import { Link } from "react-router-dom";

export default function SideMenu() {
  return (
    <aside>
      <ul>
        <li>
          <Link to="../">Home</Link>
        </li>
        <li>
          <Link to="/mypages/orderlist">주문 내역</Link>
        </li>
        <li>
          <Link to="/mypages/profile">프로필</Link>
        </li>
        <li>
          <Link to="/order">주문</Link>
        </li>
        <li>
          <Link to="/Pay">결제?</Link>
        </li>
        <li>
          <Link to="/Test">포인트 및 결제</Link>
        </li>
        <li>
          <Link to="/qna">문의게시판</Link>
        </li>
      </ul>
    </aside>
  );
}
