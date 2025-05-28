import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function RootPage() {
    const navigate = useNavigate();
    useEffect(() => {
        navigate("/mainpage");
    }, []);
    return <></>; // No UI to render, just a redirect
}