import { Language } from '@/types';

// Map FishFlow language codes to standard BCP-47 locale tags
export const VOICE_LANG_MAP: Record<Language, string> = {
  en: 'en-IN', // Indian English
  hi: 'hi-IN', // Hindi
  kn: 'kn-IN', // Kannada
  ml: 'ml-IN', // Malayalam
  ta: 'ta-IN', // Tamil
  te: 'te-IN', // Telugu
  mr: 'mr-IN', // Marathi
  bn: 'bn-IN', // Bengali
  gu: 'gu-IN', // Gujarati
  kok: 'hi-IN', // Konkani (Fallback to Hindi as Konkani TTS is extremely rare)
};

// Fallback chain in case a specific regional voice is not installed
export const FALLBACK_LANG_MAP: Record<string, string[]> = {
  'hi-IN': ['hi', 'en-IN', 'en-US'],
  'kn-IN': ['kn', 'en-IN', 'en-US'],
  'ml-IN': ['ml', 'en-IN', 'en-US'],
  'ta-IN': ['ta', 'en-IN', 'en-US'],
  'te-IN': ['te', 'en-IN', 'en-US'],
  'mr-IN': ['mr', 'hi-IN', 'en-IN', 'en-US'],
  'bn-IN': ['bn', 'en-IN', 'en-US'],
  'gu-IN': ['gu', 'hi-IN', 'en-IN', 'en-US'],
  'en-IN': ['en-GB', 'en-US', 'en'],
};
