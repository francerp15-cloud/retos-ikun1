import type { ReactNode } from "react";
import type { Animal, AnimalType } from "./types";

type Props = {
  animal?: Animal;
  type?: AnimalType;
  size?: number;
  label?: string;
};

type Palette = { base: string; accent: string; dark: string; light: string };

const COLORS: Record<AnimalType, Palette> = {
  reptil: { base: "#7ac96f", accent: "#d9c967", dark: "#17452d", light: "#e6f4cc" },
  ave: { base: "#4f9ad6", accent: "#f2b84b", dark: "#17324a", light: "#eaf3fb" },
  anfibio: { base: "#6fd083", accent: "#d9f0a3", dark: "#184b2f", light: "#eafbd6" },
  pez: { base: "#48b7c9", accent: "#f0c35b", dark: "#124c5b", light: "#dff2f5" },
  insecto: { base: "#9b78d5", accent: "#f2a7c4", dark: "#30204c", light: "#efe6fb" },
  mamifero: { base: "#c08a52", accent: "#f0d0a0", dark: "#4f2f17", light: "#f6e8d4" },
};

function renderAnimal(id: string, c: Palette): ReactNode {
  switch (id) {
    case "iguana":
      return (
        <>
          <path d="M8 40 Q12 30 22 30 L40 32 Q52 30 56 36 Q54 42 44 42 L26 44 Q14 46 8 40 Z" fill={c.base} stroke={c.dark} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M16 32 l2 -5 l3 5 l2 -6 l3 6 l2 -5 l3 5 l2 -5 l3 5" stroke={c.dark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M18 42 v8 M30 44 v7 M42 42 v8" stroke={c.dark} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M52 38 q6 1 9 -2" stroke={c.dark} strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <circle cx="50" cy="35" r="1.8" fill={c.dark} />
          <path d="M44 38 q3 1 6 0" stroke={c.accent} strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      );
    case "lobito":
      return (
        <>
          <path d="M9 36 Q14 30 22 31 L42 33 Q52 33 56 37 Q54 41 46 41 L26 41 Q14 41 9 36 Z" fill={c.accent} stroke={c.dark} strokeWidth="1.5" />
          <path d="M20 41 v6 M32 41 v6 M44 41 v6" stroke={c.dark} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M55 38 q4 1 6 -1" stroke={c.dark} strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="50" cy="35" r="1.6" fill={c.dark} />
        </>
      );
    case "anolis":
      return (
        <>
          <path d="M8 34 Q12 28 22 28 L42 30 Q52 30 56 34 Q54 38 46 38 L26 38 Q14 38 8 34 Z" fill={c.base} stroke={c.dark} strokeWidth="1.4" />
          <path d="M18 38 v5 M30 38 v5 M42 38 v5" stroke={c.dark} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M14 36 q-3 4 -1 8 q3 -2 3 -6" fill="#e8534b" stroke={c.dark} strokeWidth="1" />
          <circle cx="50" cy="33" r="1.6" fill={c.dark} />
        </>
      );
    case "cascabel":
      return (
        <>
          <path d="M14 44 Q12 34 22 30 Q34 26 40 32 Q46 38 38 42 Q30 46 28 40 Q26 36 32 36" stroke={c.accent} strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M14 44 Q12 34 22 30 Q34 26 40 32 Q46 38 38 42 Q30 46 28 40" stroke={c.dark} strokeWidth="2" fill="none" strokeDasharray="4 3" />
          <circle cx="22" cy="32" r="2" fill={c.dark} />
          <path d="M11 46 l-3 4 M11 44 l-4 1 M13 42 l-5 -1" stroke={c.dark} strokeWidth="2" strokeLinecap="round" />
        </>
      );
    case "coral":
      return (
        <>
          <path d="M12 42 Q10 28 24 26 Q40 24 44 36 Q46 46 34 46 Q24 46 24 38 Q24 32 32 32" stroke="#e6463f" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M16 36 Q18 34 22 34" stroke="#1a1208" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M28 28 Q32 27 36 28" stroke="#1a1208" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M40 40 Q42 42 44 44" stroke="#1a1208" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M24 42 Q26 44 28 44" stroke="#f5d75a" strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle cx="44" cy="36" r="1.8" fill={c.dark} />
        </>
      );
    case "mapana":
      return (
        <>
          <path d="M10 44 Q14 32 26 30 Q40 28 48 36 Q52 42 44 44 Q34 46 32 40 Q30 36 38 36" stroke={c.base} strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M14 40 l4 -2 l-2 -2 l4 -2 l-2 -2 l4 -2 l-2 -2 l4 -1" stroke={c.dark} strokeWidth="1.6" fill="none" strokeLinejoin="round" />
          <path d="M44 32 l8 -3 l-4 6 z" fill={c.dark} />
          <circle cx="49" cy="33" r="1.4" fill={c.accent} />
        </>
      );
    case "tortuga":
      return (
        <>
          <ellipse cx="32" cy="38" rx="20" ry="12" fill={c.accent} />
          <path d="M14 38 Q14 24 32 24 Q50 24 50 38 Z" fill={c.base} stroke={c.dark} strokeWidth="1.8" />
          <path d="M32 24 V38 M22 28 L26 38 M42 28 L38 38" stroke={c.dark} strokeWidth="1.6" fill="none" />
          <circle cx="26" cy="30" r="1.5" fill={c.dark} opacity="0.6" />
          <circle cx="38" cy="30" r="1.5" fill={c.dark} opacity="0.6" />
          <circle cx="32" cy="34" r="1.5" fill={c.dark} opacity="0.6" />
          <ellipse cx="52" cy="36" rx="6" ry="5" fill={c.base} stroke={c.dark} strokeWidth="1.4" />
          <circle cx="54" cy="35" r="1.4" fill={c.dark} />
          <rect x="16" y="44" width="6" height="6" rx="2" fill={c.base} stroke={c.dark} strokeWidth="1.2" />
          <rect x="42" y="44" width="6" height="6" rx="2" fill={c.base} stroke={c.dark} strokeWidth="1.2" />
        </>
      );
    case "condor":
      return (
        <>
          <path d="M6 28 Q20 18 30 28 Q40 18 58 28 Q50 36 32 32 Q14 36 6 28 Z" fill="#2a2118" stroke={c.dark} strokeWidth="1.4" />
          <ellipse cx="32" cy="40" rx="9" ry="11" fill="#1a1208" />
          <ellipse cx="32" cy="36" rx="7" ry="4" fill={c.light} />
          <circle cx="32" cy="32" r="4.5" fill="#1a1208" />
          <path d="M32 32 l4 2 l-4 2 z" fill={c.accent} />
          <circle cx="30.5" cy="31" r="1.2" fill={c.accent} />
          <path d="M28 26 q2 -3 4 -3 q2 0 4 3" fill="#c63a2e" />
        </>
      );
    case "turpial":
      return (
        <>
          <ellipse cx="30" cy="36" rx="14" ry="10" fill={c.accent} />
          <circle cx="42" cy="28" r="8" fill="#1a1208" />
          <path d="M48 30 l6 -1 l-5 4 z" fill={c.accent} />
          <circle cx="44" cy="27" r="1.4" fill={c.light} />
          <path d="M20 40 q-6 2 -10 6" stroke={c.dark} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M28 44 v6 M32 44 v6" stroke={c.dark} strokeWidth="2" strokeLinecap="round" />
          <path d="M30 36 q4 -2 8 0" stroke="#1a1208" strokeWidth="2" fill="none" />
        </>
      );
    case "tucan1":
      return (
        <>
          <ellipse cx="28" cy="38" rx="14" ry="12" fill="#1a1208" />
          <ellipse cx="26" cy="42" rx="9" ry="5" fill={c.accent} />
          <path d="M38 30 Q56 28 58 36 Q56 42 38 36 Z" fill={c.accent} stroke={c.dark} strokeWidth="1.4" />
          <path d="M38 30 Q48 30 52 33" stroke="#c63a2e" strokeWidth="1.4" fill="none" />
          <circle cx="34" cy="30" r="2" fill={c.light} />
          <circle cx="34" cy="30" r="1" fill={c.dark} />
          <path d="M22 48 v5 M28 48 v5" stroke={c.dark} strokeWidth="2.2" strokeLinecap="round" />
        </>
      );
    case "tucan2":
      return (
        <>
          <ellipse cx="28" cy="38" rx="14" ry="12" fill="#1a1208" />
          <ellipse cx="26" cy="42" rx="9" ry="5" fill={c.light} />
          <path d="M38 30 Q56 28 58 36 Q56 42 38 36 Z" fill="#e07a2c" stroke={c.dark} strokeWidth="1.4" />
          <path d="M38 30 Q48 30 52 33" stroke="#c63a2e" strokeWidth="1.4" fill="none" />
          <circle cx="34" cy="30" r="2" fill={c.light} />
          <circle cx="34" cy="30" r="1" fill={c.dark} />
          <path d="M22 48 v5 M28 48 v5" stroke={c.dark} strokeWidth="2.2" strokeLinecap="round" />
        </>
      );
    case "rana":
      return (
        <>
          <ellipse cx="32" cy="40" rx="20" ry="14" fill={c.base} stroke={c.dark} strokeWidth="1.5" />
          <ellipse cx="22" cy="26" rx="7" ry="8" fill={c.base} stroke={c.dark} strokeWidth="1.4" />
          <ellipse cx="42" cy="26" rx="7" ry="8" fill={c.base} stroke={c.dark} strokeWidth="1.4" />
          <circle cx="22" cy="26" r="4" fill={c.light} />
          <circle cx="42" cy="26" r="4" fill={c.light} />
          <circle cx="22" cy="27" r="2.2" fill={c.dark} />
          <circle cx="42" cy="27" r="2.2" fill={c.dark} />
          <path d="M22 44 Q32 50 42 44" stroke={c.dark} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M10 48 q-3 2 -4 5 M54 48 q3 2 4 5" stroke={c.dark} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </>
      );
    case "sapo":
      return (
        <>
          <ellipse cx="32" cy="40" rx="20" ry="14" fill="#7a6438" stroke={c.dark} strokeWidth="1.5" />
          <ellipse cx="22" cy="28" rx="7" ry="7" fill="#7a6438" stroke={c.dark} strokeWidth="1.4" />
          <ellipse cx="42" cy="28" rx="7" ry="7" fill="#7a6438" stroke={c.dark} strokeWidth="1.4" />
          <circle cx="22" cy="28" r="3.4" fill={c.accent} />
          <circle cx="42" cy="28" r="3.4" fill={c.accent} />
          <circle cx="22" cy="28" r="1.6" fill={c.dark} />
          <circle cx="42" cy="28" r="1.6" fill={c.dark} />
          <circle cx="18" cy="40" r="1.4" fill={c.dark} opacity="0.6" />
          <circle cx="30" cy="44" r="1.4" fill={c.dark} opacity="0.6" />
          <circle cx="42" cy="38" r="1.4" fill={c.dark} opacity="0.6" />
          <circle cx="36" cy="48" r="1.4" fill={c.dark} opacity="0.6" />
          <path d="M22 44 Q32 49 42 44" stroke={c.dark} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>
      );
    case "pez":
      return (
        <>
          <path d="M8 32 L22 22 L22 42 Z" fill={c.accent} stroke={c.dark} strokeWidth="1.4" />
          <ellipse cx="38" cy="32" rx="18" ry="11" fill={c.base} stroke={c.dark} strokeWidth="1.5" />
          <path d="M30 24 Q34 32 30 40" stroke={c.accent} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M40 24 Q44 32 40 40" stroke={c.accent} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <circle cx="50" cy="30" r="2.2" fill={c.light} />
          <circle cx="50" cy="30" r="1.2" fill={c.dark} />
          <path d="M50 36 q3 0 5 -2" stroke={c.dark} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </>
      );
    case "mariposa":
      return (
        <>
          <ellipse cx="32" cy="32" rx="3" ry="14" fill={c.dark} />
          <path d="M30 22 Q18 14 12 22 Q10 30 22 30 Q30 30 30 26 Z" fill={c.accent} stroke={c.dark} strokeWidth="1.4" />
          <path d="M34 22 Q46 14 52 22 Q54 30 42 30 Q34 30 34 26 Z" fill={c.accent} stroke={c.dark} strokeWidth="1.4" />
          <path d="M30 34 Q20 38 16 46 Q22 50 28 44 Q30 42 30 38 Z" fill={c.base} stroke={c.dark} strokeWidth="1.4" />
          <path d="M34 34 Q44 38 48 46 Q42 50 36 44 Q34 42 34 38 Z" fill={c.base} stroke={c.dark} strokeWidth="1.4" />
          <circle cx="20" cy="24" r="2" fill={c.light} />
          <circle cx="44" cy="24" r="2" fill={c.light} />
          <path d="M32 18 q-2 -4 -4 -4 M32 18 q2 -4 4 -4" stroke={c.dark} strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </>
      );
    case "arana":
      return (
        <>
          <ellipse cx="32" cy="36" rx="11" ry="9" fill={c.dark} />
          <circle cx="32" cy="26" r="6" fill={c.dark} />
          <path d="M21 32 L8 24 M22 36 L6 36 M22 40 L8 48 M42 32 L56 24 M42 36 L58 36 M42 40 L56 48" stroke={c.dark} strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M28 22 L26 16 M36 22 L38 16" stroke={c.dark} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="30" cy="26" r="1.4" fill={c.accent} />
          <circle cx="34" cy="26" r="1.4" fill={c.accent} />
          <ellipse cx="32" cy="36" rx="4" ry="3" fill={c.accent} opacity="0.7" />
        </>
      );
    case "mono":
      return (
        <>
          <circle cx="20" cy="24" r="7" fill={c.dark} />
          <circle cx="44" cy="24" r="7" fill={c.dark} />
          <circle cx="20" cy="24" r="3.5" fill={c.accent} />
          <circle cx="44" cy="24" r="3.5" fill={c.accent} />
          <circle cx="32" cy="34" r="16" fill={c.dark} />
          <path d="M32 24 Q20 24 18 36 Q18 46 32 46 Q46 46 46 36 Q44 24 32 24 Z" fill={c.accent} />
          <circle cx="26" cy="32" r="2" fill={c.dark} />
          <circle cx="38" cy="32" r="2" fill={c.dark} />
          <ellipse cx="32" cy="38" rx="3.5" ry="2.4" fill={c.dark} opacity="0.8" />
          <path d="M28 41 Q32 44 36 41" stroke={c.dark} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </>
      );
    case "jaguar":
      return (
        <>
          <path d="M14 22 L18 30 L22 24 Z" fill={c.accent} />
          <path d="M50 22 L46 30 L42 24 Z" fill={c.accent} />
          <circle cx="32" cy="34" r="18" fill={c.accent} />
          <circle cx="20" cy="28" r="2" fill={c.dark} opacity="0.7" />
          <circle cx="44" cy="28" r="2" fill={c.dark} opacity="0.7" />
          <circle cx="40" cy="44" r="2" fill={c.dark} opacity="0.7" />
          <circle cx="24" cy="44" r="2" fill={c.dark} opacity="0.7" />
          <circle cx="32" cy="22" r="1.8" fill={c.dark} opacity="0.7" />
          <circle cx="26" cy="34" r="2.4" fill={c.dark} />
          <circle cx="38" cy="34" r="2.4" fill={c.dark} />
          <circle cx="26" cy="34" r="0.9" fill={c.light} />
          <circle cx="38" cy="34" r="0.9" fill={c.light} />
          <path d="M32 38 l-2 3 l4 0 z" fill={c.dark} />
          <path d="M32 41 Q28 46 24 44 M32 41 Q36 46 40 44" stroke={c.dark} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M22 38 q-4 0 -6 -2 M42 38 q4 0 6 -2 M22 40 q-5 1 -7 0 M42 40 q5 1 7 0" stroke={c.dark} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </>
      );
    default:
      return null;
  }
}

