"use client";

/* ───── Terminal Preview ─────
   Renders a visual terminal simulation for each question scene.
   Shows "before" state during play, transitions to "after" on correct answer.
   ─────────────────────────── */

/* ───── State Types ───── */

interface TmuxState {
  type: "tmux";
  session: string;
  layout: "single" | "split-h" | "split-v";
  panes: { lines: string[]; active?: boolean }[];
  windows: { name: string; active?: boolean }[];
  overlay?: string;
  command?: string;
}

interface NvimState {
  type: "nvim";
  lines: { text: string; hl?: boolean }[];
  cursor: number;
  mode: string;
  cmd?: string;
  msg?: string;
  recording?: string;
}

interface ShellState {
  type: "shell";
  lines: string[];
}

type FrameState = TmuxState | NvimState | ShellState;

interface SceneDef {
  before: FrameState;
  after: FrameState;
}

/* ───── Helper constructors ───── */

const tmux = (
  opts: Omit<TmuxState, "type">
): TmuxState => ({ type: "tmux", ...opts });

const nvim = (
  opts: Omit<NvimState, "type">
): NvimState => ({ type: "nvim", ...opts });

const shell = (lines: string[]): ShellState => ({ type: "shell", lines });

const L = (text: string, hl = false) => ({ text, hl });
const W = (name: string, active = false) => ({ name, active });
const P = (lines: string[], active = false) => ({ lines, active });

/* ───── Shared content ───── */

const SHELL_PROMPT = "~/dev $";
const TMUX_PANE = [SHELL_PROMPT + " ls", "src/  package.json", SHELL_PROMPT];
const NVIM_LINES = [
  L('const greet = () => {'),
  L('  console.log("Hello");'),
  L("  return true;"),
  L("};"),
];
const NVIM_3_LINES = [
  L('const greet = () => {'),
  L("  return true;"),
  L("};"),
];

/* ───── Scene Definitions ───── */

