import { Language } from '@/types';
import { voiceSelector } from './voiceSelector';
import { speechQueue } from './speechQueue';

export type SpeechTemplate = 
  | 'WELCOME_MESSAGE' 
  | 'SCAN_IN_PROGRESS' 
  | 'ANALYSIS_COMPLETE' 
  | 'THANK_YOU_MESSAGE';

export const speechService = {
  /**
   * Speak a raw text string
   */
  async speak(text: string, lang: Language = 'en', rate = 0.95, pitch = 1): Promise<void> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.error('[SpeechService] Web Speech API not supported in this browser.');
      return;
    }

    // Initialize only upon request to avoid startup crashes
    voiceSelector.init();

    // Await voice loading (critical for first page load on Chrome/Safari)
    await voiceSelector.waitForVoices();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1.0;

    // Resolve Best Voice (includes fallback logic)
    const voice = voiceSelector.getBestVoice(lang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    console.log(`[SpeechService] Speaking (${utterance.lang || lang}): "${text}"`);

    // Queue and play
    return speechQueue.play(utterance);
  },

  /**
   * Stop any currently playing speech immediately
   */
  stop() {
    speechQueue.cancelCurrent();
  },

  /**
   * Get dynamic text for various scanner stages based on language
   */
  getTemplateText(template: SpeechTemplate, lang: Language, name = 'User'): string {
    const templates: Record<SpeechTemplate, Record<Language, string>> = {
      WELCOME_MESSAGE: {
        en: `Hello ${name}. Welcome to FishFlow AI.`,
        hi: `नमस्ते ${name}। FishFlow AI में आपका स्वागत है।`,
        kn: `ನಮಸ್ಕಾರ ${name}. FishFlow AI ಗೆ ಸ್ವಾಗತ.`,
        ml: `ഹലോ ${name}. FishFlow AI ലേക്ക് സ്വാഗതം.`,
        ta: `வணக்கம் ${name}. FishFlow AI இல் வரவேற்கிறோம்.`,
        te: `హలో ${name}. FishFlow AI కి స్వాగతం.`,
        mr: `नमस्कार ${name}. FishFlow AI मध्ये स्वागत आहे.`,
        bn: `হ্যালো ${name}. FishFlow AI তে স্বাগতম।`,
        gu: `નમસ્તે ${name}. FishFlow AI માં આપનું स्वागत છે.`,
        kok: `नमस्कार ${name}. FishFlow AI त स्वागत.`,
      },
      SCAN_IN_PROGRESS: {
        en: 'Fish scanning in progress. Please wait.',
        hi: 'मछली स्कैनिंग जारी है। कृपया प्रतीक्षा करें।',
        kn: 'ಮೀನು ಸ್ಕ್ಯಾನಿಂಗ್ ನಡೆಯುತ್ತಿದೆ.',
        ml: 'മത്സ്യ സ്കാനിംഗ് നടക്കുന്നു.',
        ta: 'மீன் ஸ்கேன் நடக்கிறது.',
        te: 'చేప స్కానింగ్ జరుగుతోంది.',
        mr: 'मासे स्कॅनिंग सुरू आहे.',
        bn: 'মাছ স্ক্যানিং চলছে।',
        gu: 'માછલી સ્કેનિંગ ચાલી રહ્યું છે.',
        kok: 'माशां स्कॅनिंग चालू आसा.',
      },
      ANALYSIS_COMPLETE: {
        en: 'Analysis completed.',
        hi: 'विश्लेषण पूर्ण।',
        kn: 'ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣ.',
        ml: 'വിശകലനം പൂർത്തി.',
        ta: 'பகுப்பாய்வு முடிந்தது.',
        te: 'విశ్లేషణ పూర్తయింది.',
        mr: 'विश्लेषण पूर्ण.',
        bn: 'বিশ্লেষণ সম্পন্ন।',
        gu: 'વિશ્લેષણ સંપૂર્ણ.',
        kok: 'विश्लेषण पूर्ण.',
      },
      THANK_YOU_MESSAGE: {
        en: 'Thank you for using FishFlow AI.',
        hi: 'FishFlow AI का उपयोग करने के लिए धन्यवाद।',
        kn: 'FishFlow AI ಬಳಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು.',
        ml: 'FishFlow AI ഉപയോഗിച്ചതിന് നന്ദി.',
        ta: 'FishFlow AI பயன்படுத்தியதற்கு நன்றி.',
        te: 'FishFlow AI ఉపయోగించినందుకు ధన్యవాదాలు.',
        mr: 'FishFlow AI वापरल्याबद्दल धन्यवाद.',
        bn: 'FishFlow AI ব্যবহার করার জন্য ধন্যবাদ।',
        gu: 'FishFlow AI નો ઉપયોગ કરવા બદલ આભાર.',
        kok: 'FishFlow AI वापरपाखातीर देव बरीं करूं.',
      }
    };
    
    return templates[template][lang] || templates[template]['en'];
  },

  /**
   * Get dynamic recommendation text
   */
  getRecommendationText(species: string, harbor: string, price: number, demand: string, risk: string, lang: Language): string {
    const demandStr = demand.toLowerCase();
    const riskStr = risk.toLowerCase();
    
    const texts: Record<Language, string> = {
      en:  `Best option is to sell ${species} at ${harbor}. Expected price is ${price} rupees per kilogram. Demand is ${demandStr}, and risk is ${riskStr}.`,
      hi:  `सबसे अच्छा विकल्प है ${species} को ${harbor} में बेचना। अपेक्षित मूल्य ${price} रुपए प्रति किलोग्राम है। मांग ${demandStr} है, और जोखिम ${riskStr} है।`,
      kn:  `ಉತ್ತಮ ಆಯ್ಕೆ ${species} ಅನ್ನು ${harbor} ನಲ್ಲಿ ಮಾರಾಟ ಮಾಡುವುದು. ನಿರೀಕ್ಷಿತ ಬೆಲೆ ${price} ರೂಪಾಯಿ. ಬೇಡಿಕೆ ${demandStr} ಇದೆ, ಅಪಾಯ ${riskStr} ಇದೆ.`,
      ml:  `${species} ${harbor} ൽ വിൽക്കുക. പ്രതീക്ഷിത വില ${price} രൂപ. ഡിമാൻഡ് ${demandStr}, റിസ്ക് ${riskStr}.`,
      ta:  `${species} ஐ ${harbor} இல் விற்கவும். எதிர்பார்க்கப்படும் விலை ${price} ரூபாய். தேவை ${demandStr}, ஆபத்து ${riskStr}.`,
      te:  `${species}ని ${harbor}లో అమ్మడం ఉత్తమ. ఆశించిన ధర ${price} రూపాయలు. డిమాండ్ ${demandStr}, రిస్క్ ${riskStr}.`,
      mr:  `${species} ${harbor} येथे विकण्याचा सर्वोत्तम पर्याय आहे. अपेक्षित किंमत ${price} रुपये. मागणी ${demandStr}, आणि जोखीम ${riskStr} आहे.`,
      bn:  `${species} ${harbor} এ বিক্রি করুন। প্রত্যাশিত মূল্য ${price} টাকা। চাহিদা ${demandStr}, ঝুঁকি ${riskStr}।`,
      gu:  `${species} ${harbor} ખાતે વેચવું શ્રેષ્ઠ. અપેક્ષિત ભાવ ${price} રૂપિયા. માંગ ${demandStr}, જોખમ ${riskStr}.`,
      kok: `${species} ${harbor} हांगा विकपाचो सर्वोत्तम पर्याय. अपेक्षित किंमत ${price} रुपया. मागणी ${demandStr}, जोखीम ${riskStr}.`,
    };
    return texts[lang] || texts['en'];
  }
};
