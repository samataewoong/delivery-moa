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
      </ul>
    </aside>
  );
}
