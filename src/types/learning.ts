export type LanguageCode = "en" | "es" | "fr" | "ja";

export type TextDirection = "ltr" | "rtl";

export type LearningLevel = "beginner";

export interface SupportedLanguage {
  id: string;
  code: LanguageCode;
  name: string;
  nativeName: string;
  locale: string;
  flag: string;
  textDirection: TextDirection;
}

export interface LearningUnit {
  id: string;
  languageCode: LanguageCode;
  title: string;
  description: string;
  order: number;
  lessonIds: string[];
}

export interface LessonGoal {
  id: string;
  description: string;
}

export interface VocabularyItem {
  id: string;
  term: string;
  translation: string;
  pronunciation?: string;
  partOfSpeech?:
    | "noun"
    | "pronoun"
    | "verb"
    | "adjective"
    | "adverb"
    | "phrase";
}

export interface Phrase {
  id: string;
  text: string;
  translation: string;
  pronunciation?: string;
}

interface ActivityBase {
  id: string;
  instruction: string;
}

export interface MultipleChoiceActivity extends ActivityBase {
  type: "multiple-choice";
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface TranslationActivity extends ActivityBase {
  type: "translation";
  prompt: string;
  acceptedAnswers: string[];
}

export interface SpeakingActivity extends ActivityBase {
  type: "speaking";
  phrase: string;
  translation: string;
}

export interface ListeningActivity extends ActivityBase {
  type: "listening";
  script: string;
  options: string[];
  correctAnswer: string;
}

export type LessonActivity =
  | MultipleChoiceActivity
  | TranslationActivity
  | SpeakingActivity
  | ListeningActivity;

export interface AITeacherPrompt {
  systemPrompt: string;
  openingLine: string;
  practicePrompts: string[];
}

export interface Lesson {
  id: string;
  unitId: string;
  languageCode: LanguageCode;
  level: LearningLevel;
  title: string;
  description: string;
  order: number;
  xp: number;
  goals: LessonGoal[];
  vocabulary: VocabularyItem[];
  phrases: Phrase[];
  activities: LessonActivity[];
  aiTeacher: AITeacherPrompt;
}
