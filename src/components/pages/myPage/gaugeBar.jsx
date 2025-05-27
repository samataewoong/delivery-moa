export default function GaugeBar({ value = 0 }) {
  const safeValue = Math.min(Math.max(value, 0), 100);

  let fillColor = "#4caf50";
  if (safeValue < 40) fillColor = "#f44336"; // 빨강
  else if (safeValue < 70) fillColor = "#ffeb3b"; // 노랑

  return (
    
    <div
      className="gaugeBar"
      style={{ width:"255px", height: `20px` }}
      aria-label={`Progress: ${safeValue}%`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
    >
      <div
        className="gaugeFill"
        style={{ width: `${safeValue}%`, backgroundColor: fillColor }}
      ></div>
      <span className="gaugeText">{safeValue}p</span>
    </div>
  );
}
