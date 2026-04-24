import { Profanity } from "@2toad/profanity";

export const PROFANITY_LANGUAGES = [
  "ar",
  "zh",
  "en",
  "fr",
  "de",
  "hi",
  "it",
  "ja",
  "ko",
  "pt",
  "ru",
  "es",
];

export const profanity = new Profanity({
  languages: PROFANITY_LANGUAGES,
});
