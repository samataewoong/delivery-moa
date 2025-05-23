import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Outlet } from "react-router-dom";
import SideMenu from "../../components/sidemenu";

export default function TestLayout() {
  return (
    <div>
      <div style={{ display: "flex" }}>
        <main style={{ flex: 1 }}>
          <SideMenu />
          <h2>테스트 레이아웃</h2>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
