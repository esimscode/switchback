import { ImageResponse } from "next/og";

// Branded share card for switchback.careers (Open Graph / Twitter). Lime ground
// with the ink mark, the product's plainest value prop, and the domain — matches
// the landing hero and the demo video's brand card. Brand rule (docs/brand.md):
// the mark is ink-on-lime, never recolored or filled.
export const alt = "Switchback — a career strategist that never oversells you.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#dceeb1",
          color: "#0a0a0a",
          padding: "76px 84px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg width="74" height="74" viewBox="0 0 100 100" fill="none">
            <path
              d="M 12 88 L 62 88 C 84 88 84 57 62 57 L 38 57 C 16 57 16 26 38 26 L 88 26"
              stroke="#0a0a0a"
              strokeWidth={13}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div style={{ display: "flex", fontSize: 46, fontWeight: 600, letterSpacing: "-0.02em" }}>
            switchback
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 82,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: 950,
          }}
        >
          A career strategist that never oversells you.
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 30,
          }}
        >
          <div style={{ display: "flex", opacity: 0.6 }}>
            Same mountain. Higher ground.
          </div>
          <div style={{ display: "flex", fontWeight: 600 }}>switchback.careers</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
