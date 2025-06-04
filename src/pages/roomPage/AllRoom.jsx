import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Header from "../../components/Header";
import CloseRoom from "../../components/CloseRoom";

export default function AllRoom({userId}) {
    return (
        <>
            <Header />
            <CloseRoom userId={userId}></CloseRoom>
        </>
    )
}