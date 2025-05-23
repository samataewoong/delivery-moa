import { BrowserRouter, Routes, Route } from react-router-dom;
import { Outlet } from "react-router-dom";

export default function TestLayout() {
    return (
        <div>
            <navbar />
            <div style={{display: "flex"}}>
                <sidemenu />
                <main style={{ flex: 1}}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}