const SCENES: Record<string, SceneDef> = {
  /* ── tmux Level 1 ── */
  "session-start": {
    before: shell([SHELL_PROMPT]),
    after: tmux({
      session: "0", layout: "single",
      panes: [P([SHELL_PROMPT], true)],
      windows: [W("bash", true)],
    }),
  },
  "session-named": {
    before: shell([SHELL_PROMPT]),
    after: tmux({
      session: "work", layout: "single",
      panes: [P([SHELL_PROMPT], true)],
      windows: [W("bash", true)],
    }),
  },
  "detach": {
    before: tmux({
      session: "0", layout: "single",
      panes: [P(TMUX_PANE, true)],
      windows: [W("bash", true)],
    }),
    after: shell([SHELL_PROMPT, "[detached (from session 0)]", SHELL_PROMPT]),
  },
  "session-list": {
    before: shell([SHELL_PROMPT]),
    after: shell([
      "0: 1 windows (created Sun Mar 15)",
      "work: 2 windows (created Sun Mar 15)",
      SHELL_PROMPT,
    ]),
  },
  "session-attach": {
    before: shell([SHELL_PROMPT]),
    after: tmux({
      session: "0", layout: "single",
      panes: [P(TMUX_PANE, true)],
      windows: [W("bash", true)],
    }),
  },

  /* ── tmux Level 2 ── */
  "split-h": {
    before: tmux({
      session: "0", layout: "single",
      panes: [P(TMUX_PANE, true)],
      windows: [W("bash", true)],
    }),
    after: tmux({
      session: "0", layout: "split-h",
      panes: [P(TMUX_PANE, true), P([SHELL_PROMPT])],
      windows: [W("bash", true)],
    }),
  },
  "split-v": {
    before: tmux({
      session: "0", layout: "single",
      panes: [P(TMUX_PANE, true)],
      windows: [W("bash", true)],
    }),
    after: tmux({
      session: "0", layout: "split-v",
      panes: [P(TMUX_PANE, true), P([SHELL_PROMPT])],
      windows: [W("bash", true)],
    }),
  },
  "pane-next": {
    before: tmux({
      session: "0", layout: "split-h",
      panes: [P(TMUX_PANE, true), P([SHELL_PROMPT])],
      windows: [W("bash", true)],
    }),
    after: tmux({
      session: "0", layout: "split-h",
      panes: [P(TMUX_PANE), P([SHELL_PROMPT], true)],
      windows: [W("bash", true)],
    }),
  },
  "window-new": {
    before: tmux({
      session: "0", layout: "single",
      panes: [P(TMUX_PANE, true)],
      windows: [W("bash", true)],
    }),
    after: tmux({
      session: "0", layout: "single",
      panes: [P([SHELL_PROMPT], true)],
      windows: [W("bash"), W("bash", true)],
    }),
  },
  "window-next": {
    before: tmux({
      session: "0", layout: "single",
      panes: [P(TMUX_PANE, true)],
      windows: [W("bash", true), W("vim")],
    }),
    after: tmux({
      session: "0", layout: "single",
      panes: [P(["~/dev $ vim ."], true)],
      windows: [W("bash"), W("vim", true)],
    }),
  },

  /* ── tmux Level 3 ── */
  "copy-mode": {
    before: tmux({
      session: "0", layout: "single",
      panes: [P(TMUX_PANE, true)],
      windows: [W("bash", true)],
    }),
    after: tmux({
      session: "0", layout: "single",
      panes: [P(TMUX_PANE, true)],
      windows: [W("bash", true)],
      overlay: "[0/42]",
    }),
  },
  "paste": {
    before: tmux({
      session: "0", layout: "single",
      panes: [P([SHELL_PROMPT], true)],
      windows: [W("bash", true)],
    }),
    after: tmux({
      session: "0", layout: "single",
      panes: [P([SHELL_PROMPT + " echo hello"], true)],
      windows: [W("bash", true)],
    }),
  },
  "break-pane": {
    before: tmux({
      session: "0", layout: "split-h",
      panes: [P(TMUX_PANE), P([SHELL_PROMPT], true)],
      windows: [W("bash", true)],
    }),
    after: tmux({
      session: "0", layout: "single",
      panes: [P([SHELL_PROMPT], true)],
      windows: [W("bash"), W("bash", true)],
    }),
  },
  "tmux-command": {
    before: tmux({
      session: "0", layout: "single",
      panes: [P(TMUX_PANE, true)],
      windows: [W("bash", true)],
    }),
    after: tmux({
      session: "0", layout: "single",
      panes: [P(TMUX_PANE, true)],
      windows: [W("bash", true)],
      command: ":",
    }),
  },
  "layout-cycle": {
    before: tmux({
      session: "0", layout: "split-h",
      panes: [P(TMUX_PANE, true), P([SHELL_PROMPT])],
      windows: [W("bash", true)],
    }),
    after: tmux({
      session: "0", layout: "split-v",
      panes: [P(TMUX_PANE, true), P([SHELL_PROMPT])],
      windows: [W("bash", true)],
    }),
  },

  /* ── nvim Level 1 ── */
  "mode-insert": {
    before: nvim({ lines: NVIM_LINES, cursor: 0, mode: "NORMAL" }),
    after:  nvim({ lines: NVIM_LINES, cursor: 0, mode: "INSERT", msg: "-- INSERT --" }),
  },
  "mode-normal": {
    before: nvim({ lines: NVIM_LINES, cursor: 0, mode: "INSERT", msg: "-- INSERT --" }),
    after:  nvim({ lines: NVIM_LINES, cursor: 0, mode: "NORMAL" }),
  },
  "file-save": {
    before: nvim({ lines: NVIM_LINES, cursor: 0, mode: "NORMAL" }),
    after:  nvim({ lines: NVIM_LINES, cursor: 0, mode: "NORMAL", msg: '"app.ts" 4L, 68B written' }),
  },
  "file-save-quit": {
    before: nvim({ lines: NVIM_LINES, cursor: 0, mode: "NORMAL" }),
    after:  shell([SHELL_PROMPT + "  # nvim terminated", SHELL_PROMPT]),
  },
  "file-quit-force": {
    before: nvim({ lines: NVIM_LINES, cursor: 0, mode: "NORMAL", msg: "[Modified]" }),
    after:  shell([SHELL_PROMPT + "  # changes discarded", SHELL_PROMPT]),
  },

  /* ── nvim Level 2 ── */
  "delete-line": {
    before: nvim({ lines: NVIM_LINES, cursor: 1, mode: "NORMAL" }),
    after:  nvim({ lines: [NVIM_LINES[0], NVIM_LINES[2], NVIM_LINES[3]], cursor: 1, mode: "NORMAL" }),
  },
  "yank-line": {
    before: nvim({ lines: NVIM_LINES, cursor: 1, mode: "NORMAL" }),
    after:  nvim({
      lines: [NVIM_LINES[0], L(NVIM_LINES[1].text, true), NVIM_LINES[2], NVIM_LINES[3]],
      cursor: 1, mode: "NORMAL", msg: "1 line yanked",
    }),
  },
  "undo": {
    before: nvim({ lines: NVIM_3_LINES, cursor: 1, mode: "NORMAL" }),
    after:  nvim({ lines: NVIM_LINES, cursor: 1, mode: "NORMAL", msg: "1 change; before #2" }),
  },
  "search": {
    before: nvim({ lines: NVIM_LINES, cursor: 0, mode: "NORMAL" }),
    after:  nvim({ lines: NVIM_LINES, cursor: 0, mode: "NORMAL", cmd: "/" }),
  },
  "goto-top": {
    before: nvim({ lines: NVIM_LINES, cursor: 3, mode: "NORMAL" }),
    after:  nvim({ lines: NVIM_LINES, cursor: 0, mode: "NORMAL" }),
  },

  /* ── nvim Level 3 ── */
  "visual-block": {
    before: nvim({ lines: NVIM_LINES, cursor: 0, mode: "NORMAL" }),
    after:  nvim({
      lines: [L(NVIM_LINES[0].text, true), L(NVIM_LINES[1].text, true), L(NVIM_LINES[2].text, true), NVIM_LINES[3]],
      cursor: 0, mode: "V-BLOCK", msg: "-- VISUAL BLOCK --",
    }),
  },
  "substitute": {
    before: nvim({
      lines: [L('let foo = 1;'), L('let foo = 2;'), L('console.log(foo);'), L("")],
      cursor: 0, mode: "NORMAL",
    }),
    after: nvim({
      lines: [L('let bar = 1;'), L('let bar = 2;'), L('console.log(bar);'), L("")],
      cursor: 0, mode: "NORMAL", msg: "3 substitutions on 3 lines",
    }),
  },
  "word-search": {
    before: nvim({ lines: NVIM_LINES, cursor: 0, mode: "NORMAL" }),
    after:  nvim({
      lines: [L(NVIM_LINES[0].text, true), NVIM_LINES[1], L(NVIM_LINES[2].text, true), NVIM_LINES[3]],
      cursor: 0, mode: "NORMAL", msg: "/\\<const\\>",
    }),
  },
  "macro-record": {
    before: nvim({ lines: NVIM_LINES, cursor: 0, mode: "NORMAL" }),
    after:  nvim({ lines: NVIM_LINES, cursor: 0, mode: "NORMAL", recording: "a" }),
  },
  "editor-split": {
    before: nvim({ lines: NVIM_LINES, cursor: 0, mode: "NORMAL" }),
    after:  nvim({ lines: NVIM_LINES, cursor: 0, mode: "NORMAL", msg: "── split ──" }),
  },
};

