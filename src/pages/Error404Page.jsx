import style from "./Error404Page.module.css";

function Error404Page(){
    return(
        <>
            <div className={style["error_404box"]}>
                <h2> 잘못된 접근입니다.</h2>
            </div>
        </>
    )
}
export default Error404Page;