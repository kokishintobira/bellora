"use client";

import { useMemo, useRef, useState } from "react";
import styles from "./KidsGame.module.css";

type Mode = "word" | "number";
type EffectKind = "good" | "miss" | "soft";

type Round = {
  target: string;
  letters: string[];
  decoys: string[];
};

type Token = {
  id: string;
  text: string;
  order: number;
  target: boolean;
  x: number;
  y: number;
  twist: number;
  color: string;
};

type Effect = {
  id: string;
  kind: EffectKind | "spark";
  x: number;
  y: number;
};

const colors = ["#fffdfa", "#fff3a6", "#b8f2d5", "#ffd1dc", "#d8f7ff", "#ffe1a8"];

const hiraganaDecoys = ["あ", "か", "き", "く", "け", "こ", "さ", "し", "す", "そ", "た", "ち"];
const alphabetDecoys = ["B", "C", "D", "F", "G", "H", "J", "K", "M", "N", "R", "Y"];
const katakanaDecoys = ["ア", "カ", "キ", "ク", "ケ", "コ", "サ", "シ", "ス", "ソ", "タ", "チ"];

const wordRounds: Round[] = [
  ...[
    "りんご",
    "ばなな",
    "みかん",
    "ごはん",
    "みず",
    "くるま",
    "ねこ",
    "いぬ",
    "せんせい",
    "おいしゃさん",
  ].map((target) => ({ target, letters: [...target], decoys: hiraganaDecoys })),
  ...[
    "APPLE",
    "BANANA",
    "ORANGE",
    "WATER",
    "MILK",
    "CAR",
    "CAT",
    "DOG",
    "TEACHER",
    "DOCTOR",
  ].map((target) => ({ target, letters: [...target], decoys: alphabetDecoys })),
  ...[
    "リンゴ",
    "バナナ",
    "オレンジ",
    "ミルク",
    "パン",
    "クルマ",
    "ネコ",
    "イヌ",
    "センセイ",
    "ドクター",
  ].map((target) => ({ target, letters: [...target], decoys: katakanaDecoys })),
];

