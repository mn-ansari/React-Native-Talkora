import type { LearningUnit } from "@/types/learning";

export const units: LearningUnit[] = [
  {
    id: "es-basics-1",
    languageCode: "es",
    title: "Spanish Basics",
    description: "Start a friendly conversation with greetings and introductions.",
    order: 1,
    lessonIds: ["es-greetings", "es-introductions"],
  },
  {
    id: "fr-basics-1",
    languageCode: "fr",
    title: "French Basics",
    description: "Learn simple greetings and introduce yourself in French.",
    order: 1,
    lessonIds: ["fr-greetings", "fr-introductions"],
  },
  {
    id: "ja-basics-1",
    languageCode: "ja",
    title: "Japanese Basics",
    description: "Practice polite greetings and simple introductions.",
    order: 1,
    lessonIds: ["ja-greetings", "ja-introductions"],
  },
];
