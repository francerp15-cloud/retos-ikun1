"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimalSymbol,
  ArrowIcon,
  BackspaceIcon,
  BotIcon,
  CheckIcon,
  ChestIcon,
  CloseIcon,
  CoinIcon,
  HeartIcon,
  LeafIcon,
  PauseIcon,
  PlayIcon,
  SendIcon,
  SpeakerIcon,
  StarIcon,
  ZapIcon,
} from "./AnimalSymbol";
import { ANIMALS_DB, createQuizForAnimals, normalizeAnswer } from "./data";
import styles from "./SierraNevadaGame.module.css";
import type { Animal, QuizQuestion, WordSearchQuestion, OrderQuestion, MatchQuestion, ImagePickQuestion, TrueFalseQuestion, SavedSession } from "./types";

const SESSION_KEY = "guardianes-sierra-nevada-session";
const WORLD_WIDTH = 3500;
const TILE = 48;
const GRAVITY = 0.55;
const JUMP_FORCE = -11;
const JUMP_HOLD_DELAY_FRAMES = 5;
const JUMP_HOLD_FRAMES = 18;
const JUMP_HOLD_LIFT = 0.42;
const SPEED = 4;

const PLAYER_SPRITE_SRC = [
  "/assets/images/personaje/001.png",
  "/assets/images/personaje/002.png",
  "/assets/images/personaje/003.png",
];

const PLAYER_SPRITE_SRC_F = [
  "/assets/images/personaje/f001.png",
  "/assets/images/personaje/f002.png",
  "/assets/images/personaje/f003.png",
];

const SOUND_SRC = {
  music: "/assets/sounds/musicalizacion.mp3",
  lesson: "/assets/sounds/musica-leccion.mp3",
  trivia: "/assets/sounds/suspenso-trivia.mp3",
  reward: "/assets/sounds/sonido-recompensa.mp3",
  wrong: "/assets/sounds/sonido-incorrecto.mp3",
} as const;

type AudioKey = keyof typeof SOUND_SRC;
type MusicTrack = "music" | "lesson" | "trivia";

type Screen = "login" | "start" | "lesson" | "playing" | "quiz";

type Platform = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
};

type AnimalSprite = {
  x: number;
  y: number;
  animal: Animal;
  collected: boolean;
  bob: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
};

type Chest = {
  x: number;
  y: number;
  bob: number;
  glow: number;
} | null;

type Spike = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type PowerUpKind = "speed" | "magnet" | "star";

type PowerUp = {
  x: number;
  y: number;
  kind: PowerUpKind;
  collected: boolean;
  bob: number;
};

type Player = {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  frame: number;
  frameTimer: number;
};

type Runtime = {
  width: number;
  height: number;
  worldX: number;
  platforms: Platform[];
  animalSprites: AnimalSprite[];
  chest: Chest;
  particles: Particle[];
  chestSpawned: boolean;
  player: Player;
  spikes: Spike[];
  powerUps: PowerUp[];
};

const createPlayer = (): Player => ({
  x: 100,
  y: 200,
  w: 36,
  h: 48,
  vx: 0,
  vy: 0,
  onGround: false,
  facing: 1,
  frame: 0,
  frameTimer: 0,
});

const createRuntime = (): Runtime => ({
  width: 0,
  height: 0,
  worldX: 0,
  platforms: [],
  animalSprites: [],
  chest: null,
  particles: [],
  chestSpawned: false,
  player: createPlayer(),
  spikes: [],
  powerUps: [],
});

const safeSession = (value: unknown): SavedSession | null => {
  if (!value || typeof value !== "object") return null;

  const data = value as Partial<SavedSession>;
  if (
    typeof data.level !== "number" ||
    typeof data.score !== "number" ||
    typeof data.bestScore !== "number" ||
    !Array.isArray(data.learnedAnimalIds)
  ) {
    return null;
  }

  return {
    level: Math.max(1, data.level),
    score: Math.max(0, data.score),
    bestScore: Math.max(0, data.bestScore),
    learnedAnimalIds: data.learnedAnimalIds.filter((id): id is string => typeof id === "string"),
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : new Date().toISOString(),
  };
};

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const uniqueAnimals = (animals: Animal[]) =>
  Array.from(new Map(animals.map((animal) => [animal.id, animal])).values());

