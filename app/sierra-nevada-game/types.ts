export type AnimalType =
  | "reptil"
  | "ave"
  | "anfibio"
  | "pez"
  | "insecto"
  | "mamifero";

export type Animal = {
  id: string;
  nameEs: string;
  nameArh: string;
  type: AnimalType;
  desc: string;
  image?: string;
  audio?: string;
};

export type MultipleQuizQuestion = {
  type: "multiple";
  prompt: string;
  subject: Animal;
  options: string[];
  answer: string;
  success: string;
};

export type WriteQuizQuestion = {
  type: "write";
  prompt: string;
  subject: Animal;
  answer: string;
  success: string;
};

export type WordSearchQuestion = {
  type: "wordsearch";
  prompt: string;
  subject: Animal;
  grid: string[][];
  answer: string;          // the word to find
  wordCoords: [number, number][];
  success: string;
};

export type OrderQuestion = {
  type: "order";
  prompt: string;
  subject: Animal;
  answer: string;          // correct word
  shuffled: string[];      // pre-shuffled letters
  success: string;
};

export type MatchQuestion = {
  type: "match";
  prompt: string;
  pairs: { iku: string; es: string; subjectId: string }[];
  success: string;
};

export type ImagePickQuestion = {
  type: "image_pick";
  prompt: string;
  options: Animal[];       // 4 animals with images
  answer: string;          // correct animal id
  success: string;
};

export type TrueFalseQuestion = {
  type: "truefalse";
  prompt: string;
  subject: Animal;
  statement: string;
  answer: boolean;
  success: string;
};

export type QuizQuestion =
  | MultipleQuizQuestion
  | WriteQuizQuestion
  | WordSearchQuestion
  | OrderQuestion
  | MatchQuestion
  | ImagePickQuestion
  | TrueFalseQuestion;

export type SavedSession = {
  level: number;
  score: number;
  bestScore: number;
  learnedAnimalIds: string[];
  updatedAt: string;
};
