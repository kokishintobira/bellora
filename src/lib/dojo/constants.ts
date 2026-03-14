import type { DojoTool, DojoLevel } from "@/types/dojo";

export const QUESTIONS_PER_GAME = 5;
export const UNLOCK_THRESHOLD = 0.7; // 70% to unlock next level
export const STORAGE_KEY = "dojo-stats";
export const SESSION_RESULT_KEY = "dojo-session-result";

export const TOOL_LABELS: Record<DojoTool, string> = {
  tmux: "tmux",
  nvim: "Neovim",
};

export const LEVEL_LABELS: Record<DojoLevel, string> = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
};

export const LEVEL_DESCRIPTIONS: Record<DojoLevel, string> = {
  1: "基本操作 — セッション管理、基本移動",
  2: "中級操作 — ウィンドウ/ペイン操作、テキスト編集",
  3: "上級操作 — カスタマイズ、マクロ、高度な操作",
};

export const AD_CODES = [
  // 1
  `<a href="https://px.a8.net/svt/ejp?a8mat=4AXISC+8QYCKA+5BJK+609HT" rel="nofollow"><img border="0" width="250" height="250" alt="" src="https://www27.a8.net/svt/bgt?aid=260224860529&wid=002&eno=01&mid=s00000024824001009000&mc=1"></a><img border="0" width="1" height="1" src="https://www17.a8.net/0.gif?a8mat=4AXISC+8QYCKA+5BJK+609HT" alt="">`,
  // 2
  `<a href="https://px.a8.net/svt/ejp?a8mat=4AXISC+8QYCKA+5BJK+60H7L" rel="nofollow"><img border="0" width="250" height="250" alt="" src="https://www27.a8.net/svt/bgt?aid=260224860529&wid=002&eno=01&mid=s00000024824001010000&mc=1"></a><img border="0" width="1" height="1" src="https://www15.a8.net/0.gif?a8mat=4AXISC+8QYCKA+5BJK+60H7L" alt="">`,
  // 3
  `<a href="https://px.a8.net/svt/ejp?a8mat=4AXISC+8C2HO2+3SPO+7S238X" rel="nofollow"><img border="0" width="250" height="250" alt="" src="https://www26.a8.net/svt/bgt?aid=260224860504&wid=001&eno=01&mid=s00000017718047039000&mc=1"></a><img border="0" width="1" height="1" src="https://www14.a8.net/0.gif?a8mat=4AXISC+8C2HO2+3SPO+7S238X" alt="">`,
  // 4
  `<a href="https://px.a8.net/svt/ejp?a8mat=4AXISC+8QCWYI+3IZO+I2XN5" rel="nofollow"><img border="0" width="250" height="250" alt="" src="https://www25.a8.net/svt/bgt?aid=260224860528&wid=002&eno=01&mid=s00000016458003037000&mc=1"></a><img border="0" width="1" height="1" src="https://www16.a8.net/0.gif?a8mat=4AXISC+8QCWYI+3IZO+I2XN5" alt="">`,
];