function drawAnimalGlyph(
  ctx: CanvasRenderingContext2D,
  animal: Animal,
  x: number,
  y: number,
  size = 30,
) {
  const colors = {
    reptil: ["#73c66f", "#153f29", "#d9cb67"],
    ave: ["#4d9ad6", "#17324a", "#f2b84b"],
    anfibio: ["#6bd083", "#164b2d", "#d9f0a3"],
    pez: ["#48b7c9", "#124c5b", "#f0c35b"],
    insecto: ["#9b78d5", "#30204c", "#f2a7c4"],
    mamifero: ["#c08a52", "#4f2f17", "#f0d0a0"],
  }[animal.type];

  const [base, dark, accent] = colors;
  const s = size / 30;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "rgba(240,184,75,0.22)";
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.fill();

  if (animal.type === "ave") {
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(-3, 2, 14, 9, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(8, -1);
    ctx.lineTo(20, -5);
    ctx.lineTo(10, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f8f4d2";
    ctx.beginPath();
    ctx.ellipse(-8, 4, 10, 6, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.arc(4, -4, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (animal.type === "pez") {
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(-8, -9);
    ctx.lineTo(-8, 9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(5, 0, 17, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.arc(12, -3, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (animal.type === "anfibio") {
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.ellipse(0, 4, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(-8, -8, 7, 0, Math.PI * 2);
    ctx.arc(8, -8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.arc(-8, -8, 2, 0, Math.PI * 2);
    ctx.arc(8, -8, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (animal.type === "insecto") {
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.ellipse(-8, -1, 10, 14, -0.3, 0, Math.PI * 2);
    ctx.ellipse(8, -1, 10, 14, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.ellipse(0, 4, 4, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (animal.type === "mamifero") {
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(-10, -8, 7, 0, Math.PI * 2);
    ctx.arc(10, -8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(0, 2, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.arc(-5, 0, 2, 0, Math.PI * 2);
    ctx.arc(5, 0, 2, 0, Math.PI * 2);
    ctx.moveTo(0, 4);
    ctx.lineTo(-4, 10);
    ctx.lineTo(4, 10);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.strokeStyle = dark;
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-17, 9);
    ctx.bezierCurveTo(-8, -13, 8, -13, 18, 0);
    ctx.stroke();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-12, 6);
    ctx.bezierCurveTo(-5, -6, 7, -7, 14, 0);
    ctx.stroke();
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.arc(12, -3, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function renderAiText(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

function drawPowerUpGlyph(
  ctx: CanvasRenderingContext2D,
  kind: PowerUpKind,
  x: number,
  y: number,
  magnetImg?: HTMLImageElement | null,
) {
  if (kind === "magnet" && magnetImg && magnetImg.complete && magnetImg.naturalWidth > 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.drawImage(magnetImg, -14, -15, 28, 30);
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#1a1008";
  ctx.strokeStyle = "#1a1008";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (kind === "speed") {
    ctx.beginPath();
    ctx.moveTo(2, -12);
    ctx.lineTo(-8, 1);
    ctx.lineTo(-1, 1);
    ctx.lineTo(-3, 12);
    ctx.lineTo(9, -3);
    ctx.lineTo(2, -3);
    ctx.closePath();
    ctx.fill();
  } else if (kind === "magnet") {
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-8, -9);
    ctx.lineTo(-8, 2);
    ctx.bezierCurveTo(-8, 9, 8, 9, 8, 2);
    ctx.lineTo(8, -9);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -9);
    ctx.lineTo(-5, -9);
    ctx.moveTo(5, -9);
    ctx.lineTo(12, -9);
    ctx.stroke();
  } else {
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const radius = i % 2 === 0 ? 12 : 5;
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  sprites: HTMLImageElement[],
  playerName?: string,
) {
  let sprite: HTMLImageElement | undefined;
  if (!player.onGround) {
    sprite = sprites[2];
  } else if (player.vx !== 0) {
    sprite = sprites[player.frame % 2 === 0 ? 0 : 1];
  } else {
    sprite = sprites[0];
  }

  if (sprite && sprite.complete && sprite.naturalWidth > 0) {
    const aspect = sprite.naturalWidth / sprite.naturalHeight;
    const drawH = 76;
    const drawW = drawH * aspect;
    const drawX = player.x + player.w / 2 - drawW / 2;
    const drawY = player.y + player.h - drawH;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const groundY = player.y + player.h;
    const shadowScale = player.onGround ? 1 : Math.max(0.4, 1 - Math.abs(player.vy) * 0.04);
    ctx.fillStyle = `rgba(0,0,0,${0.32 * shadowScale})`;
    ctx.beginPath();
    ctx.ellipse(player.x + player.w / 2, groundY - 2, (player.w / 2) * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    if (player.facing === -1) {
      ctx.translate(drawX + drawW / 2, 0);
      ctx.scale(-1, 1);
      ctx.translate(-(drawX + drawW / 2), 0);
    }
    ctx.drawImage(sprite, drawX, drawY, drawW, drawH);
    ctx.restore();

    // Draw player name below sprite
    if (playerName) {
      const cx = player.x + player.w / 2;
      const ny = groundY + 14;
      ctx.save();
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Background pill
      const tw = ctx.measureText(playerName).width;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath();
      ctx.roundRect(cx - tw / 2 - 6, ny - 8, tw + 12, 16, 8);
      ctx.fill();
      // Text
      ctx.fillStyle = "#f0e8c0";
      ctx.fillText(playerName, cx, ny);
      ctx.restore();
    }
    return;
  }

  const px = player.x;
  const py = player.y;
  const cx = px + player.w / 2;
  const legOffset = player.onGround ? Math.sin(player.frame * Math.PI * 0.5) * 5 : 0;

  ctx.save();
  if (player.facing === -1) {
    ctx.translate(px + player.w / 2, py);
    ctx.scale(-1, 1);
    ctx.translate(-px - player.w / 2, -py);
  }

  ctx.fillStyle = "#1a1008";
  ctx.beginPath();
  ctx.moveTo(cx - 6, py + 10);
  ctx.bezierCurveTo(cx - 18, py + 16, cx - 20, py + 26, cx - 16, py + 38);
  ctx.bezierCurveTo(cx - 12, py + 41, cx - 9, py + 35, cx - 5, py + 13);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 6, py + 10);
  ctx.bezierCurveTo(cx + 18, py + 16, cx + 20, py + 26, cx + 16, py + 38);
  ctx.bezierCurveTo(cx + 12, py + 41, cx + 9, py + 35, cx + 5, py + 13);
  ctx.fill();

  ctx.fillStyle = "#eae6d4";
  ctx.beginPath();
  ctx.roundRect(cx - 11, py + 38, 10, 14 + legOffset, 3);
  ctx.roundRect(cx + 1, py + 38, 10, 14 - legOffset, 3);
  ctx.fill();

  ctx.fillStyle = "#b89870";
  ctx.beginPath();
  ctx.ellipse(cx - 6, py + 53 + legOffset, 7, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 6, py + 53 - legOffset, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#d4d0be";
  ctx.beginPath();
  ctx.roundRect(px + 3, py + 17, 30, 23, 5);
  ctx.fill();
  ctx.fillStyle = "#f0ece0";
  ctx.beginPath();
  ctx.roundRect(px + 5, py + 15, 26, 24, 5);
  ctx.fill();
  ctx.strokeStyle = "#2a1e0e";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - 4, py + 15);
  ctx.lineTo(cx, py + 22);
  ctx.lineTo(cx + 4, py + 15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(px + 5, py + 29);
  ctx.lineTo(px + 31, py + 29);
  ctx.moveTo(px + 5, py + 35);
  ctx.lineTo(px + 31, py + 35);
  ctx.stroke();

  ctx.strokeStyle = "#c8b890";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 2, py + 16);
  ctx.quadraticCurveTo(cx + 10, py + 22, cx + 13, py + 34);
  ctx.stroke();
  ctx.fillStyle = "#d4b87a";
  ctx.beginPath();
  ctx.roundRect(cx + 6, py + 26, 18, 20, 4);
  ctx.fill();
  ctx.fillStyle = "#3a2510";
  ctx.fillRect(cx + 6, py + 40, 18, 5);

  ctx.strokeStyle = "#6b3e1a";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx + 8, py + 20);
  ctx.lineTo(cx + 18, py + 10);
  ctx.stroke();
  ctx.fillStyle = "#8b5e2a";
  ctx.beginPath();
  ctx.arc(cx + 19, py + 9, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#b87040";
  ctx.beginPath();
  ctx.arc(cx, py + 12, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1008";
  ctx.beginPath();
  ctx.arc(cx, py + 12, 11, Math.PI + 0.3, -0.3);
  ctx.fill();
  ctx.fillStyle = "#f5f2e8";
  ctx.beginPath();
  ctx.roundRect(cx - 11, py - 10, 22, 14, 6);
  ctx.fill();
  ctx.fillStyle = "#ddd8c4";
  ctx.beginPath();
  ctx.ellipse(cx, py + 4, 12, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(120,110,90,0.55)";
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(cx - 10, py - 7 + i * 4);
    ctx.lineTo(cx + 10, py - 7 + i * 4);
    ctx.stroke();
  }

  ctx.fillStyle = "#1a0a00";
  ctx.beginPath();
  ctx.arc(cx - 4, py + 12, 2.5, 0, Math.PI * 2);
  ctx.arc(cx + 4, py + 12, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#7a3a1a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, py + 17, 3.5, 0.15, Math.PI - 0.15);
  ctx.stroke();

  ctx.restore();
}

export function SierraNevadaGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<Runtime>(createRuntime());
  const playerSpritesRef = useRef<HTMLImageElement[]>([]);
  const playerSpritesFRef = useRef<HTMLImageElement[]>([]);
  const playerAvatarRef = useRef<"male" | "female">("male");
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const magnetImageRef = useRef<HTMLImageElement | null>(null);
  const animalImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const audioRef = useRef<Partial<Record<AudioKey, HTMLAudioElement>>>({});
  const currentTrackRef = useRef<MusicTrack | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const animationRef = useRef<number | null>(null);
  const gameLoopRef = useRef<() => void>(() => undefined);
  const runningRef = useRef(false);
  const levelRef = useRef(1);
  const scoreRef = useRef(0);
  const collectedRef = useRef<Animal[]>([]);
  const learnedRef = useRef<string[]>([]);
  const activeEffectRef = useRef<{ kind: PowerUpKind; until: number } | null>(null);
  const jumpHoldDelayFramesRef = useRef(0);
  const jumpHoldFramesRef = useRef(0);
  const usedAnimalIdsRef = useRef<Set<string>>(new Set());
  const heartsRef = useRef(3); // lives tracking for spike hits // track animals used across levels

  const [screen, setScreen] = useState<Screen>("login");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [collected, setCollected] = useState<Animal[]>([]);
  const [activeEffect, setActiveEffect] = useState<{ kind: PowerUpKind; until: number } | null>(null);
  const [hearts, setHearts] = useState(3);

  // ── Login state ──────────────────────────────────────────────────────────
  const [loginName, setLoginName] = useState("");
  const [loginAvatar, setLoginAvatar] = useState<"male" | "female" | null>(null);
  const [playerProfile, setPlayerProfile] = useState<{ name: string; avatar: "male" | "female" } | null>(null);
  const [loginStep, setLoginStep] = useState<1 | 2>(1); // 1=splash, 2=character select

  // ── AI Assistant state ────────────────────────────────────────────────────
  type AiMsg = { role: "user" | "assistant"; text: string };
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMsgs, setAiMsgs] = useState<AiMsg[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiEndRef = useRef<HTMLDivElement>(null);
  const aiCurrentAnimal = useRef<Animal | null>(null);
  const [lessonAnimals, setLessonAnimals] = useState<Animal[]>([]);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [lessonAnim, setLessonAnim] = useState<"in" | "left" | "right">("in");
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "fail"; text: string } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [writeAnswer, setWriteAnswer] = useState("");
  // Word search state
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [foundWord, setFoundWord] = useState(false);
  // Order state
  const [orderPlaced, setOrderPlaced] = useState<string[]>([]);
  const [orderUsed, setOrderUsed] = useState<boolean[]>([]);
  // Match state
  const [matchLeft, setMatchLeft] = useState<string | null>(null);
  const [matchDone, setMatchDone] = useState<{ iku: string; es: string }[]>([]);
  // ── Quiz attempts (max 2 per question) ────────────────────────────────────
  const [quizAttempts, setQuizAttempts] = useState(0);
  const MAX_ATTEMPTS = 2;

  const previewAnimals = useMemo(() => ANIMALS_DB.slice(0, 8), []);
  const currentQuiz = quizzes[quizIndex];
  const quizDone = quizzes.length > 0 && quizIndex >= quizzes.length;
  const hasSavedSession = score > 0 || level > 1 || learnedIds.length > 0;

  const setScoreValue = useCallback((value: number) => {
    scoreRef.current = value;
    setScore(value);
    setBestScore((current: number) => Math.max(current, value));
  }, []);

  const setLevelValue = useCallback((value: number) => {
    levelRef.current = value;
    setLevel(value);
  }, []);

  const setLearnedValue = useCallback((ids: string[]) => {
    const unique = Array.from(new Set(ids));
    learnedRef.current = unique;
    setLearnedIds(unique);
  }, []);

  const switchMusic = useCallback((track: MusicTrack | null) => {
    if (currentTrackRef.current === track) return;
    const audios = audioRef.current;
    (["music", "lesson", "trivia"] as const).forEach((key) => {
      const audio = audios[key];
      if (audio && key !== track) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    currentTrackRef.current = track;
    if (track) {
      const next = audios[track];
      if (next) {
        next.currentTime = 0;
        const promise = next.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(() => undefined);
        }
      }
    }
  }, []);

  const playSfx = useCallback((kind: "reward" | "wrong") => {
    const audio = audioRef.current[kind];
    if (!audio) return;
    try {
      audio.currentTime = 0;
    } catch {
      // ignore
    }
    const promise = audio.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => undefined);
    }
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    runtimeRef.current.width = width;
    runtimeRef.current.height = height;
  }, []);

  const setupLevel = useCallback((nextLevel: number) => {
    resizeCanvas();
    const runtime = runtimeRef.current;
    const height = runtime.height || window.innerHeight;
    const platforms: Platform[] = [];

    for (let x = 0; x < WORLD_WIDTH; x += TILE) {
      platforms.push({ x, y: height - TILE, w: TILE, h: TILE, color: "#5a3a1a" });
    }

    const extraPlatforms = [
      [200, height - 200, 160],
      [400, height - 280, 120],
      [700, height - 180, 200],
      [1000, height - 260, 160],
      [1300, height - 200, 140],
      [1600, height - 300, 160],
      [1900, height - 220, 200],
      [2200, height - 280, 120],
      [2500, height - 200, 180],
      [2800, height - 260, 160],
      [3100, height - 200, 200],
    ];

    extraPlatforms.forEach(([x, y, w], index) => {
      platforms.push({
        x,
        y,
        w,
        h: TILE,
        color: ["#3a7c44", "#2d7a4f", "#4a9e5c"][index % 3],
      });
    });

    // Pick animals not yet used. When all are exhausted, reset the pool.
    const animalsWithImages = ANIMALS_DB.filter((a) => Boolean(a.image));
    let available = animalsWithImages.filter((a) => !usedAnimalIdsRef.current.has(a.id));
    if (available.length < 5) {
      // All animals used — reset and start fresh cycle
      usedAnimalIdsRef.current = new Set();
      available = [...animalsWithImages];
    }
    const pool = shuffle(available);
    const ANIMALS_PER_LEVEL = 5;
    const levelAnimals = pool.slice(0, ANIMALS_PER_LEVEL);
    // Mark these as used for future levels
    levelAnimals.forEach((a) => usedAnimalIdsRef.current.add(a.id));

    // Fill remaining positions by cycling level animals (so all 11 sprites are set)
    const positions = [250, 500, 750, 1050, 1350, 1650, 1950, 2250, 2550, 2850, 3100];
    const animalSprites = positions.map((x, index) => {
      const platform = platforms.find((item) => item.x <= x && item.x + item.w >= x && item.y < height - TILE);
      return {
        x,
        y: platform ? platform.y - 42 : height - TILE * 2 - 20,
        animal: levelAnimals[index % levelAnimals.length],
        collected: false,
        bob: Math.random() * Math.PI * 2,
      };
    });

    runtimeRef.current = {
      ...runtime,
      worldX: 0,
      platforms,
      animalSprites,
      chest: null,
      particles: [],
      chestSpawned: false,
      player: { ...createPlayer(), y: Math.min(200, height - 180) },
      spikes: [350, 620, 870, 1200, 1480, 1750, 2100, 2400, 2750, 3020].map((x) => ({
        x,
        y: height - TILE - 18,
        w: 36,
        h: 18,
      })),
      powerUps: (["speed", "magnet", "star"] as PowerUpKind[]).map((kind, i) => ({
        x: [480, 1180, 2080][i],
        y: height - TILE * 2 - 55,
        kind,
        collected: false,
        bob: Math.random() * Math.PI * 2,
      })),
    };

    const allLevelAnimals = uniqueAnimals(animalSprites.map((sprite) => sprite.animal));
    setLessonAnimals(allLevelAnimals.filter((a) => Boolean(a.image)));
    setLessonIndex(0);
    setLessonAnim("in");
    collectedRef.current = [];
    setCollected([]);
    heartsRef.current = 3;
    setHearts(3);
    setLevelValue(nextLevel);
  }, [resizeCanvas, setLevelValue]);

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, runtime: Runtime) => {
    const W = runtime.width;
    const H = runtime.height;
    // Draw background image stretched to fill canvas
    const bg = bgImageRef.current;
    if (bg && bg.complete && bg.naturalWidth > 0) {
      ctx.drawImage(bg, 0, 0, W, H);
    } else {
      // Fallback sky while image loads
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#4a9fd4");
      grad.addColorStop(1, "#3a8a28");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }
    // Dark overlay at very bottom for ground blend
    const ground = ctx.createLinearGradient(0, H - 56, 0, H);
    ground.addColorStop(0, "rgba(0,0,0,0)");
    ground.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = ground;
    ctx.fillRect(0, H - 56, W, 56);
  }, []);

  const drawChest = (ctx: CanvasRenderingContext2D, chest: Exclude<Chest, null>, worldX: number) => {
    const x = chest.x - worldX;
    const y = chest.y + Math.sin(chest.bob) * 7;

    const glow = ctx.createRadialGradient(x, y, 6, x, y, 64);
    glow.addColorStop(0, `rgba(240,184,75,${0.42 + chest.glow * 0.26})`);
    glow.addColorStop(1, "rgba(240,184,75,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 64, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#b46b2e";
    ctx.beginPath();
    ctx.roundRect(x - 24, y - 18, 48, 35, 6);
    ctx.fill();
    ctx.fillStyle = "#8a4f23";
    ctx.fillRect(x - 24, y - 2, 48, 22);
    ctx.fillStyle = "#d79b43";
    ctx.fillRect(x - 24, y - 3, 48, 9);
    ctx.fillStyle = "#f3c55b";
    ctx.fillRect(x - 4, y - 18, 8, 38);
    ctx.fillStyle = "#2a1b11";
    ctx.fillRect(x - 7, y + 5, 14, 10);
    ctx.fillStyle = "#f0b84b";
    ctx.font = "800 12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Abrir", x, y - 32);
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const runtime = runtimeRef.current;
    ctx.clearRect(0, 0, runtime.width, runtime.height);
    drawBackground(ctx, runtime);

    // Draw ground row (stone/moss floor)
    const groundY = runtime.height - TILE;
    {
      const H2 = runtime.height;
      const W = runtime.width;
      // Main stone slab with 3D depth
      const stoneGrad = ctx.createLinearGradient(0, groundY, 0, H2);
      stoneGrad.addColorStop(0, "#8b6914");
      stoneGrad.addColorStop(0.12, "#7a5c10");
      stoneGrad.addColorStop(0.5,  "#5a3e08");
      stoneGrad.addColorStop(1,    "#3a2404");
      ctx.fillStyle = stoneGrad;
      ctx.fillRect(0, groundY, W, TILE);

      // Stone tile seams (horizontal + vertical)
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 2;
      for (let tx = 0; tx < W; tx += TILE) {
        ctx.beginPath(); ctx.moveTo(tx, groundY); ctx.lineTo(tx, H2); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(0, groundY + TILE * 0.5); ctx.lineTo(W, groundY + TILE * 0.5); ctx.stroke();

      // Light edge on top of stone
      ctx.fillStyle = "rgba(255,200,80,0.18)";
      ctx.fillRect(0, groundY, W, 3);

      // Grass top — thick lush strip
      const grassTop = ctx.createLinearGradient(0, groundY - 22, 0, groundY);
      grassTop.addColorStop(0, "#3ee818");
      grassTop.addColorStop(0.6, "#30c010");
      grassTop.addColorStop(1, "#28a00c");
      ctx.fillStyle = grassTop;
      ctx.fillRect(0, groundY - 20, W, 22);

      // Grass highlight
      ctx.fillStyle = "rgba(120,255,80,0.35)";
      ctx.fillRect(0, groundY - 20, W, 5);

      // Dense grass blades
      for (let gx = 2; gx < W; gx += 7) {
        const h3 = 10 + Math.sin(gx * 0.4) * 6;
        ctx.fillStyle = gx % 14 === 0 ? "#5af030" : "#40d820";
        ctx.beginPath();
        ctx.moveTo(gx, groundY - 18);
        ctx.quadraticCurveTo(gx + 2, groundY - 18 - h3, gx + 4, groundY - 18);
        ctx.fill();
      }

      // Moss patches
      for (let mx = 20; mx < W; mx += 64) {
        ctx.fillStyle = "rgba(60,180,20,0.4)";
        ctx.beginPath();
        ctx.ellipse(mx, groundY + 12, 18, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    runtime.platforms.forEach((platform: Platform) => {
      const x = platform.x - runtime.worldX;
      if (x > runtime.width + 20 || x + platform.w < -20) return;
      if (platform.y >= runtime.height - TILE - 2) return;
      const pw = platform.w;
      const ph = platform.h;
      const py = platform.y;

      // ── Drop shadow (soft oval) ─────────────────────────────────────────────
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0)";
      const shadowGrad = ctx.createRadialGradient(
        x + pw / 2, py + ph + 14, 0,
        x + pw / 2, py + ph + 14, pw * 0.6
      );
      shadowGrad.addColorStop(0, "rgba(0,0,0,0.45)");
      shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(x + pw / 2, py + ph + 14, pw * 0.55, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── Dirt body with full 3D shading ──────────────────────────────────────
      // Back face (darkest)
      ctx.fillStyle = "#3a2206";
      ctx.beginPath();
      ctx.roundRect(x, py + 16, pw, ph, [0, 0, 10, 10]);
      ctx.fill();

      // Main face gradient (top-lit)
      const dirtGrad = ctx.createLinearGradient(x, py + 14, x, py + ph);
      dirtGrad.addColorStop(0, "#a06830");
      dirtGrad.addColorStop(0.3, "#8a5520");
      dirtGrad.addColorStop(0.7, "#6a3e10");
      dirtGrad.addColorStop(1, "#4a2a06");
      ctx.fillStyle = dirtGrad;
      ctx.beginPath();
      ctx.roundRect(x, py + 14, pw, ph - 6, [0, 0, 8, 8]);
      ctx.fill();

      // Left face (lighter — 3D side)
      ctx.fillStyle = "rgba(180,120,60,0.35)";
      ctx.fillRect(x, py + 16, 12, ph - 8);

      // Right face (darker — 3D shadow side)
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(x + pw - 10, py + 16, 10, ph - 8);

      // Rock/dirt texture lines
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 1.5;
      for (let tx = x + 12; tx < x + pw - 10; tx += 18) {
        ctx.beginPath();
        ctx.moveTo(tx, py + 20);
        ctx.lineTo(tx + 10, py + 26);
        ctx.stroke();
      }

      // Moss on sides
      const mossPoints = [0.15, 0.45, 0.78];
      mossPoints.forEach(mxp => {
        const mx2 = x + pw * mxp;
        ctx.fillStyle = "rgba(50,180,20,0.5)";
        ctx.beginPath();
        ctx.ellipse(mx2, py + ph - 8, 9, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Hanging roots
      ctx.strokeStyle = "#5a3010";
      ctx.lineWidth = 2;
      for (let ri = 0; ri < 4; ri++) {
        const rx = x + pw * 0.15 + ri * (pw * 0.23);
        const rLen = 10 + ri * 5;
        ctx.beginPath();
        ctx.moveTo(rx, py + ph - 3);
        ctx.quadraticCurveTo(rx + 4, py + ph + rLen * 0.5, rx + 1, py + ph + rLen);
        ctx.stroke();
      }

      // ── Grass top (thick, lush, 3D) ──────────────────────────────────────────
      // Grass base layer
      const grassGrad = ctx.createLinearGradient(x, py - 4, x, py + 18);
      grassGrad.addColorStop(0, "#50dd20");
      grassGrad.addColorStop(0.5, "#3cc010");
      grassGrad.addColorStop(1, "#2a9a08");
      ctx.fillStyle = grassGrad;
      ctx.beginPath();
      ctx.roundRect(x - 3, py, pw + 6, 18, [8, 8, 0, 0]);
      ctx.fill();

      // Grass top specular highlight (3D rim light)
      const rimGrad = ctx.createLinearGradient(x, py, x, py + 6);
      rimGrad.addColorStop(0, "rgba(180,255,100,0.55)");
      rimGrad.addColorStop(1, "rgba(180,255,100,0)");
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.roundRect(x - 3, py, pw + 6, 8, [8, 8, 0, 0]);
      ctx.fill();

      // Grass blades (dense)
      for (let gx2 = x + 4; gx2 < x + pw - 4; gx2 += 7) {
        const bh = 8 + Math.sin(gx2 * 0.5) * 5;
        ctx.fillStyle = gx2 % 14 < 7 ? "#68ee38" : "#48d020";
        ctx.beginPath();
        ctx.moveTo(gx2, py + 2);
        ctx.quadraticCurveTo(gx2 + 2, py - bh, gx2 + 4, py + 2);
        ctx.fill();
      }

      // Flowers / colorful details
      const fColors = ["#ff5555", "#ffcc22", "#ff8844", "#ee55cc"];
      const fCount = Math.max(2, Math.floor(pw / 60));
      for (let fi = 0; fi < fCount; fi++) {
        const fx2 = x + pw * (0.15 + fi * (0.7 / Math.max(fCount - 1, 1)));
        const fc = fColors[fi % fColors.length];
        // Petals
        for (let p = 0; p < 4; p++) {
          const ang = (p / 4) * Math.PI * 2;
          ctx.fillStyle = fc;
          ctx.beginPath();
          ctx.ellipse(fx2 + Math.cos(ang) * 4, py - 3 + Math.sin(ang) * 4, 3.5, 2.5, ang, 0, Math.PI * 2);
          ctx.fill();
        }
        // Center
        ctx.fillStyle = "#ffff60";
        ctx.beginPath();
        ctx.arc(fx2, py - 3, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw spikes
    runtime.spikes.forEach((spike: Spike) => {
      const sx = spike.x - runtime.worldX;
      if (sx > runtime.width + 20 || sx + spike.w < -20) return;
      const count = 3;
      const sw = spike.w / count;
      // Glow danger aura
      ctx.fillStyle = "rgba(220,50,40,0.22)";
      ctx.beginPath();
      ctx.rect(sx - 4, spike.y - 8, spike.w + 8, spike.h + 8);
      ctx.fill();
      // Red metal spikes
      for (let i = 0; i < count; i++) {
        const bx = sx + i * sw;
        ctx.fillStyle = i % 2 === 0 ? "#c62828" : "#e53935";
        ctx.beginPath();
        ctx.moveTo(bx, spike.y + spike.h);
        ctx.lineTo(bx + sw / 2, spike.y);
        ctx.lineTo(bx + sw, spike.y + spike.h);
        ctx.closePath();
        ctx.fill();
        // Shine
        ctx.fillStyle = "rgba(255,200,200,0.5)";
        ctx.beginPath();
        ctx.moveTo(bx + sw * 0.3, spike.y + spike.h * 0.7);
        ctx.lineTo(bx + sw * 0.5, spike.y + spike.h * 0.05);
        ctx.lineTo(bx + sw * 0.55, spike.y + spike.h * 0.7);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = "#b71c1c";
      ctx.fillRect(sx, spike.y + spike.h - 4, spike.w, 4);
    });

    // Draw power-ups
    const puColors: Record<PowerUpKind, string> = { speed: "#ffeb3b", magnet: "#42a5f5", star: "#ff9800" };
    const puLabel: Record<PowerUpKind, string> = { speed: "Veloz", magnet: "Imán", star: "Bonus" };
    runtime.powerUps.forEach((pu: PowerUp) => {
      if (pu.collected) return;
      const px = pu.x - runtime.worldX;
      if (px < -60 || px > runtime.width + 60) return;
      pu.bob += 0.07;
      const py = pu.y + Math.sin(pu.bob) * 7;
      const col = puColors[pu.kind];
      // Glow
      const glow = ctx.createRadialGradient(px, py, 2, px, py, 28);
      glow.addColorStop(0, col + "88");
      glow.addColorStop(1, col + "00");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, 28, 0, Math.PI * 2);
      ctx.fill();
      // Circle
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(px, py, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 18, 0, Math.PI * 2);
      ctx.stroke();
      drawPowerUpGlyph(ctx, pu.kind, px, py, magnetImageRef.current);
      // Label
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "700 9px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(puLabel[pu.kind], px, py - 26);
    });

    runtime.animalSprites.forEach((sprite: AnimalSprite) => {
      if (sprite.collected) return;
      const x = sprite.x - runtime.worldX;
      if (x < -50 || x > runtime.width + 50) return;
      sprite.bob += 0.05;
      const y = sprite.y + Math.sin(sprite.bob) * 5;

      // Try to draw Ghibli image icon, fallback to glyph
      const animalImg = animalImagesRef.current.get(sprite.animal.id);
      if (animalImg && animalImg.complete && animalImg.naturalWidth > 0) {
        const iconSize = 44;
        const half = iconSize / 2;
        ctx.save();
        // Glow aura
        const glow = ctx.createRadialGradient(x, y, 4, x, y, half + 10);
        glow.addColorStop(0, "rgba(240,184,75,0.35)");
        glow.addColorStop(1, "rgba(240,184,75,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, half + 10, 0, Math.PI * 2);
        ctx.fill();
        // Clip circle
        ctx.beginPath();
        ctx.arc(x, y, half, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(animalImg, x - half, y - half, iconSize, iconSize);
        // Border
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = "rgba(240,184,75,0.7)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, half, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else {
        drawAnimalGlyph(ctx, sprite.animal, x, y, 31);
      }

      ctx.fillStyle = "rgba(255,255,255,0.86)";
      ctx.font = "800 10px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(sprite.animal.nameEs, x, y - 28);
    });

    if (runtime.chestSpawned && runtime.chest) {
      runtime.chest.bob += 0.07;
      runtime.chest.glow = (Math.sin(runtime.chest.bob) + 1) / 2;
      drawChest(ctx, runtime.chest, runtime.worldX);
    }

    runtime.particles.forEach((particle) => {
      const radius = Math.max(0.1, particle.size * particle.life);
      ctx.globalAlpha = Math.max(0, particle.life);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    drawPlayer(ctx, runtime.player, playerAvatarRef.current === "female" ? playerSpritesFRef.current : playerSpritesRef.current);
  }, [drawBackground]);

  const openChest = useCallback(() => {
    runningRef.current = false;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setQuizzes(createQuizForAnimals(collectedRef.current));
    setQuizIndex(0);
    setQuizScore(0);
    setFeedback(null);
    setSelectedAnswer(null);
    setWriteAnswer("");
    setSelectedCells([]);
    setFoundWord(false);
    setOrderPlaced([]);
    setOrderUsed([]);
    setMatchLeft(null);
    setMatchDone([]);
    setQuizAttempts(0);
    setScreen("quiz");
  }, []);

  const collectAnimal = useCallback((sprite: AnimalSprite) => {
    const runtime = runtimeRef.current;
    sprite.collected = true;
    const nextCollected = [...collectedRef.current, sprite.animal].slice(0, 5);
    collectedRef.current = nextCollected;
    setCollected(nextCollected);
    setScoreValue(scoreRef.current + 10);
    playSfx("reward");

    for (let i = 0; i < 14; i += 1) {
      runtime.particles.push({
        x: sprite.x - runtime.worldX,
        y: sprite.y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5 - 2,
        life: 1,
        color: ["#f0b84b", "#7fd18b", "#fffaf0"][Math.floor(Math.random() * 3)],
        size: 4 + Math.random() * 4,
      });
    }

    if (nextCollected.length >= 5 && !runtime.chestSpawned) {
      runtime.chestSpawned = true;
      runtime.chest = {
        x: runtime.player.x + runtime.worldX + 250,
        y: runtime.height - TILE - 50,
        bob: 0,
        glow: 0,
      };
    }
  }, [playSfx, setScoreValue]);

  const updatePlayer = useCallback(() => {
    const runtime = runtimeRef.current;
    const { player } = runtime;
    const keys = keysRef.current;

    if (keys.ArrowLeft || keys.KeyA || keys.mobileLeft) {
      const currentSpeed = activeEffectRef.current?.kind === "speed" && activeEffectRef.current.until > Date.now() ? SPEED * 1.9 : SPEED;
      player.vx = -currentSpeed;
      player.facing = -1;
    } else if (keys.ArrowRight || keys.KeyD || keys.mobileRight) {
      const currentSpeed = activeEffectRef.current?.kind === "speed" && activeEffectRef.current.until > Date.now() ? SPEED * 1.9 : SPEED;
      player.vx = currentSpeed;
      player.facing = 1;
    } else {
      player.vx = 0;
    }

    const holdingJump = keys.Space || keys.ArrowUp || keys.KeyW || keys.mobileJump;
    player.vy += GRAVITY;
    if (holdingJump && jumpHoldFramesRef.current > 0 && player.vy < 0) {
      if (jumpHoldDelayFramesRef.current > 0) {
        jumpHoldDelayFramesRef.current -= 1;
      } else {
        player.vy -= JUMP_HOLD_LIFT;
        jumpHoldFramesRef.current -= 1;
      }
    } else if (!holdingJump) {
      jumpHoldDelayFramesRef.current = 0;
      jumpHoldFramesRef.current = 0;
    }
    player.x += player.vx;
    player.y += player.vy;
    player.onGround = false;

    runtime.platforms.forEach((platform) => {
      const platformX = platform.x - runtime.worldX;
      const hit =
        player.x + player.w > platformX &&
        player.x < platformX + platform.w &&
        player.y + player.h > platform.y &&
        player.y < platform.y + platform.h;

      if (!hit) return;

      if (player.vy >= 0 && player.y + player.h - player.vy <= platform.y + 5) {
        player.y = platform.y - player.h;
        player.vy = 0;
        player.onGround = true;
      } else if (player.vy < 0) {
        player.y = platform.y + platform.h;
        player.vy = 0;
      }
    });

    if (player.x < 50) player.x = 50;

    const margin = runtime.width * 0.4;
    if (player.x > margin) {
      const shift = player.x - margin;
      runtime.worldX = Math.min(runtime.worldX + shift, WORLD_WIDTH - runtime.width);
      player.x = margin;
    }
    if (player.x < 120 && runtime.worldX > 0) {
      const shift = 120 - player.x;
      runtime.worldX = Math.max(runtime.worldX - shift, 0);
      player.x = 120;
    }

    if (player.y > runtime.height + 100) {
      player.y = 100;
      player.vy = 0;
    }

    player.frameTimer += 1;
    if (player.frameTimer > 8) {
      player.frame = (player.frame + 1) % 4;
      player.frameTimer = 0;
    }
  }, []);

  const updatePickups = useCallback(() => {
    const runtime = runtimeRef.current;
    const { player } = runtime;

    if (runtime.chestSpawned && runtime.chest) {
      const chestX = runtime.chest.x - runtime.worldX;
      if (Math.abs(chestX - player.x) < 62 && Math.abs(runtime.chest.y - player.y) < 68) {
        openChest();
        return;
      }
    }

    // Spike collision → lose heart + reset to start
    for (const spike of runtime.spikes) {
      const sx = spike.x - runtime.worldX;
      if (
        player.x + player.w > sx + 4 &&
        player.x < sx + spike.w - 4 &&
        player.y + player.h > spike.y + 2 &&
        player.y + player.h < spike.y + spike.h + player.h * 0.6
      ) {
        // Danger particles
        for (let i = 0; i < 12; i++) {
          runtime.particles.push({
            x: player.x + player.w / 2,
            y: player.y + player.h / 2,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - 3,
            life: 1,
            color: ["#e53935", "#ff8a80", "#ffcdd2"][Math.floor(Math.random() * 3)],
            size: 5 + Math.random() * 4,
          });
        }

        // Lose a heart
        const newHearts = Math.max(0, heartsRef.current - 1);
        heartsRef.current = newHearts;
        setHearts(newHearts);

        // Reset player to start
        player.x = 100;
        player.y = 100;
        player.vx = 0;
        player.vy = 0;
        runtime.worldX = 0;
        // Lose collected animals
        collectedRef.current = [];
        setCollected([]);
        runtime.chestSpawned = false;
        runtime.chest = null;
        // Reset animal sprites
        runtime.animalSprites.forEach((sprite: AnimalSprite) => { sprite.collected = false; });
        // Clear effect
        activeEffectRef.current = null;
        setActiveEffect(null);
        playSfx("wrong");

        // If no hearts left → go back to lesson
        if (newHearts <= 0) {
          window.setTimeout(() => {
            heartsRef.current = 3;
            setHearts(3);
            goBackToLesson();
          }, 800);
        }
        return;
      }
    }

    // Power-up collection
    for (const pu of runtime.powerUps) {
      if (pu.collected) continue;
      const puX = pu.x - runtime.worldX;
      if (Math.abs(puX - (player.x + player.w / 2)) < 40 && Math.abs(pu.y - (player.y + player.h / 2)) < 44) {
        pu.collected = true;
        const until = Date.now() + 5000;
        const effect = { kind: pu.kind as PowerUpKind, until };
        activeEffectRef.current = effect;
        setActiveEffect(effect);
        playSfx("reward");

        const puColors: Record<PowerUpKind, string> = { speed: "#ffeb3b", magnet: "#42a5f5", star: "#ff9800" };

        if (pu.kind === "star") {
          setScoreValue(scoreRef.current + 30);
        }

        if (pu.kind === "magnet") {
          // Auto-collect all nearby animals
          runtime.animalSprites.forEach((sprite: AnimalSprite) => {
            if (!sprite.collected) {
              const spriteScreenX = sprite.x - runtime.worldX;
              if (spriteScreenX > -200 && spriteScreenX < runtime.width + 200) {
                collectAnimal(sprite);
              }
            }
          });
        }

        // Collect particles
        for (let i = 0; i < 18; i++) {
          runtime.particles.push({
            x: puX,
            y: pu.y,
            vx: (Math.random() - 0.5) * 7,
            vy: (Math.random() - 0.5) * 7 - 2,
            life: 1,
            color: puColors[pu.kind as PowerUpKind],
            size: 5 + Math.random() * 5,
          });
        }
      }
    }

    runtime.animalSprites.forEach((sprite: AnimalSprite) => {
      if (sprite.collected) return;
      const spriteX = sprite.x - runtime.worldX;
      if (Math.abs(spriteX - player.x) < 45 && Math.abs(sprite.y - player.y) < 48) {
        collectAnimal(sprite);
      }
    });
  }, [collectAnimal, openChest, playSfx, setScoreValue]);

  const updateParticles = useCallback(() => {
    const runtime = runtimeRef.current;
    runtime.particles = runtime.particles.filter((particle) => particle.life > 0);
    runtime.particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1;
      particle.life -= 0.03;
    });
  }, []);

  const gameLoop = useCallback(() => {
    if (!runningRef.current) return;
    // Expire active effect
    if (activeEffectRef.current && activeEffectRef.current.until < Date.now()) {
      activeEffectRef.current = null;
      setActiveEffect(null);
    }
    updatePlayer();
    updatePickups();
    updateParticles();
    draw();
    animationRef.current = requestAnimationFrame(gameLoopRef.current);
  }, [draw, updateParticles, updatePickups, updatePlayer]);

  const startGame = useCallback((reset: boolean) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    runningRef.current = false;

    if (reset) {
      setScoreValue(0);
      setLevelValue(1);
      setLearnedValue([]);
    }

    setupLevel(reset ? 1 : levelRef.current);
    setScreen("lesson");
  }, [setLearnedValue, setLevelValue, setScoreValue, setupLevel]);

  const beginLevel = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    runningRef.current = true;
    setScreen("playing");
    animationRef.current = requestAnimationFrame(gameLoopRef.current);
  }, []);

  const goLesson = useCallback((direction: 1 | -1) => {
    setLessonAnim(direction === 1 ? "right" : "left");
    window.setTimeout(() => {
      setLessonIndex((value) => {
        const next = value + direction;
        if (next < 0) return 0;
        if (next >= lessonAnimals.length) return lessonAnimals.length - 1;
        return next;
      });
      setLessonAnim("in");
    }, 180);
  }, [lessonAnimals.length]);

  const jump = useCallback(() => {
    const player = runtimeRef.current.player;
    if (player.onGround) {
      player.vy = JUMP_FORCE;
      player.onGround = false;
      jumpHoldDelayFramesRef.current = JUMP_HOLD_DELAY_FRAMES;
      jumpHoldFramesRef.current = JUMP_HOLD_FRAMES;
    }
  }, []);

  const goBackToLesson = useCallback(() => {
    // Reset collected animals so the player must play the level again
    collectedRef.current = [];
    setCollected([]);
    // Reset all animalSprites to uncollected
    runtimeRef.current.animalSprites.forEach((s) => { s.collected = false; });
    runtimeRef.current.chestSpawned = false;
    runtimeRef.current.chest = null;
    // Reset player position
    runtimeRef.current.player.x = 100;
    runtimeRef.current.player.y = 100;
    runtimeRef.current.player.vx = 0;
    runtimeRef.current.player.vy = 0;
    runtimeRef.current.worldX = 0;

    setScreen("lesson");
    setLessonIndex(0);
    setLessonAnim("in");
    setQuizzes([]);
    setQuizIndex(0);
    setFeedback(null);
    setSelectedAnswer(null);
    setWriteAnswer("");
    setSelectedCells([]);
    setFoundWord(false);
    setOrderPlaced([]);
    setOrderUsed([]);
    setMatchLeft(null);
    setMatchDone([]);
    setQuizAttempts(0);
    setQuizScore(0);
  }, []);

  const advanceQuiz = useCallback((correct: boolean, successText: string) => {
    const resetState = () => {
      setFeedback(null);
      setSelectedAnswer(null);
      setWriteAnswer("");
      setSelectedCells([]);
      setFoundWord(false);
      setOrderPlaced([]);
      setOrderUsed([]);
      setMatchLeft(null);
      setMatchDone([]);
      setQuizAttempts(0);
    };

    if (correct) {
      setQuizScore((v: number) => v + 1);
      setScoreValue(scoreRef.current + 20);
      playSfx("reward");
      setFeedback({ kind: "ok", text: successText });
      window.setTimeout(() => {
        setQuizIndex((v: number) => v + 1);
        resetState();
      }, 1800);
    } else {
      playSfx("wrong");
      setQuizAttempts((prev) => {
        const next = prev + 1;
        if (next >= MAX_ATTEMPTS) {
          setFeedback({ kind: "fail", text: `Nʉkwa zakachozʉndi. Ana'nuga jina zukutu! ${successText}` });
          window.setTimeout(() => { goBackToLesson(); }, 2400);
        } else {
          setFeedback({ kind: "fail", text: `Awi! Nʉkwa. ${MAX_ATTEMPTS - next} zakachozʉndi kʉndu.` });
          window.setTimeout(() => {
            setFeedback(null);
            setSelectedAnswer(null);
            setWriteAnswer("");
            setSelectedCells([]);
            setFoundWord(false);
            setOrderPlaced([]);
            setOrderUsed([]);
            setMatchLeft(null);
            setMatchDone([]);
          }, 1600);
        }
        return next;
      });
    }
  }, [playSfx, setScoreValue, goBackToLesson]);

  const continueAfterQuiz = useCallback(() => {
    const nextLevel = levelRef.current + 1;
    setLevelValue(nextLevel);
    setLearnedValue([...learnedRef.current, ...collectedRef.current.map((animal) => animal.id)]);
    setupLevel(nextLevel);
    setQuizzes([]);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAttempts(0);
    setFeedback(null);
    setSelectedAnswer(null);
    setWriteAnswer("");
    setSelectedCells([]);
    setFoundWord(false);
    setOrderPlaced([]);
    setOrderUsed([]);
    setMatchLeft(null);
    setMatchDone([]);
    runningRef.current = false;
    setScreen("lesson");
  }, [setLearnedValue, setLevelValue, setupLevel]);

  const answerMultiple = useCallback((answer: string) => {
    if (!currentQuiz || currentQuiz.type !== "multiple" || selectedAnswer) return;
    setSelectedAnswer(answer);
    const correct = answer === currentQuiz.answer;
    advanceQuiz(correct, correct ? currentQuiz.success : `La respuesta correcta era: ${currentQuiz.answer}.`);
  }, [currentQuiz, selectedAnswer, advanceQuiz]);

  const answerWrite = useCallback(() => {
    if (!currentQuiz || currentQuiz.type !== "write" || selectedAnswer) return;
    const normalizedValue = normalizeAnswer(writeAnswer);
    const normalizedCorrect = normalizeAnswer(currentQuiz.answer);
    const correct = normalizedValue === normalizedCorrect || (normalizedCorrect.includes(normalizedValue) && normalizedValue.length > 2);
    setSelectedAnswer(writeAnswer || " ");
    advanceQuiz(correct, correct ? currentQuiz.success : `La respuesta era: ${currentQuiz.answer}.`);
  }, [currentQuiz, selectedAnswer, writeAnswer, advanceQuiz]);

  const resetSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setScoreValue(0);
    setLevelValue(1);
    setBestScore(0);
    setLearnedValue([]);
    collectedRef.current = [];
    setCollected([]);
    setLessonAnimals([]);
    usedAnimalIdsRef.current = new Set();
    playerAvatarRef.current = "male";
    setPlayerProfile(null);
    runningRef.current = false;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setScreen("login");
  }, [setLearnedValue, setLevelValue, setScoreValue]);

  useEffect(() => {
    gameLoopRef.current = gameLoop;
  }, [gameLoop]);

  useEffect(() => {
    playerSpritesRef.current = PLAYER_SPRITE_SRC.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    playerSpritesFRef.current = PLAYER_SPRITE_SRC_F.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    // Preload background
    const bgImg = new Image();
    bgImg.src = "/assets/images/bg_game.png";
    bgImageRef.current = bgImg;

    const magnetImg = new Image();
    magnetImg.src = "/assets/images/iman.svg";
    magnetImageRef.current = magnetImg;

    // Preload all animal Ghibli images
    ANIMALS_DB.forEach((animal) => {
      if (animal.image) {
        const img = new Image();
        img.src = animal.image;
        animalImagesRef.current.set(animal.id, img);
      }
    });
  }, []);

  useEffect(() => {
    const music = new Audio(SOUND_SRC.music);
    music.loop = true;
    music.volume = 0.4;
    music.preload = "auto";
    const lesson = new Audio(SOUND_SRC.lesson);
    lesson.loop = true;
    lesson.volume = 0.45;
    lesson.preload = "auto";
    const trivia = new Audio(SOUND_SRC.trivia);
    trivia.loop = true;
    trivia.volume = 0.5;
    trivia.preload = "auto";
    const reward = new Audio(SOUND_SRC.reward);
    reward.volume = 0.75;
    reward.preload = "auto";
    const wrong = new Audio(SOUND_SRC.wrong);
    wrong.volume = 0.7;
    wrong.preload = "auto";
    audioRef.current = { music, lesson, trivia, reward, wrong };

    return () => {
      [music, lesson, trivia, reward, wrong].forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      audioRef.current = {};
      currentTrackRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (screen === "lesson") {
      switchMusic("lesson");
    } else if (screen === "playing") {
      switchMusic("music");
    } else if (screen === "quiz") {
      switchMusic(quizDone ? "music" : "trivia");
    } else {
      switchMusic(null);
    }
  }, [screen, quizDone, switchMusic]);

  useEffect(() => {
    const onVisibility = () => {
      const current = currentTrackRef.current;
      if (!current) return;
      const audio = audioRef.current[current];
      if (!audio) return;
      if (document.visibilityState === "hidden") {
        audio.pause();
      } else {
        const promise = audio.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(() => undefined);
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return;

    try {
      const session = safeSession(JSON.parse(raw));
      if (!session) return;

      window.setTimeout(() => {
        setScoreValue(session.score);
        setLevelValue(session.level);
        setBestScore(session.bestScore);
        setLearnedValue(session.learnedAnimalIds);
      }, 0);
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [setLearnedValue, setLevelValue, setScoreValue]);

  useEffect(() => {
    const session: SavedSession = {
      level,
      score,
      bestScore: Math.max(bestScore, score),
      learnedAnimalIds: learnedIds,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }, [bestScore, learnedIds, level, score]);

  useEffect(() => {
    resizeCanvas();

    const onResize = () => {
      resizeCanvas();
      if (runningRef.current) setupLevel(levelRef.current);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden" && animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      } else if (document.visibilityState === "visible" && runningRef.current && !animationRef.current) {
        animationRef.current = requestAnimationFrame(gameLoopRef.current);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      // Don't capture keys while user is typing in any input/textarea
      const tag = (event.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      keysRef.current[event.code] = true;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(event.code)) {
        event.preventDefault();
      }
      if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") {
        jump();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      keysRef.current[event.code] = false;
      if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") {
        jumpHoldDelayFramesRef.current = 0;
        jumpHoldFramesRef.current = 0;
      }
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [jump, resizeCanvas, setupLevel]);

  // ── AI auto-scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (aiOpen) aiEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMsgs, aiOpen]);

  // ── AI context: track current lesson animal ────────────────────────────────
  useEffect(() => {
    if (screen === "lesson" && lessonAnimals[lessonIndex]) {
      aiCurrentAnimal.current = lessonAnimals[lessonIndex];
    } else {
      aiCurrentAnimal.current = null;
    }
  }, [screen, lessonAnimals, lessonIndex]);

  const setMobileKey = (key: "mobileLeft" | "mobileRight", value: boolean) => {
    keysRef.current[key] = value;
  };

  const setMobileJump = (value: boolean) => {
    keysRef.current.mobileJump = value;
    if (!value) {
      jumpHoldDelayFramesRef.current = 0;
      jumpHoldFramesRef.current = 0;
    }
  };

  // ── AI sendMessage ─────────────────────────────────────────────────────────
  const sendAiMessage = useCallback(async (text: string) => {
    if (!text.trim() || aiLoading) return;
    const userMsg: AiMsg = { role: "user", text };
    const nextMsgs = [...aiMsgs, userMsg];
    setAiMsgs(nextMsgs);
    setAiInput("");
    setAiLoading(true);

    const currentAnimal = aiCurrentAnimal.current;
    const learnedCount = learnedRef.current.length;
    const currentLevel = levelRef.current;
    const q = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // ── Offline smart response engine ─────────────────────────────────────
    const offlineReply = (): string => {
      // Context: which animal is the user currently viewing?
      const ctx = currentAnimal
        ? `Estás viendo al ${currentAnimal.nameEs} (${currentAnimal.nameArh} en Iku). ${currentAnimal.desc}`
        : null;

      // 1. "¿Qué animal estoy viendo?" / "qué es este animal"
      if (/que animal|que es este|que veo|que estoy viendo|este animal/.test(q)) {
        if (ctx) return ctx;
        return "Ahora mismo no estoy seguro qué animal estás mirando. Pasa a la pantalla de lección para ver sus detalles.";
      }

      // 2. Pronunciation / "cómo se pronuncia" / "cómo se dice"
      if (/pronuncia|se dice|como se llama|suena|nombre iku|en iku/.test(q)) {
        const found = ANIMALS_DB.find(a =>
          q.includes(a.nameEs.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) ||
          q.includes(a.nameArh.toLowerCase())
        ) ?? currentAnimal;
        if (found) {
          const phon: Record<string, string> = {
            Iwantu:"ee-WAHN-too", Murrunza:"moo-RROON-zah", Geyrota:"gey-ROH-tah",
            Marukontu:"mah-roo-KOHN-too", Gwitiri:"gwee-TEE-ree", Churmisi:"choor-MEE-see",
            "Chango chummi":"CHAN-go CHOOM-mee", "Chago tungu":"CHA-go TOON-goo",
            Kikro:"KEEK-roh", Akiriko:"ah-kee-REE-koh", Sisika:"see-SEE-kah",
            Gamaku:"gah-MAH-koo", Nuru:"NOO-roo", Waku:"WAH-koo", Wabunsi:"wah-BOON-see",
            Kuneyru:"koo-NEY-roo", Ucho:"OO-cho", Mamu:"MAH-moo", Ayugungu:"ah-yoo-GOON-goo",
            Bun:"BOON", Sekunu:"seh-KOO-noo", Isu:"EE-soo", Tinchume:"teen-CHOO-meh",
            Zeyku:"ZEY-koo", Mawunsiro:"mah-WOON-see-roh", Urumu:"oo-ROO-moo", Munkwu:"MOON-kwoo",
          };
          const pron = phon[found.nameArh] ?? found.nameArh.toUpperCase().split("").join("-");
          return `El ${found.nameEs} se llama **${found.nameArh}** en lengua Iku.\n\nSe pronuncia aproximadamente: (${pron})\n\nEn Iku, cada vocal se pronuncia claramente y las consonantes son suaves. ¡Intenta decirlo lento!`;
        }
        const list = ANIMALS_DB.slice(0, 8).map(a => `• ${a.nameEs} → **${a.nameArh}**`).join("\n");
        return `Aquí algunos nombres en Iku:\n\n${list}\n\n¿Sobre cuál quieres saber la pronunciación?`;
      }

      // 3. Specific animal lookup
      const animalMatch = ANIMALS_DB.find(a =>
        q.includes(a.nameEs.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) ||
        q.includes(a.nameArh.toLowerCase())
      );
      if (animalMatch) {
        return `**${animalMatch.nameEs}** — *${animalMatch.nameArh}* en Iku (${animalMatch.type})\n\n${animalMatch.desc}`;
      }

      // 4. Sierra Nevada
      if (/sierra nevada|sierra|montana|montaña/.test(q)) {
        return "La Sierra Nevada de Santa Marta es la montaña costera más alta del mundo, con picos que llegan a 5.775 m. Es el hogar de los pueblos Arhuaco (Iku), Kogi, Wiwa y Kankuamo. La consideran el \"corazón del mundo\" y sus guardianes son responsables de cuidar el equilibrio de la naturaleza.";
      }

      // 5. Iku language / Arhuaco culture
      if (/iku|arhuaco|arhuaca|lengua|idioma/.test(q)) {
        return "El **Iku** es la lengua del pueblo Arhuaco de la Sierra Nevada. Es una lengua de la familia Chibcha con sonidos únicos como la ü y consonantes aspiradas. Los Arhuacos la llaman \"la lengua de la Sierra\" y es fundamental para su espiritualidad, pues los nombres en Iku describen la esencia profunda de cada ser vivo.";
      }

      // 6. Mamo / Mamos / spiritual leaders
      if (/mamo|lider|sabio|espiritual|cosmolog/.test(q)) {
        return "Los **Mamos** son los líderes espirituales del pueblo Arhuaco. Estudian desde niños la ley de origen y son los guardianes del conocimiento ancestral. Interpretan los sueños, cuidan el equilibrio de la naturaleza y mantienen la comunicación con los seres espirituales de la Sierra.";
      }

      // 7. Mochila / tejido
      if (/mochila|tejido|kankurwa|artesania/.test(q)) {
        return "La **mochila Arhuaca** (o kankurwa) es tejida a mano con algodón o lana de oveja. Cada diseño geométrico cuenta una historia y tiene un significado espiritual. Las mujeres tejen las mochilas como práctica meditativa; cada punto es una reflexión. Son símbolo de identidad y resistencia cultural.";
      }

      // 8. Animals list
      if (/cuales animales|que animales|lista|todos los animales/.test(q)) {
        const list = ANIMALS_DB.map(a => `• ${a.nameEs} (${a.nameArh})`).join("\n");
        return `Animales de la Sierra Nevada en el juego:\n\n${list}`;
      }

      // 9. Player progress
      if (/progreso|nivel|puntos|cuantos aprendi/.test(q)) {
        return `Llevas ${learnedCount} animales aprendidos y estás en el nivel ${currentLevel}. ¡Sigue explorando la Sierra para conocer más especies!`;
      }

      // 10. Help / what can you do
      if (/ayuda|que puedes|que sabes|para que sirves/.test(q)) {
        return "Puedo ayudarte con:\n\n• Pronunciar nombres en lengua Iku\n• Datos sobre cualquier animal de la Sierra\n• Historia y cultura Arhuaca\n• Significado de la lengua Iku\n• Tradiciones como la mochila y los Mamos\n\n¡Pregúntame lo que quieras!";
      }

      // Default fallback
      const tips = [
        `¿Sabías que la Sierra Nevada tiene más de 600 especies de animales? Pregúntame sobre cualquiera de los que aparecen en el juego.`,
        `El pueblo Arhuaco llama a su lengua "Iku". ¿Quieres aprender a pronunciar algún nombre?`,
        `La Sierra Nevada de Santa Marta es considerada el corazón del mundo por los pueblos indígenas. ¿Quieres saber más?`,
        `Hay ${ANIMALS_DB.length} animales en el juego. ¡Intenta preguntarme sobre uno específico!`,
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    };

    // ── Try API first, fall back to offline ──────────────────────────────
    const systemPrompt = `Eres "Kogi", el asistente cultural del juego "Ana'nuga jina niwi ka'gʉmʉse' kwʉya".
Tu misión es ayudar a niños y jóvenes a aprender sobre la lengua Iku, los animales de la Sierra Nevada y la cultura Arhuaca.
Contexto del jugador: Nivel ${currentLevel}, ${learnedCount} animales aprendidos.
${currentAnimal ? `Animal actual: ${currentAnimal.nameEs} (${currentAnimal.nameArh}) — ${currentAnimal.desc}` : ""}
Responde SIEMPRE en español. Sé amigable, breve y educativo. Máximo 3 párrafos.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          messages: nextMsgs.map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        const reply = data?.content?.[0]?.text ?? offlineReply();
        setAiMsgs((prev) => [...prev, { role: "assistant", text: reply }]);
      } else {
        // API failed → use offline engine silently
        setAiMsgs((prev) => [...prev, { role: "assistant", text: offlineReply() }]);
      }
    } catch {
      // Network error → use offline engine silently
      setAiMsgs((prev) => [...prev, { role: "assistant", text: offlineReply() }]);
    } finally {
      setAiLoading(false);
    }
  }, [aiLoading, aiMsgs]);

  return (
    <main className={styles.game} aria-label="Guardianes de la Sierra Nevada">
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* ── Game HUD ─────────────────────────────────────── */}
      <section className={styles.hudNew} aria-live="polite">
        {/* Left: avatar + hearts */}
        <div className={styles.hudLeft}>
          <div className={styles.hudAvatarBlock}>
            <div className={styles.hudAvatarCircle}>
              <img
                src={playerProfile?.avatar === "female"
                  ? "/assets/images/personaje/f001.png"
                  : "/assets/images/personaje/001.png"}
                alt="avatar"
                className={styles.hudAvatarImg}
              />
            </div>
            {playerProfile ? (
              <span className={styles.hudAvatarName}>{playerProfile.name}</span>
            ) : null}
          </div>
          <div className={styles.hudHearts}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`${styles.hudHeart} ${i >= hearts ? styles.hudHeartEmpty : ""}`}>
                <HeartIcon size={18} filled={i < hearts} />
              </span>
            ))}
          </div>
        </div>

        {/* Center: leaf counter */}
        <div className={styles.hudCenter}>
          <div className={styles.hudLeafBadge}>
            <LeafIcon size={18} />
            <span>{collected.length} / 5</span>
          </div>
        </div>

        {/* Right: coin counter + pause */}
        <div className={styles.hudRight}>
          <div className={styles.hudCoinBadge}>
            <CoinIcon size={22} className={styles.hudCoinIcon} />
            <span>x {score}</span>
          </div>
          <button className={styles.hudPauseBtn} type="button" onClick={resetSession} title="Zukutu">
            <PauseIcon size={20} />
          </button>
        </div>
      </section>

      <section className={styles.collectedBar} aria-label="Animales recolectados">
        {Array.from({ length: 5 }).map((_, index) => {
          const animal = collected[index];
          return (
            <div key={index} className={`${styles.slot} ${animal ? styles.slotFilled : ""}`}>
              {animal ? <AnimalSymbol animal={animal} size={30} /> : null}
            </div>
          );
        })}
        <span className={styles.slotHelp}>Ana&apos;nuga 5 nʉnkunu — kankurwa nʉjwase&apos;!</span>
      </section>

      {screen === "playing" && activeEffect ? (
        <div className={`${styles.activeEffectBadge} ${styles[`effect_${activeEffect.kind}`]}`}>
          {activeEffect.kind === "speed" ? (
            <ZapIcon size={18} />
          ) : activeEffect.kind === "magnet" ? (
            <img className={styles.effectIconImg} src="/assets/images/iman.svg" alt="" />
          ) : (
            <StarIcon size={18} />
          )}
          <span>{activeEffect.kind === "speed" ? "¡Velocidad!" : activeEffect.kind === "magnet" ? "¡Imán activo!" : "¡+30 Bonus!"}</span>
        </div>
      ) : null}

      <section className={styles.mobileControls} aria-label="Controles táctiles">
        <div className={styles.mobileGroup}>
          <button
            className={styles.controlButton}
            type="button"
            aria-label="Mover a la izquierda"
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              setMobileKey("mobileLeft", true);
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              setMobileKey("mobileLeft", false);
            }}
            onPointerLeave={(event) => {
              if (!event.currentTarget.hasPointerCapture(event.pointerId)) setMobileKey("mobileLeft", false);
            }}
            onPointerCancel={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              setMobileKey("mobileLeft", false);
            }}
            onContextMenu={(event) => event.preventDefault()}
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            className={styles.controlButton}
            type="button"
            aria-label="Mover a la derecha"
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              setMobileKey("mobileRight", true);
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              setMobileKey("mobileRight", false);
            }}
            onPointerLeave={(event) => {
              if (!event.currentTarget.hasPointerCapture(event.pointerId)) setMobileKey("mobileRight", false);
            }}
            onPointerCancel={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              setMobileKey("mobileRight", false);
            }}
            onContextMenu={(event) => event.preventDefault()}
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
        <div className={styles.mobileGroup}>
          <button
            className={styles.controlButton}
            type="button"
            aria-label="Saltar"
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              setMobileJump(true);
              jump();
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              setMobileJump(false);
            }}
            onPointerLeave={(event) => {
              if (!event.currentTarget.hasPointerCapture(event.pointerId)) setMobileJump(false);
            }}
            onPointerCancel={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              setMobileJump(false);
            }}
            onContextMenu={(event) => event.preventDefault()}
          >
            <ArrowIcon direction="up" />
          </button>
        </div>
      </section>

      {screen === "login" ? (
        <>
          {/* ── STEP 1: Splash screen ── */}
          {loginStep === 1 ? (
            <section className={styles.splashScreen}>
              <div className={styles.splashBg}>
                <img src="/assets/images/fondo_inicio.jpeg" alt="Unzatikumúya" className={styles.splashBgImg} />
                <div className={styles.splashOverlay} />
              </div>
              <div className={styles.splashContent}>
                <div className={styles.splashStartBtn} onClick={() => setLoginStep(2)}>
                  <PlayIcon size={18} className={styles.splashStartBtnIcon} />
                  INICIAR
                </div>
              </div>
            </section>
          ) : (
            /* ── STEP 2: Character selection ── */
            <section className={styles.charSelectScreen}>
              {/* Dark background matching personajes.png style */}
              <div className={styles.charSelectBg} />

              <div className={styles.charSelectWrapper}>
                {/* Title */}
                <div className={styles.charSelectHeading}>
                  <span className={styles.charSelectDiamond} aria-hidden="true" />
                  AZI AWI ZAKACHOZɄNDI
                  <span className={styles.charSelectDiamond} aria-hidden="true" />
                </div>

                {/* Name input */}
                <div className={styles.charNameRow}>
                  <label className={styles.charNameLabel} htmlFor="cs-name">AZI JINA</label>
                  <input
                    id="cs-name"
                    className={styles.charNameInput}
                    type="text"
                    placeholder="Jina zukutu..."
                    value={loginName}
                    maxLength={24}
                    autoComplete="off"
                    onChange={(e) => setLoginName(e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === "Enter" && loginName.trim() && loginAvatar) {
                        playerAvatarRef.current = loginAvatar;
                        setPlayerProfile({ name: loginName.trim(), avatar: loginAvatar });
                        setScreen("start");
                      }
                    }}
                  />
                </div>

                {/* Character cards */}
                <div className={styles.charSelectCards}>
                  {/* Guardian */}
                  <button
                    type="button"
                    className={`${styles.charPickCard} ${styles.charPickMale} ${loginAvatar === "male" ? styles.charPickActive : ""}`}
                    onClick={() => setLoginAvatar("male")}
                  >
                    <div className={styles.charPickFrame}>
                      <img src="/assets/images/char_male.png" alt="Maku" className={styles.charPickImg} />
                    </div>
                    <div className={`${styles.charPickLabel} ${styles.charPickLabelMale}`}>
                      MAKU
                    </div>
                  </button>

                  {/* Guardiana */}
                  <button
                    type="button"
                    className={`${styles.charPickCard} ${styles.charPickFemale} ${loginAvatar === "female" ? styles.charPickActive : ""}`}
                    onClick={() => setLoginAvatar("female")}
                  >
                    <div className={styles.charPickFrame}>
                      <img src="/assets/images/char_female.png" alt="Mamʉ" className={styles.charPickImg} />
                    </div>
                    <div className={`${styles.charPickLabel} ${styles.charPickLabelFemale}`}>
                      MAKɄ
                    </div>
                  </button>
                </div>

                {/* Confirm button */}
                <button
                  className={styles.charConfirmBtn}
                  type="button"
                  disabled={!loginName.trim() || !loginAvatar}
                  onClick={() => {
                    if (!loginName.trim() || !loginAvatar) return;
                    playerAvatarRef.current = loginAvatar;
                    setPlayerProfile({ name: loginName.trim(), avatar: loginAvatar });
                    setScreen("start");
                  }}
                >
                  <LeafIcon size={18} />
                  <span>Ka&apos;gʉmʉse&apos; zukutu</span>
                </button>

                <button className={styles.charBackBtn} type="button" onClick={() => setLoginStep(1)}>
                  <ArrowIcon direction="left" />
                  <span>Volver</span>
                </button>
              </div>
            </section>
          )}
        </>
      ) : null}

      {screen === "start" ? (
        <section className={styles.startScreen}>
          <div className={styles.startPanel}>
            <div className={styles.brandMark}>
              <LeafIcon size={42} />
            </div>
            <h1 className={styles.title}>Guardianes de la Sierra Nevada</h1>
            {playerProfile ? (
              <p className={styles.playerGreeting}>
                <span className={styles.playerGreetingAvatar}>
                  <img
                    src={playerProfile.avatar === "female" ? "/assets/images/personaje/f001.png" : "/assets/images/personaje/001.png"}
                    alt=""
                  />
                </span>
                Ey, <strong>{playerProfile.name}</strong>
              </p>
            ) : null}
            <p className={styles.ikuLine}>
              Ana&apos;nuga jina niwi ka&apos;gumuse&apos; kwuya
              <span>Los animales de nuestra Sierra en lengua Iku</span>
            </p>
            <p className={styles.intro}>
              Explora la Sierra Nevada, recoge animales y abre cofres de sabiduría con información y actividades.
            </p>
            <div className={styles.previewGrid} aria-label="Animales del juego">
              {previewAnimals.map((animal) => (
                <span key={animal.id} className={styles.previewItem}>
                  <AnimalSymbol animal={animal} size={44} />
                </span>
              ))}
            </div>
            <div className={styles.actions}>
              <button className={styles.primaryButton} type="button" onClick={() => startGame(!hasSavedSession)}>
                {hasSavedSession ? "Continuar aventura" : "Empezar aventura"}
              </button>
              {hasSavedSession ? (
                <button className={styles.secondaryButton} type="button" onClick={() => startGame(true)}>
                  Nueva partida
                </button>
              ) : null}
            </div>
            <p className={styles.controlHint}>
              <span className={styles.hintKey}>A</span>
              <span className={styles.hintKey}>D</span>
              o flechas para moverse
              <span className={styles.hintKey}>W</span>
              <span className={styles.hintKey}>Espacio</span>
              para saltar
            </p>
          </div>
        </section>
      ) : null}

      {screen === "lesson" ? (
        <section className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="lesson-title">
          <div className={`${styles.modal} ${styles.lessonModal}`}>
            <header className={styles.lessonHeader}>
              <p className={styles.eyebrow}>
                <LeafIcon size={14} /> Lección · Nivel {level}
              </p>
              <h2 id="lesson-title" className={styles.lessonTitle}>
                Ana&apos;nuga jina nʉnkunu
              </h2>
              <p className={styles.lessonHint}>
                Ɉʉnkunu zukutu, kwintʉro zakachozʉndi.
              </p>
            </header>

            {lessonAnimals.length === 0 ? (
              <div className={styles.lessonFooter} style={{ justifyContent: "center", marginTop: "24px" }}>
                <button className={styles.primaryButton} type="button" onClick={beginLevel}>
                  Ka&apos;gʉmʉse&apos; zukutu
                </button>
              </div>
            ) : null}

            {lessonAnimals.length > 0 && lessonAnimals[lessonIndex] ? (
              (() => {
                const current = lessonAnimals[lessonIndex];
                const isLast = lessonIndex >= lessonAnimals.length - 1;
                const isFirst = lessonIndex === 0;
                const typeLabel = {
                  reptil: "Reptil",
                  ave: "Ave",
                  anfibio: "Anfibio",
                  pez: "Pez",
                  insecto: "Insecto",
                  mamifero: "Mamífero",
                }[current.type];
                return (
                  <>
                    <article
                      key={current.id}
                      className={`${styles.fieldCard} ${
                        lessonAnim === "right" ? styles.slideOutLeft : ""
                      } ${lessonAnim === "left" ? styles.slideOutRight : ""} ${
                        lessonAnim === "in" ? styles.slideIn : ""
                      }`}
                    >
                      {/* Top: image fills the card */}
                      <div className={styles.fieldCardImageWrap}>
                        {current.image ? (
                          <div className={styles.fieldCardImgCrop}>
                            <img src={current.image} alt={current.nameEs} className={styles.fieldCardImg} />
                          </div>
                        ) : (
                          <div className={styles.fieldCardGlyphFallback}>
                            <AnimalSymbol animal={current} size={110} />
                          </div>
                        )}
                        {/* Type badge over image */}
                        <span className={`${styles.fieldCardTypeBadge} ${styles[`type_${current.type}`]}`}>
                          {typeLabel.toUpperCase()}
                        </span>
                      </div>

                      {/* Bottom: info section */}
                      <div className={styles.fieldCardInfo}>
                        {/* Iku name — most prominent */}
                        <div className={styles.fieldCardIkuRow}>
                          <span className={styles.fieldCardIkuChip}>IKU</span>
                          <span className={styles.fieldCardIkuName}>{current.nameArh}</span>
                          {current.audio && (
                            <button
                              type="button"
                              className={styles.fieldCardAudioBtn}
                              aria-label={`Escuchar nombre en Iku de ${current.nameEs}`}
                              onClick={() => {
                                const audio = new Audio(current.audio);
                                audio.play();
                              }}
                            >
                              <SpeakerIcon size={18} />
                            </button>
                          )}
                        </div>

                        <h3 className={styles.fieldCardEsName}>{current.nameEs}</h3>

                        {/* Labeled data rows like the reference */}
                        <div className={styles.fieldCardLabels}>
                          <div className={styles.fieldCardRow}>
                            <span className={styles.fieldCardDot} />
                            <span className={styles.fieldCardKey}>Nombre Iku</span>
                            <span className={styles.fieldCardVal}>{current.nameArh}</span>
                          </div>
                          <div className={styles.fieldCardRow}>
                            <span className={styles.fieldCardDot} />
                            <span className={styles.fieldCardKey}>Nombre en español</span>
                            <span className={styles.fieldCardVal}>{current.nameEs}</span>
                          </div>
                          <div className={styles.fieldCardRow}>
                            <span className={styles.fieldCardDot} />
                            <span className={styles.fieldCardKey}>Clasificación</span>
                            <span className={styles.fieldCardVal}>{typeLabel}</span>
                          </div>
                        </div>

                        <p className={styles.fieldCardDesc}>{current.desc}</p>
                      </div>
                    </article>

                    <div className={styles.progressDots} role="tablist">
                      {lessonAnimals.map((animal, index) => (
                        <button
                          key={animal.id}
                          type="button"
                          role="tab"
                          aria-selected={index === lessonIndex}
                          aria-label={`Ir al animal ${index + 1}`}
                          className={`${styles.dot} ${index === lessonIndex ? styles.dotActive : ""} ${index < lessonIndex ? styles.dotSeen : ""}`}
                          onClick={() => {
                            if (index === lessonIndex) return;
                            setLessonAnim(index > lessonIndex ? "right" : "left");
                            window.setTimeout(() => {
                              setLessonIndex(index);
                              setLessonAnim("in");
                            }, 180);
                          }}
                        />
                      ))}
                    </div>

                    <div className={styles.lessonFooter}>
                      <button
                        className={styles.navButton}
                        type="button"
                        onClick={() => goLesson(-1)}
                        disabled={isFirst}
                        aria-label="Animal anterior"
                      >
                        <ArrowIcon direction="left" />
                        <span>Kʉnkunu</span>
                      </button>
                      <span className={styles.counter}>
                        {lessonIndex + 1} <span>/ {lessonAnimals.length}</span>
                      </span>
                      {isLast ? (
                        <button className={styles.primaryButton} type="button" onClick={beginLevel}>
                          Comenzar exploración
                        </button>
                      ) : (
                        <button
                          className={styles.navButton}
                          type="button"
                          onClick={() => goLesson(1)}
                          aria-label="Neyku animal"
                        >
                          <span>Siguiente</span>
                          <ArrowIcon direction="right" />
                        </button>
                      )}
                    </div>
                  </>
                );
              })()
            ) : null}
          </div>
        </section>
      ) : null}

      {screen === "quiz" ? (
        <section className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="quiz-title">
          <div className={`${styles.modal} ${styles.quizModal}`}>
            <header className={styles.modalHeader}>
              <div className={styles.chestBadge}>
                <ChestIcon size={44} />
              </div>
              <p className={styles.eyebrow}>Kankurwa niwi</p>
              <h2 id="quiz-title" className={styles.modalTitle}>
                {quizDone ? "¡Ey! Nigua zukusʉ!" : quizAttempts >= MAX_ATTEMPTS ? "Zukutu nʉnkunu!" : "Ana'nuga jina zakachozʉndi"}
              </h2>
              {!quizDone ? (
                <p className={styles.modalSubtitle}>
                  {quizAttempts >= MAX_ATTEMPTS
                    ? "Agotaste los intentos. Regresarás a ver los animales de nuevo."
                    : `${collected.length} ana'nuga nʉnkusʉ. Zukutu zakachozʉndi!`}
                </p>
              ) : null}
            </header>

            {quizDone ? (
              <section className={styles.completePanel}>
                <div className={styles.bigScore}>
                  <span className={styles.bigScoreNum}>{quizScore}</span>
                  <span className={styles.bigScoreDiv}>/</span>
                  <span className={styles.bigScoreTotal}>{quizzes.length}</span>
                </div>
                <p>
                  Tu progreso fue guardado. Puntaje, animales aprendidos y nivel quedan listos para continuar después.
                </p>
                <button className={styles.primaryButton} type="button" onClick={continueAfterQuiz}>
                  Nigua neyku
                </button>
              </section>
            ) : currentQuiz ? (
              <section className={styles.quizBox}>
                <div className={styles.quizTopline}>
                  <span>Zakachozʉndi {quizIndex + 1} / {quizzes.length}</span>
                  <span className={styles.quizTypeChip}>
                    {{ multiple: "Zakachozʉndi", write: "Ɉʉnkunu", wordsearch: "Jina nʉnkunu", order: "Zukutu", match: "Kunkunu", image_pick: "Ʉjwase' zakachozʉndi", truefalse: "Ey / Awi" }[currentQuiz.type]}
                  </span>
                </div>
                <div className={styles.quizProgressBar} aria-hidden="true">
                  <span className={styles.quizProgressFill} style={{ width: `${(quizIndex / quizzes.length) * 100}%` }} />
                </div>

                {/* Subject header (not shown for match) */}
                {currentQuiz.type !== "match" && "subject" in currentQuiz && (
                  <div className={styles.quizSubjectFull}>
                    {currentQuiz.subject.image ? (
                      <div className={styles.quizSubjectImgOnly}>
                        <div className={styles.imgCropWrap} style={{ borderRadius: "12px", aspectRatio: "16/7" }}>
                          <img src={currentQuiz.subject.image} alt="animal misterioso" style={{ height: "140%", objectPosition: "center bottom" }} />
                        </div>
                      </div>
                    ) : (
                      <div className={styles.quizSubject}>
                        <AnimalSymbol animal={currentQuiz.subject} size={56} />
                        <div>
                          <div className={styles.quizSubjectName}>{currentQuiz.subject.nameEs}</div>
                          <div className={styles.quizSubjectIku}>Iku: {currentQuiz.subject.nameArh}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <p className={styles.quizPrompt}>{currentQuiz.prompt}</p>

                {/* MULTIPLE CHOICE */}
                {currentQuiz.type === "multiple" && (
                  <div className={styles.answers}>
                    {(currentQuiz as typeof currentQuiz & { options: string[] }).options.map((option: string) => {
                      const isSelected = selectedAnswer === option;
                      const isCorrect = selectedAnswer && option === currentQuiz.answer;
                      const isWrong = isSelected && option !== currentQuiz.answer;
                      return (
                        <button key={option} className={`${styles.answerButton} ${isCorrect ? styles.correct : ""} ${isWrong ? styles.wrong : ""}`} type="button" disabled={Boolean(selectedAnswer)} onClick={() => answerMultiple(option)}>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* WRITE */}
                {currentQuiz.type === "write" && (
                  <div className={styles.writeSection}>
                    <div className={styles.writeRow}>
                      <input
                        className={styles.writeInput}
                        value={writeAnswer}
                        disabled={Boolean(selectedAnswer)}
                        onChange={(e) => setWriteAnswer(e.target.value)}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === "Enter") answerWrite();
                        }}
                        placeholder="Escribe tu respuesta"
                        autoComplete="off"
                      />
                      <button className={styles.checkButton} type="button" disabled={Boolean(selectedAnswer)} onClick={answerWrite}>Zakachozʉndi</button>
                    </div>
                    {/* Iku keyboard */}
                    {!selectedAnswer && (
                      <div className={styles.ikuKeyboard}>
                        <div className={styles.ikuKeyboardLabel}>
                          <LeafIcon size={13} />
                          <span>Letras Iku</span>
                        </div>
                        <div className={styles.ikuKeyboardKeys}>
                          {["a","b","ch","d","e","g","i","j","ɉ","k","m","n","o","p","r","s","t","u","ʉ","w","y","z","'"].map((letter) => (
                            <button
                              key={letter}
                              type="button"
                              className={styles.ikuKey}
                              onClick={() => setWriteAnswer((prev) => prev + letter)}
                              disabled={Boolean(selectedAnswer)}
                            >
                              {letter}
                            </button>
                          ))}
                          <button
                            type="button"
                            className={`${styles.ikuKey} ${styles.ikuKeyDel}`}
                            onClick={() => setWriteAnswer((prev) => prev.slice(0, -1))}
                            disabled={Boolean(selectedAnswer)}
                            title="Borrar"
                          >
                            <BackspaceIcon size={17} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* WORD SEARCH */}
                {currentQuiz.type === "wordsearch" && (() => {
                  const q = currentQuiz as WordSearchQuestion;
                  const done = foundWord || Boolean(selectedAnswer);
                  const isCoord = (r: number, c: number) => q.wordCoords.some(([wr, wc]) => wr === r && wc === c);
                  const isSelected = (r: number, c: number) => selectedCells.some(([sr, sc]) => sr === r && sc === c);
                  const handleCellClick = (r: number, c: number) => {
                    if (done) return;
                    const already = selectedCells.some(([sr, sc]) => sr === r && sc === c);
                    const next = already ? selectedCells.filter(([sr, sc]) => !(sr === r && sc === c)) : [...selectedCells, [r, c] as [number, number]];
                    setSelectedCells(next);
                    const formed = next.map(([sr, sc]) => q.grid[sr][sc]).join("");
                    if (formed === q.answer || formed === q.answer.split("").reverse().join("")) {
                      setFoundWord(true);
                      setSelectedAnswer("found");
                      advanceQuiz(true, q.success);
                    } else if (next.length >= q.answer.length) {
                      setSelectedAnswer("wrong");
                      advanceQuiz(false, `La palabra era: ${q.answer}. ¡Inténtalo de nuevo la próxima vez!`);
                    }
                  };
                  return (
                    <div className={styles.wordSearchWrap}>
                      <div className={styles.wordSearchTarget}>Nʉnkunu: <strong>{q.answer}</strong></div>
                      <div className={styles.wordSearchGrid} style={{ gridTemplateColumns: `repeat(${q.grid[0].length}, 1fr)` }}>
                        {q.grid.map((row, r) => row.map((cell, c) => {
                          const found = done && isCoord(r, c);
                          const sel = isSelected(r, c);
                          return (
                            <button key={`${r}-${c}`} type="button" className={`${styles.wsCell} ${found ? styles.wsCellFound : ""} ${sel && !done ? styles.wsCellSel : ""}`} onClick={() => handleCellClick(r, c)} disabled={done}>
                              {cell}
                            </button>
                          );
                        }))}
                      </div>
                      <p className={styles.wsHint}>Selecciona las letras en orden para formar la palabra</p>
                    </div>
                  );
                })()}

                {/* ORDER LETTERS */}
                {currentQuiz.type === "order" && (() => {
                  const q = currentQuiz as OrderQuestion;
                  const done = Boolean(selectedAnswer);
                  const handleLetterClick = (letter: string, idx: number) => {
                    if (done || orderUsed[idx]) return;
                    const newPlaced = [...orderPlaced, letter];
                    const newUsed = orderUsed.map((u, i) => i === idx ? true : u);
                    if (newUsed.length === 0) {
                      const usedArr = q.shuffled.map(() => false);
                      usedArr[idx] = true;
                      setOrderUsed(usedArr);
                    } else {
                      setOrderUsed(newUsed);
                    }
                    setOrderPlaced(newPlaced);
                    if (newPlaced.length === q.answer.length) {
                      const formed = newPlaced.join("");
                      const correct = formed === q.answer;
                      setSelectedAnswer(formed);
                      advanceQuiz(correct, correct ? q.success : `La respuesta correcta era: ${q.answer}.`);
                    }
                  };
                  const handleRemoveLast = () => {
                    if (done || orderPlaced.length === 0) return;
                    const lastIdx = [...orderUsed].map((u, i) => ({ u, i })).filter(x => x.u).pop()?.i;
                    if (lastIdx !== undefined) {
                      const newUsed = [...orderUsed];
                      newUsed[lastIdx] = false;
                      setOrderUsed(newUsed);
                    }
                    setOrderPlaced(orderPlaced.slice(0, -1));
                  };
                  return (
                    <div className={styles.orderWrap}>
                      <div className={styles.orderAnswer}>
                        {q.answer.split("").map((_, i) => (
                          <div key={i} className={`${styles.orderSlot} ${orderPlaced[i] ? styles.orderSlotFilled : ""} ${done && selectedAnswer === q.answer ? styles.correct : done ? styles.wrong : ""}`}>
                            {orderPlaced[i] ?? ""}
                          </div>
                        ))}
                      </div>
                      <div className={styles.orderLetters}>
                        {q.shuffled.map((letter, i) => (
                          <button key={i} type="button" className={`${styles.orderLetter} ${orderUsed[i] ? styles.orderLetterUsed : ""}`} onClick={() => handleLetterClick(letter, i)} disabled={done || (orderUsed[i] ?? false)}>
                            {letter}
                          </button>
                        ))}
                      </div>
                      {!done && orderPlaced.length > 0 && (
                        <button type="button" className={styles.orderUndo} onClick={handleRemoveLast}>
                          <BackspaceIcon size={16} />
                          <span>Borrar última</span>
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* MATCH */}
                {currentQuiz.type === "match" && (() => {
                  const q = currentQuiz as MatchQuestion;
                  const done = Boolean(selectedAnswer) || matchDone.length === q.pairs.length;
                  const handleIku = (iku: string) => { if (done) return; setMatchLeft(iku === matchLeft ? null : iku); };
                  const handleEs = (es: string) => {
                    if (done || !matchLeft) return;
                    const pair = q.pairs.find(p => p.iku === matchLeft);
                    if (!pair) return;
                    const correct = pair.es === es;
                    if (correct) {
                      const newDone = [...matchDone, { iku: matchLeft, es }];
                      setMatchDone(newDone);
                      setMatchLeft(null);
                      if (newDone.length === q.pairs.length) {
                        setSelectedAnswer("done");
                        advanceQuiz(true, q.success);
                      }
                    } else {
                      setMatchLeft(null);
                      setFeedback({ kind: "fail", text: `"${matchLeft}" no corresponde a "${es}". Intenta de nuevo.` });
                      window.setTimeout(() => setFeedback(null), 1200);
                    }
                  };
                  return (
                    <div className={styles.matchWrap}>
                      <div className={styles.matchColumns}>
                        <div className={styles.matchCol}>
                          {q.pairs.map(p => {
                            const isDone = matchDone.some(d => d.iku === p.iku);
                            return (
                              <button key={p.iku} type="button" className={`${styles.matchChip} ${matchLeft === p.iku ? styles.matchChipActive : ""} ${isDone ? styles.matchChipDone : ""}`} onClick={() => handleIku(p.iku)} disabled={done || isDone}>
                                <LeafIcon size={15} />
                                <span>{p.iku}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className={styles.matchArrow}><ArrowIcon direction="right" /></div>
                        <div className={styles.matchCol}>
                          {shuffle(q.pairs.map(p => p.es)).map(es => {
                            const isDone = matchDone.some(d => d.es === es);
                            return (
                              <button key={es} type="button" className={`${styles.matchChip} ${styles.matchChipRight} ${isDone ? styles.matchChipDone : ""}`} onClick={() => handleEs(es)} disabled={done || isDone || !matchLeft}>
                                <AnimalSymbol type="reptil" size={18} />
                                <span>{es}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {matchDone.length > 0 && !done && (
                        <div className={styles.matchProgress}>
                          <CheckIcon size={15} />
                          <span>{matchDone.length} / {q.pairs.length} emparejados</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* IMAGE PICK */}
                {currentQuiz.type === "image_pick" && (() => {
                  const q = currentQuiz as ImagePickQuestion;
                  const done = Boolean(selectedAnswer);
                  return (
                    <div className={styles.imagePickGrid}>
                      {q.options.map(opt => {
                        const isSelected = selectedAnswer === opt.id;
                        const isCorrect = done && opt.id === q.answer;
                        const isWrong = isSelected && opt.id !== q.answer;
                        return (
                          <button key={opt.id} type="button" className={`${styles.imagePickCard} ${isCorrect ? styles.correct : ""} ${isWrong ? styles.wrong : ""}`} onClick={() => { if (done) return; setSelectedAnswer(opt.id); advanceQuiz(opt.id === q.answer, opt.id === q.answer ? q.success : `Era ${q.options.find(o => o.id === q.answer)?.nameEs}.`); }} disabled={done}>
                            <div className={styles.imgCropWrap}>
                              <img src={opt.image} alt="" />
                            </div>
                            <span>{opt.nameEs}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* TRUE / FALSE */}
                {currentQuiz.type === "truefalse" && (() => {
                  const q = currentQuiz as TrueFalseQuestion;
                  const done = Boolean(selectedAnswer);
                  const handleTF = (val: boolean) => {
                    if (done) return;
                    setSelectedAnswer(String(val));
                    advanceQuiz(val === q.answer, val === q.answer ? q.success : `Era ${q.answer ? "VERDADERO" : "FALSO"}.`);
                  };
                  return (
                    <div className={styles.trueFalseWrap}>
                      <div className={styles.tfStatement}>{q.statement}</div>
                      <div className={styles.tfButtons}>
                        <button type="button" className={`${styles.tfBtn} ${styles.tfTrue} ${selectedAnswer === "true" ? (q.answer ? styles.correct : styles.wrong) : ""}`} onClick={() => handleTF(true)} disabled={done}>
                          <CheckIcon size={20} />
                          <span>Ey</span>
                        </button>
                        <button type="button" className={`${styles.tfBtn} ${styles.tfFalse} ${selectedAnswer === "false" ? (!q.answer ? styles.correct : styles.wrong) : ""}`} onClick={() => handleTF(false)} disabled={done}>
                          <CloseIcon size={20} />
                          <span>Awi</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Attempt counter */}
                <div className={styles.attemptsRow}>
                  {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                    <span key={i} className={`${styles.attemptDot} ${i < MAX_ATTEMPTS - quizAttempts ? styles.attemptDotActive : styles.attemptDotUsed}`} />
                  ))}
                  <span className={styles.attemptsLabel}>
                    {quizAttempts === 0 ? `${MAX_ATTEMPTS} intentos` : quizAttempts >= MAX_ATTEMPTS ? "Sin intentos" : `${MAX_ATTEMPTS - quizAttempts} intento${MAX_ATTEMPTS - quizAttempts === 1 ? "" : "s"} restante${MAX_ATTEMPTS - quizAttempts === 1 ? "" : "s"}`}
                  </span>
                </div>

                <p className={`${styles.feedback} ${feedback?.kind === "ok" ? styles.feedbackOk : ""} ${feedback?.kind === "fail" ? styles.feedbackFail : ""}`}>
                  {feedback?.text}
                </p>
              </section>
            ) : null}
          </div>
        </section>
      ) : null}
      {/* ── AI Assistant ─────────────────────────────────────────────── */}
      {screen !== "lesson" && screen !== "quiz" ? (
        <>
          <button
            className={`${styles.aiFloatBtn} ${aiOpen ? styles.aiFloatBtnOpen : ""}`}
            type="button"
            aria-label={aiOpen ? "Cerrar asistente" : "Abrir asistente Kogi"}
            onClick={() => {
              setAiOpen((v) => {
                if (!v && aiMsgs.length === 0) {
                  // Welcome message
                  setAiMsgs([{
                    role: "assistant",
                    text: "¡Hola! Soy Kogi, tu guía cultural. Puedo ayudarte a pronunciar los nombres en Iku, contarte sobre los animales de la Sierra Nevada y explicarte su importancia para la cultura Arhuaca. ¿Qué quieres saber?",
                  }]);
                }
                return !v;
              });
            }}
          >
            {aiOpen ? <CloseIcon size={22} /> : <BotIcon size={25} />}
          </button>

          {aiOpen ? (
            <div className={styles.aiPanel} role="dialog" aria-label="Asistente Kogi">
              <div className={styles.aiHeader}>
                <span className={styles.aiAvatar}><LeafIcon size={22} /></span>
                <div>
                  <div className={styles.aiName}>Kogi</div>
                  <div className={styles.aiSubtitle}>Guía cultural · Sierra Nevada</div>
                </div>
              </div>

              <div className={styles.aiMessages}>
                {aiMsgs.map((msg, i) => (
                  <div key={i} className={`${styles.aiMsg} ${msg.role === "user" ? styles.aiMsgUser : styles.aiMsgBot}`}>
                    {msg.role === "assistant" && <span className={styles.aiMsgAvatar}><LeafIcon size={16} /></span>}
                    <div className={styles.aiMsgBubble}>{renderAiText(msg.text)}</div>
                  </div>
                ))}
                {aiLoading ? (
                  <div className={`${styles.aiMsg} ${styles.aiMsgBot}`}>
                    <span className={styles.aiMsgAvatar}><LeafIcon size={16} /></span>
                    <div className={`${styles.aiMsgBubble} ${styles.aiTyping}`}>
                      <span /><span /><span />
                    </div>
                  </div>
                ) : null}
                <div ref={aiEndRef} />
              </div>

              {/* Quick prompts */}
              {aiMsgs.length <= 1 ? (
                <div className={styles.aiQuickRow}>
                  {[
                    "¿Cómo se pronuncia el nombre Iku?",
                    "¿Qué animal estoy viendo?",
                    "Cuéntame sobre la Sierra Nevada",
                    "¿Qué significa Iku?",
                  ].map((q) => (
                    <button key={q} className={styles.aiQuickBtn} type="button" onClick={() => sendAiMessage(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className={styles.aiInputRow}>
                <input
                  className={styles.aiInput}
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendAiMessage(aiInput);
                    }
                  }}
                  placeholder="Jina zukutu..."
                  disabled={aiLoading}
                  autoComplete="off"
                />
                <button
                  className={styles.aiSendBtn}
                  type="button"
                  disabled={aiLoading || !aiInput.trim()}
                  onClick={() => sendAiMessage(aiInput)}
                >
                  <SendIcon size={18} />
                </button>
              </div>

              {/* Iku keyboard for bot */}
              <div className={styles.aiIkuKeyboard}>
                {["a","b","ch","d","e","g","i","j","ɉ","k","m","n","o","p","r","s","t","u","ʉ","w","y","z","'"].map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    className={styles.aiIkuKey}
                    onClick={() => setAiInput((prev) => prev + letter)}
                    disabled={aiLoading}
                  >
                    {letter}
                  </button>
                ))}
                <button
                  type="button"
                  className={`${styles.aiIkuKey} ${styles.aiIkuKeyDel}`}
                  onClick={() => setAiInput((prev) => prev.slice(0, -1))}
                  disabled={aiLoading}
                >
                  <BackspaceIcon size={15} />
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </main>
  );
}
