import type { SupportedLanguage } from "@/types/learning";

export const languages: SupportedLanguage[] = [
  {
    id: "english",
    code: "en",
    name: "English",
    nativeName: "English",
    locale: "en-US",
    flag: "🇺🇸",
    textDirection: "ltr",
  },
  {
    id: "spanish",
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    locale: "es-ES",
    flag: "🇪🇸",
    textDirection: "ltr",
  },
  {
    id: "french",
    code: "fr",
    name: "French",
    nativeName: "Français",
    locale: "fr-FR",
    flag: "🇫🇷",
    textDirection: "ltr",
  },
  {
    id: "japanese",
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    locale: "ja-JP",
    flag: "🇯🇵",
    textDirection: "ltr",
  },
];
