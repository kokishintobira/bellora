import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Command Dojo — tmux & Neovim のコマンドを体で覚える";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const KEY_BADGES = ["Ctrl-b %", "dd", ":wq", "Ctrl-b c", "yy", ":sp", "Ctrl-b d", "ciw"];

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        {/* Window dots */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 32,
            display: "flex",
            gap: 10,
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#ff5f57" }} />
          <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#febc2e" }} />
          <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#28c840" }} />
        </div>

        {/* Scanline */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.03) 2px, rgba(0,255,65,0.03) 4px)",
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#00ff41",
            textShadow: "0 0 40px rgba(0,255,65,0.3)",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          ⌨ Command Dojo
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#888888",
            marginTop: 12,
          }}
        >
          tmux & Neovim のコマンドを体で覚える
        </div>

        {/* Key badges */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 40,
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 900,
          }}
        >
          {KEY_BADGES.map((key) => (
            <div
              key={key}
              style={{
                backgroundColor: "#00ff41",
                color: "#0a0a0a",
                padding: "8px 20px",
                borderRadius: 6,
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              {key}
            </div>
          ))}
        </div>

        {/* Free badge */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              border: "1px solid #ffb000",
              color: "#ffb000",
              padding: "6px 16px",
              borderRadius: 20,
              fontSize: 18,
            }}
          >
            無料・登録不要
          </div>
          <div style={{ fontSize: 20, color: "#555555" }}>bellora.jp/dojo</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
