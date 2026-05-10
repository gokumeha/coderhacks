import { VOICE_LANG_MAP, FALLBACK_LANG_MAP } from './languageVoices';
import { Language } from '@/types';

class VoiceSelector {
  private voices: SpeechSynthesisVoice[] = [];
  private isLoaded = false;

  constructor() {
    // DO NOT initialize on construction to prevent startup crashes.
    // Initialization is deferred until the first actual speech request.
  }

  public init() {
    if (this.isLoaded) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Load initial voices immediately if available
    this.loadVoices();

    // Chrome/Safari load voices asynchronously
    window.speechSynthesis.onvoiceschanged = () => {
      this.loadVoices();
    };
  }

  private loadVoices() {
    const loadedVoices = window.speechSynthesis.getVoices();
    if (loadedVoices.length > 0) {
      this.voices = loadedVoices;
      this.isLoaded = true;
      console.log(`[VoiceSelector] Loaded ${this.voices.length} voices.`);
    }
  }

  public async waitForVoices(): Promise<void> {
    if (this.isLoaded && this.voices.length > 0) return;
    
    // Fallback if the browser takes too long (e.g., 2 seconds max wait)
    return new Promise((resolve) => {
      let attempts = 0;
      const interval = setInterval(() => {
        if (this.isLoaded || attempts > 20) {
          clearInterval(interval);
          resolve();
        }
        attempts++;
      }, 100);
    });
  }

  public getBestVoice(lang: Language): SpeechSynthesisVoice | null {
    if (!this.voices.length) this.loadVoices();
    if (!this.voices.length) return null;

    const targetLocale = VOICE_LANG_MAP[lang] || 'en-US';
    
    // 1. Try exact match (e.g. 'hi-IN')
    let match = this.voices.find(v => v.lang === targetLocale || v.lang.replace('_', '-') === targetLocale);
    if (match) return match;

    // 2. Try language base match (e.g. 'hi')
    const baseLang = targetLocale.split('-')[0];
    match = this.voices.find(v => v.lang.startsWith(baseLang));
    if (match) return match;

    // 3. Try Fallback Chain
    const fallbacks = FALLBACK_LANG_MAP[targetLocale] || [];
    for (const fallback of fallbacks) {
      match = this.voices.find(v => v.lang.startsWith(fallback));
      if (match) return match;
    }

    // 4. Ultimate Fallback: Browser Default Voice
    console.warn(`[VoiceSelector] No regional voice found for ${lang}. Falling back to default.`);
    return this.voices.find(v => v.default) || this.voices[0] || null;
  }
}

export const voiceSelector = new VoiceSelector();
