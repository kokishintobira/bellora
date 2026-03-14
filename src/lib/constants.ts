import type { ToolCategory } from "@/types";

export const SITE_NAME = "Bellora";
export const SITE_TAGLINE = "tmux/Neovim コマンド練習ツール Command Dojo";
export const SITE_DESCRIPTION =
  "tmuxとNeovimのコマンドをゲーム形式で反復練習できる無料Webアプリ。実際のキー入力とターミナルプレビューで、コマンドを体で覚える。";
export const SITE_URL = process.env.SITE_URL ?? "https://bellora.jp";
export const CONTACT_EMAIL = "contact@bellora.jp";

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  chatbot: "チャットボット",
  "image-gen": "画像生成",
  coding: "コーディング",
  productivity: "生産性",
  video: "動画",
  audio: "音声",
  writing: "ライティング",
  research: "リサーチ",
  other: "その他",
};

export const CATEGORY_EMOJI: Record<ToolCategory, string> = {
  chatbot: "\u{1F4AC}",
  "image-gen": "\u{1F3A8}",
  coding: "\u{1F4BB}",
  productivity: "\u{26A1}",
  video: "\u{1F3AC}",
  audio: "\u{1F3B5}",
  writing: "\u{270F}\u{FE0F}",
  research: "\u{1F50D}",
  other: "\u{1F4E6}",
};

export const ALL_CATEGORIES: ToolCategory[] = [
  "chatbot",
  "image-gen",
  "coding",
  "productivity",
  "video",
  "audio",
  "writing",
  "research",
  "other",
];

