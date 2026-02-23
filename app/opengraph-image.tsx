import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "A Sneaker Life — Best Sneaker Deals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo / wordmark */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-4px",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            A SNEAKER LIFE
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#888",
              letterSpacing: "8px",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Best Sneaker Deals Daily
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 80, height: 4, background: "#fff" }} />

        {/* Tagline */}
        <div
          style={{
            fontSize: 22,
            color: "#aaa",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          Nike · Jordan · Adidas · New Balance
        </div>
      </div>
    ),
    { ...size }
  );
}
