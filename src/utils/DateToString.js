export default function DateToString(date) {
    if (!date) return "";
    const dObj = new Date(date);
    const year = dObj.getFullYear();
    const month = String(dObj.getMonth() + 1).padStart(2, '0');
    const day = String(dObj.getDate()).padStart(2, '0');
    const hours = String(dObj.getHours()).padStart(2, '0');
    const minutes = String(dObj.getMinutes()).padStart(2, '0');
    const seconds = String(dObj.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}