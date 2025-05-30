export default function FormattedDate({ dateString }) {
  if (!dateString) return <span>날짜 없음</span>;

  const date = new Date(dateString);
  if (isNaN(date)) return <span>날짜 형식 오류</span>;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return <span>{`${year}-${month}-${day}`}</span>;
}