/* ───── Renderers ───── */

function TerminalFrame({
  title,
  children,
  borderColor,
}: {
  title: string;
  children: React.ReactNode;
  borderColor?: string;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden border transition-all duration-500"
      style={{ borderColor: borderColor || "var(--color-border)" }}
    >
      {/* Title bar */}
      <div className="bg-[#222] px-3 py-1.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
          <span className="w-2 h-2 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[10px] text-[#777] ml-1">{title}</span>
      </div>
      {/* Content */}
      <div className="bg-[#0e0e0e] min-h-[140px] text-[11px] leading-[1.6] font-mono relative">
        {children}
      </div>
    </div>
  );
}

function ShellView({ state }: { state: ShellState }) {
  return (
    <div className="p-2">
      {state.lines.map((line, i) => (
        <div key={i} className="text-[#ccc]">
          {line.startsWith("~/") ? (
            <>
              <span className="text-[var(--color-primary)]">{line.split("$")[0]}$</span>
              <span>{line.split("$").slice(1).join("$")}</span>
            </>
          ) : (
            <span>{line}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function TmuxPane({
  pane,
}: {
  pane: { lines: string[]; active?: boolean };
}) {
  return (
    <div
      className={`p-1.5 flex-1 min-h-[80px] ${
        pane.active ? "bg-[#0e0e0e]" : "bg-[#0a0a0a]"
      }`}
    >
      {pane.lines.map((line, i) => (
        <div key={i} className="text-[#ccc] truncate">
          {line.startsWith("~/") ? (
            <>
              <span className="text-[var(--color-primary)]">{line.split("$")[0]}$</span>
              <span>{line.split("$").slice(1).join("$")}</span>
            </>
          ) : (
            line
          )}
        </div>
      ))}
      {pane.active && (
        <span className="cursor-blink text-[var(--color-primary)]">▋</span>
      )}
    </div>
  );
}

function TmuxView({ state }: { state: TmuxState }) {
  return (
    <>
      {/* Pane area */}
      <div
        className={`min-h-[100px] ${
          state.layout === "split-h"
            ? "flex"
            : state.layout === "split-v"
              ? "flex flex-col"
              : ""
        }`}
      >
        {state.panes.map((pane, i) => (
          <div
            key={i}
            className={`flex-1 ${
              i > 0
                ? state.layout === "split-h"
                  ? "border-l border-[#444]"
                  : "border-t border-[#444]"
                : ""
            }`}
          >
            <TmuxPane pane={pane} />
          </div>
        ))}
      </div>

      {/* Overlay */}
      {state.overlay && (
        <div className="absolute top-1 right-2 text-[10px] text-[var(--color-accent)] bg-[#222] px-2 py-0.5 rounded">
          {state.overlay}
        </div>
      )}

      {/* Status bar */}
      <div className="bg-[#005f00] px-2 py-0.5 flex justify-between text-[10px]">
        <div className="flex gap-2">
          <span className="text-[#afd700]">[{state.session}]</span>
          {state.windows.map((w, i) => (
            <span
              key={i}
              className={w.active ? "text-white font-bold" : "text-[#87af5f]"}
            >
              {i}:{w.name}{w.active ? "*" : ""}
            </span>
          ))}
        </div>
        {state.command && (
          <span className="text-white">{state.command}</span>
        )}
      </div>
    </>
  );
}

function NvimView({
  state,
  isSplit,
}: {
  state: NvimState;
  isSplit?: boolean;
}) {
  const maxLines = isSplit ? 2 : 5;
  const emptySlots = Math.max(0, maxLines - state.lines.length);

  return (
    <>
      {/* Editor area */}
      <div className="p-1">
        {state.lines.slice(0, maxLines).map((line, i) => (
          <div
            key={i}
            className={`flex ${
              line.hl
                ? "bg-[#264f78]"
                : i === state.cursor
                  ? "bg-[#1a1a2e]"
                  : ""
            }`}
          >
            <span className="w-6 text-right pr-2 text-[#555] select-none shrink-0">
              {i + 1}
            </span>
            <span className="text-[#ccc]">
              {i === state.cursor ? (
                <>
                  <span className="bg-[var(--color-primary)] text-black">
                    {line.text[0] || " "}
                  </span>
                  <span>{line.text.slice(1)}</span>
                </>
              ) : (
                line.text
              )}
            </span>
          </div>
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div key={`empty-${i}`} className="flex">
            <span className="w-6 text-right pr-2 text-[#4444ff] select-none shrink-0">~</span>
            <span />
          </div>
        ))}
      </div>

      {/* Recording indicator */}
      {state.recording && (
        <div className="absolute top-1 right-2 text-[10px] text-[var(--color-error)]">
          recording @{state.recording}
        </div>
      )}

      {/* Status line */}
      <div className="bg-[#1c1c1c] border-t border-[#333] px-2 py-0.5 flex justify-between text-[10px]">
        <span
          className={`font-bold ${
            state.mode === "NORMAL"
              ? "text-[var(--color-primary)]"
              : state.mode === "INSERT"
                ? "text-[var(--color-accent)]"
                : "text-[#ff79c6]"
          }`}
        >
          {state.mode}
        </span>
        <span className="text-[#777]">
          {state.cursor + 1},1 &nbsp; All
        </span>
      </div>

      {/* Command / message line */}
      <div className="px-2 py-0.5 text-[10px] min-h-[18px]">
        {state.cmd ? (
          <span className="text-white">
            {state.cmd}
            <span className="cursor-blink text-white">▋</span>
          </span>
        ) : state.msg ? (
          <span className="text-[#aaa]">{state.msg}</span>
        ) : null}
      </div>
    </>
  );
}

/* ───── Main Component ───── */

interface TerminalPreviewProps {
  scene?: string;
  phase: "before" | "after";
  isCorrect?: boolean;
}

export function TerminalPreview({
  scene,
  phase,
  isCorrect,
}: TerminalPreviewProps) {
  if (!scene || !SCENES[scene]) return null;

  const sceneDef = SCENES[scene];
  const state = phase === "after" ? sceneDef.after : sceneDef.before;

  const borderColor =
    phase === "after"
      ? isCorrect
        ? "var(--color-success)"
        : "var(--color-error)"
      : undefined;

  // Special case: editor-split "after" shows two nvim editors stacked
  if (scene === "editor-split" && phase === "after" && state.type === "nvim") {
    const topFile: NvimState = {
      ...state,
      lines: [L("# file.txt"), L("new file content")],
      cursor: 0,
      msg: undefined,
    };
    return (
      <TerminalFrame title="nvim" borderColor={borderColor}>
        <NvimView state={topFile} isSplit />
        <div className="border-t border-[#444]" />
        <NvimView state={{ ...state, msg: undefined }} isSplit />
      </TerminalFrame>
    );
  }

  const title =
    state.type === "tmux"
      ? "tmux"
      : state.type === "nvim"
        ? "nvim"
        : "terminal";

  return (
    <TerminalFrame title={title} borderColor={borderColor}>
      {state.type === "shell" && <ShellView state={state} />}
      {state.type === "tmux" && <TmuxView state={state} />}
      {state.type === "nvim" && <NvimView state={state} />}
    </TerminalFrame>
  );
}
