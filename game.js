const tokenLayer = document.querySelector("#tokenLayer");
const targetText = document.querySelector("#targetText");
const progressText = document.querySelector("#progressText");
const stars = document.querySelector("#stars");
const finishPop = document.querySelector("#finishPop");
const newRoundButton = document.querySelector("#newRoundButton");
const modeButtons = Array.from(document.querySelectorAll(".mode-button"));
const scene = document.querySelector("#scene");

const colors = ["#fffdfa", "#fff3a6", "#b8f2d5", "#ffd1dc", "#d8f7ff", "#ffe1a8"];
const wordRounds = [
  { target: "らいおん", letters: ["ら", "い", "お", "ん"], decoys: ["く", "ま", "ね", "こ", "と", "り", "は", "な", "そ", "ゆ"] },
  { target: "ごはん", letters: ["ご", "は", "ん"], decoys: ["み", "ず", "ぱ", "に", "く", "さ", "か", "も", "こ", "え"] },
  { target: "APPLE", letters: ["A", "P", "P", "L", "E"], decoys: ["B", "C", "D", "F", "G", "M", "O", "S", "T", "Y"] },
];

let mode = "word";
let roundIndex = 0;
let expected = [];
let found = 0;
let audioContext;

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function pickPositions(count) {
  const positions = [];
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

function playTone(kind) {
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
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

function buildRound() {
  finishPop.hidden = true;
  tokenLayer.innerHTML = "";
  found = 0;

  const round =
    mode === "word"
      ? wordRounds[roundIndex % wordRounds.length]
      : { target: "1 から 10", letters: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], decoys: ["0", "11", "12", "13", "14", "15"] };

  expected = [...round.letters];
  targetText.textContent = round.target;
  updateProgress();

  const tokens = shuffle([
    ...round.letters.map((text, order) => ({ text, order, target: true })),
    ...round.decoys.map((text) => ({ text, order: -1, target: false })),
  ]);
  const positions = pickPositions(tokens.length);

  tokens.forEach((token, index) => {
    const button = document.createElement("button");
    button.className = "token";
    button.type = "button";
    button.textContent = token.text;
    button.style.left = `${positions[index].x}%`;
    button.style.top = `${positions[index].y}%`;
    button.style.background = colors[index % colors.length];
    button.style.setProperty("--twist", `${Math.round(Math.random() * 36 - 18)}deg`);
    button.dataset.text = token.text;
    button.dataset.order = String(token.order);
    button.dataset.target = String(token.target);
    button.setAttribute("aria-label", `${token.text} をタップ`);
    button.addEventListener("click", (event) => handleToken(button, event));
    tokenLayer.append(button);
  });
}

function addRippleAt(x, y, kind) {
  const ripple = document.createElement("span");

  ripple.className = `ripple ${kind}`;
  ripple.style.setProperty("--x", `${x}px`);
  ripple.style.setProperty("--y", `${y}px`);
  ripple.setAttribute("aria-hidden", "true");
  scene.append(ripple);
  ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
}

function addSparkAt(x, y) {
  const spark = document.createElement("span");

  spark.className = "spark";
  spark.textContent = "★";
  spark.style.setProperty("--x", `${x}px`);
  spark.style.setProperty("--y", `${y}px`);
  spark.setAttribute("aria-hidden", "true");
  scene.append(spark);
  spark.addEventListener("animationend", () => spark.remove(), { once: true });
}

function getEffectPoint(button, event) {
  const sceneRect = scene.getBoundingClientRect();
  if (event?.clientX && event?.clientY) {
    return {
      x: event.clientX - sceneRect.left,
      y: event.clientY - sceneRect.top,
    };
  }

  const tokenRect = button.getBoundingClientRect();
  return {
    x: tokenRect.left + tokenRect.width / 2 - sceneRect.left,
    y: tokenRect.top + tokenRect.height / 2 - sceneRect.top,
  };
}

function addTapEffect(button, kind, event) {
  const { x, y } = getEffectPoint(button, event);
  addRippleAt(x, y, kind);
  if (kind === "good") {
    addSparkAt(x, y);
  }
}

function handleToken(button, event) {
  const wanted = expected[found];
  const isCorrect = button.dataset.target === "true" && button.dataset.text === wanted && !button.classList.contains("found");

  if (!isCorrect) {
    button.classList.remove("miss");
    void button.offsetWidth;
    button.classList.add("miss");
    addTapEffect(button, "miss", event);
    playTone("miss");
    return;
  }

  button.classList.add("found");
  found += 1;
  addTapEffect(button, "good", event);
  playTone("good");
  updateProgress();

  if (found === expected.length) {
    finishPop.hidden = false;
    setTimeout(() => {
      roundIndex += 1;
      buildRound();
    }, 1800);
  }
}

function updateProgress() {
  progressText.textContent = `${found} / ${expected.length}`;
  stars.textContent = "★".repeat(found);
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    mode = button.dataset.mode;
    roundIndex = 0;
    modeButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });
    buildRound();
  });
});

newRoundButton.addEventListener("click", () => {
  roundIndex += 1;
  buildRound();
});

scene.addEventListener("pointerdown", (event) => {
  if (event.target.closest(".token") || event.target.closest(".finish-pop")) return;
  const sceneRect = scene.getBoundingClientRect();
  addRippleAt(event.clientX - sceneRect.left, event.clientY - sceneRect.top, "soft");
});

buildRound();
