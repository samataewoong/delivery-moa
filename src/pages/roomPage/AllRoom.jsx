import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Header from "../../components/Header";
import CloseRoom from "../../components/CloseRoom";
import { useLocation } from "react-router-dom";

export default function AllRoom() {
    const location = useLocation();
    const userId = location.state?.userId;
    console.log("userId:", userId)
    return (
        <>
            <Header />
            <div className="mapContainer">
                안녕    
                <CloseRoom userId={userId}></CloseRoom>
            </div>
            
        </>
    )
}