function makeNumberRound(): Round {
  const numbers = Array.from({ length: 100 }, (_, index) => String(index + 1));
  const selected = shuffle(numbers)
    .slice(0, 10)
    .sort((left, right) => Number(left) - Number(right));
  const selectedSet = new Set(selected);
  const decoys = shuffle(numbers.filter((number) => !selectedSet.has(number))).slice(0, 12);

  return {
    target: "1から100",
    letters: selected,
    decoys,
  };
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function pickPositions(count: number) {
  const positions: Array<{ x: number; y: number }> = [];
  let attempts = 0;

  while (positions.length < count && attempts < 800) {
    attempts += 1;
    const candidate = {
      x: 9 + Math.random() * 82,
      y: 13 + Math.random() * 76,
    };
    const spaced = positions.every((pos) => {
      const dx = pos.x - candidate.x;
      const dy = pos.y - candidate.y;
      return Math.hypot(dx, dy) > 14;
    });

    if (spaced) positions.push(candidate);
  }

  while (positions.length < count) {
    positions.push({ x: 10 + Math.random() * 80, y: 14 + Math.random() * 74 });
  }

  return shuffle(positions);
}

function makeTokens(round: Round, seed: string): Token[] {
  const tokens = shuffle([
    ...round.letters.map((text, order) => ({ text, order, target: true })),
    ...round.decoys.map((text) => ({ text, order: -1, target: false })),
  ]);
  const positions = pickPositions(tokens.length);

  return tokens.map((token, index) => ({
    ...token,
    id: `${seed}-${index}-${token.text}`,
    x: positions[index].x,
    y: positions[index].y,
    twist: Math.round(Math.random() * 36 - 18),
    color: colors[index % colors.length],
  }));
}

function rippleClass(kind: EffectKind) {
  if (kind === "good") return `${styles.ripple} ${styles.rippleGood}`;
  if (kind === "miss") return `${styles.ripple} ${styles.rippleMiss}`;
  return `${styles.ripple} ${styles.rippleSoft}`;
}

export function KidsGame() {
  const [mode, setMode] = useState<Mode>("word");
  const [roundIndex, setRoundIndex] = useState(0);
  const [found, setFound] = useState(0);
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [missId, setMissId] = useState<string | null>(null);
  const [effects, setEffects] = useState<Effect[]>([]);
  const sceneRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const round = useMemo(
    () => (mode === "word" ? wordRounds[roundIndex % wordRounds.length] : makeNumberRound()),
    [mode, roundIndex]
  );
  const tokens = useMemo(
    () => makeTokens(round, `${mode}-${roundIndex}`),
    [mode, roundIndex, round]
  );

  function playTone(kind: "good" | "miss") {
    const AudioContextConstructor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;

    audioRef.current ||= new AudioContextConstructor();
    const audioContext = audioRef.current;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = kind === "good" ? 660 : 180;
    gain.gain.setValueAtTime(0.001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.18);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  }

  function resetRound(nextMode = mode, nextIndex = roundIndex) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMode(nextMode);
    setRoundIndex(nextIndex);
    setFound(0);
    setFoundIds([]);
    setMissId(null);
    setEffects([]);
  }

  function addEffect(x: number, y: number, kind: EffectKind) {
    const rippleId = `${Date.now()}-${Math.random()}-${kind}`;
    setEffects((current) => [...current, { id: rippleId, kind, x, y }]);

    if (kind === "good") {
      const sparkId = `${rippleId}-spark`;
      setEffects((current) => [...current, { id: sparkId, kind: "spark", x, y }]);
    }
  }

  function removeEffect(id: string) {
    setEffects((current) => current.filter((effect) => effect.id !== id));
  }

  function pointFromEvent(event: React.PointerEvent) {
    const sceneRect = sceneRef.current?.getBoundingClientRect();
    if (!sceneRect) return { x: 0, y: 0 };
    return {
      x: event.clientX - sceneRect.left,
      y: event.clientY - sceneRect.top,
    };
  }

  function handleToken(token: Token, event: React.PointerEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const wanted = round.letters[found];
    const isCorrect = token.target && token.text === wanted && !foundIds.includes(token.id);
    const point = pointFromEvent(event);

    if (!isCorrect) {
      setMissId(null);
      window.requestAnimationFrame(() => setMissId(token.id));
      addEffect(point.x, point.y, "miss");
      playTone("miss");
      return;
    }

    setFoundIds((current) => [...current, token.id]);
    const nextFound = found + 1;
    setFound(nextFound);
    addEffect(point.x, point.y, "good");
    playTone("good");

    if (nextFound === round.letters.length) {
      timeoutRef.current = setTimeout(() => {
        resetRound(mode, roundIndex + 1);
      }, 1800);
    }
  }

  function handleModeChange(nextMode: Mode) {
    resetRound(nextMode, 0);
  }

  function handleScenePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) return;
    const point = pointFromEvent(event);
    addEffect(point.x, point.y, "soft");
  }

  const finished = found === round.letters.length;
  const targetLabel = mode === "number" ? "ちいさいじゅんに さがそう" : "さがすことば";
  const targetText = mode === "number" ? (finished ? "できた！" : `つぎは ${round.letters[found]}`) : round.target;

  return (
    <div className={styles.page}>
      <main className={styles.shell}>
        <section className={styles.topBar} aria-label="ゲームのそうさ">
          <div>
            <p className={styles.eyebrow}>4さいからの さがしあそび</p>
            <h1 className={styles.title}>みつけてタップ！</h1>
          </div>
          <div className={styles.modeSwitch} role="tablist" aria-label="ゲームをえらぶ">
            {(["word", "number"] as const).map((item) => (
              <button
                key={item}
                className={`${styles.modeButton} ${mode === item ? styles.modeButtonActive : ""}`}
                type="button"
                role="tab"
                aria-selected={mode === item}
                onClick={() => handleModeChange(item)}
              >
                {item === "word" ? "ことば" : "すうじ"}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.statusPanel} aria-live="polite">
          <div className={styles.targetCard}>
            <span className={styles.targetLabel}>{targetLabel}</span>
            <strong className={styles.targetText}>{targetText}</strong>
          </div>
          <div className={styles.progressCard}>
            <span className={styles.progressText}>
              {found} / {round.letters.length}
            </span>
            <div className={styles.stars} aria-hidden="true">
              {"★".repeat(found)}
            </div>
          </div>
          <button
            className={styles.roundButton}
            type="button"
            aria-label="つぎのもんだい"
            onClick={() => resetRound(mode, roundIndex + 1)}
          >
            ↻
          </button>
        </section>

        <section className={styles.playArea} aria-label="さがすばしょ">
          <div
            className={styles.scene}
            ref={sceneRef}
            onPointerDown={handleScenePointerDown}
          >
            <div className={styles.scenePattern} aria-hidden="true" />
            <div className={styles.tokenLayer}>
              {tokens.map((token) => (
                <button
                  key={token.id}
                  className={[
                    styles.token,
                    mode === "number" ? styles.tokenNumber : "",
                    foundIds.includes(token.id) ? styles.tokenFound : "",
                    missId === token.id ? styles.tokenMiss : "",
                  ].join(" ")}
                  type="button"
                  style={{
                    left: `${token.x}%`,
                    top: `${token.y}%`,
                    background: token.color,
                    "--twist": `${token.twist}deg`,
                  } as React.CSSProperties}
                  aria-label={`${token.text} をタップ`}
                  onPointerDown={(event) => handleToken(token, event)}
                >
                  {token.text}
                </button>
              ))}
            </div>

            {effects.map((effect) =>
              effect.kind === "spark" ? (
                <span
                  key={effect.id}
                  className={styles.spark}
                  style={{ "--x": `${effect.x}px`, "--y": `${effect.y}px` } as React.CSSProperties}
                  aria-hidden="true"
                  onAnimationEnd={() => removeEffect(effect.id)}
                >
                  ★
                </span>
              ) : (
                <span
                  key={effect.id}
                  className={rippleClass(effect.kind)}
                  style={{ "--x": `${effect.x}px`, "--y": `${effect.y}px` } as React.CSSProperties}
                  aria-hidden="true"
                  onAnimationEnd={() => removeEffect(effect.id)}
                />
              )
            )}

            {finished && (
              <div className={styles.finishPop}>
                <strong>できた！</strong>
                <span>つぎも やってみよう</span>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
