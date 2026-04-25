import { ORG, bc } from "../../utils/homeConstants";

export default function SecLabel({ children }) {
  return (
    <div className="at-reveal" style={{
      display: "flex", alignItems: "center", gap: 12, marginBottom: 18,
      ...bc(11, 700, { letterSpacing: 5, textTransform: "uppercase", color: ORG }),
    }}>
      <div style={{ width: 28, height: 2, background: ORG, flexShrink: 0 }}/>
      {children}
    </div>
  );
}
