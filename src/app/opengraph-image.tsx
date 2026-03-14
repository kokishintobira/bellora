import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Command Dojo — tmux/Neovim コマンド想起練習ツール";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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

        {/* Scanline overlay */}
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
            fontSize: 80,
            fontWeight: 900,
            color: "#00ff41",
            letterSpacing: "-2px",
            textShadow: "0 0 40px rgba(0,255,65,0.3)",
          }}
        >
          Command Dojo
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: "#888888",
            marginTop: 16,
          }}
        >
          tmux / Neovim コマンド想起練習
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 22,
            color: "#555555",
          }}
        >
          bellora.jp
        </div>
      </div>
    ),
    { ...size }
  );
}