// Componente imagen Ghibli con fallback al SVG
export function AnimalSymbol({ animal, type, size = 42, label }: Props) {
  const animalType = animal?.type ?? type ?? "reptil";
  const colors = COLORS[animalType];
  const content = animal ? renderAnimal(animal.id, colors) : null;

  // Si el animal tiene imagen Ghibli, mostrarla como icono recortado circular
  if (animal?.image && size >= 40) {
    return (
      <div
        aria-label={label ?? animal.nameEs}
        role="img"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          display: "inline-block",
          border: `2px solid ${colors.accent}`,
          boxShadow: `0 0 0 2px ${colors.dark}22`,
          flexShrink: 0,
        }}
      >
        <img
          src={animal.image}
          alt={animal.nameEs}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
          }}
        />
      </div>
    );
  }

  return (
    <svg
      aria-label={label ?? animal?.nameEs ?? animalType}
      role="img"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="32" r="30" fill={colors.dark} opacity="0.18" />
      <circle cx="32" cy="32" r="26" fill={colors.light} opacity="0.18" />
      {content}
    </svg>
  );
}

export function LeafIcon({ size = 20 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20 4C11 4 5 8.8 5 16.2C5 18.3 6.7 20 8.8 20C16.2 20 20 13 20 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 20C8.5 14.5 12.2 11.2 17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowIcon({ direction }: { direction: "left" | "right" | "up" }) {
  const rotation = direction === "left" ? 180 : direction === "up" ? -90 : 0;

  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transform: `rotate(${rotation}deg)` }}>
      <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChestIcon({ size = 28 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M13 27H51V49C51 52.3 48.3 55 45 55H19C15.7 55 13 52.3 13 49V27Z" fill="#8a4f23" />
      <path d="M18 19C18 13.5 22.5 9 28 9H36C41.5 9 46 13.5 46 19V27H18V19Z" fill="#b46b2e" />
      <path d="M13 27H51V36H13V27Z" fill="#d79b43" />
      <path d="M29 27H35V43H29V27Z" fill="#f3c55b" />
      <rect x="26" y="37" width="12" height="10" rx="2" fill="#2a1b11" />
      <path d="M18 27V19C18 13.5 22.5 9 28 9H36C41.5 9 46 13.5 46 19V27" stroke="#4e2b16" strokeWidth="4" />
    </svg>
  );
}
