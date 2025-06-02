import Header from "../components/Header";

export default function StoreListPage() {
    return (
        <>
            <Header/>
            <div className={styles["circle_category_wrap"]}>
                {categories.map((item) => (
                    <Link key={item.id} to="/">
                        <div className={styles["circle_with_text"]}>
                            <div className={styles["circle"]}>
                                <img
                                    src={`${imgBaseUrl}${item.id}.png`}
                                    alt={`${item.category} 이미지`} />
                            </div>
                            <div className={styles["circle_text"]}>{item.category}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
};