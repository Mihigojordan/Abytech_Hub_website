export default function LogoSVG({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <polygon points="100,10 190,190 155,190 100,70 45,190 10,190" fill="#1a5c78"/>
      <polygon points="100,70 83,128 117,128" fill="#071418"/>
      <rect x="118" y="18" width="68" height="24" fill="#e8621a"/>
      <rect x="137" y="18" width="30" height="96" fill="#e8621a"/>
    </svg>
  );
}
