import type { Language, LanguageOption, FishSpecies, Harbor, FishPrice, MarketPrice, AIRecommendation, PriceChartData, Vendor } from '@/types';

// ─── Languages ────────────────────────────────────────────────────────────────
export const LANGUAGES: LanguageOption[] = [
  { code: 'en',  label: 'English',   nativeLabel: 'English',    voiceLang: 'en-IN' },
  { code: 'hi',  label: 'Hindi',     nativeLabel: 'हिंदी',       voiceLang: 'hi-IN' },
  { code: 'kn',  label: 'Kannada',   nativeLabel: 'ಕನ್ನಡ',      voiceLang: 'kn-IN' },
  { code: 'ml',  label: 'Malayalam', nativeLabel: 'മലയാളം',     voiceLang: 'ml-IN' },
  { code: 'ta',  label: 'Tamil',     nativeLabel: 'தமிழ்',       voiceLang: 'ta-IN' },
  { code: 'te',  label: 'Telugu',    nativeLabel: 'తెలుగు',      voiceLang: 'te-IN' },
  { code: 'mr',  label: 'Marathi',   nativeLabel: 'मराठी',       voiceLang: 'mr-IN' },
  { code: 'bn',  label: 'Bengali',   nativeLabel: 'বাংলা',       voiceLang: 'bn-IN' },
  { code: 'gu',  label: 'Gujarati',  nativeLabel: 'ગુજરાતી',     voiceLang: 'gu-IN' },
  { code: 'kok', label: 'Konkani',   nativeLabel: 'कोंकणी',      voiceLang: 'kok-IN' },
];

// ─── Fish Species ─────────────────────────────────────────────────────────────
export const FISH_SPECIES: FishSpecies[] = [
  { id: 'tuna',    name: 'Tuna',      nameKn: 'ಟ್ಯೂನ',   nameMl: 'ചൂര',    nameTa: 'சூரை',   category: 'premium',  avgWeight: 8.5,  icon: '🐟' },
  { id: 'sardine', name: 'Sardine',   nameKn: 'ಮತ್ತಿ',   nameMl: 'ചാള',    nameTa: 'மத்தி',  category: 'bulk',     avgWeight: 0.15, icon: '🐠' },
  { id: 'mackerel',name: 'Mackerel',  nameKn: 'ಬಂಗಡೆ',  nameMl: 'അയല',   nameTa: 'அயல',   category: 'standard', avgWeight: 0.4,  icon: '🐡' },
  { id: 'pomfret', name: 'Pomfret',   nameKn: 'ಅವೊಲಿ',  nameMl: 'ആവോലി',  nameTa: 'வாவல்',  category: 'premium',  avgWeight: 0.6,  icon: '🐟' },
  { id: 'seer',    name: 'Seer Fish', nameKn: 'ಇಸ್ವಾನ್', nameMl: 'ഐസ്',   nameTa: 'வஞ்சரம்',category: 'premium',  avgWeight: 3.5,  icon: '🦈' },
  { id: 'anchovy', name: 'Anchovy',   nameKn: 'ಕೊಳ್ಳಿ',  nameMl: 'നത്തോലി',nameTa: 'நெத்திலி',category: 'bulk',   avgWeight: 0.05, icon: '🐟' },
  { id: 'prawn',   name: 'Prawn',     nameKn: 'ಸೀಗಡಿ',  nameMl: 'ചെമ്മീൻ',nameTa: 'இறால்', category: 'premium',  avgWeight: 0.05, icon: '🦐' },
];

// ─── Harbors ──────────────────────────────────────────────────────────────────
export const HARBORS: Harbor[] = [
  {
    id: 'h1', name: 'Mangalore Central Harbor', nameKn: 'ಮಂಗಳೂರು ಕೇಂದ್ರ ಬಂದರು',
    location: { lat: 12.8698, lng: 74.8421 },
    congestion: 'LOW', activeVendors: 23, supplyLevel: 'MEDIUM', isRecommended: true, zone: 'Zone A',
  },
  {
    id: 'h2', name: 'Bunder Fish Market', nameKn: 'ಬಂದರ್ ಮೀನು ಮಾರುಕಟ್ಟೆ',
    location: { lat: 12.8654, lng: 74.8366 },
    congestion: 'HIGH', activeVendors: 45, supplyLevel: 'HIGH', isRecommended: false, zone: 'Zone B',
  },
  {
    id: 'h3', name: 'Ullal Harbor', nameKn: 'ಉಳ್ಳಾಲ ಬಂದರು',
    location: { lat: 12.8023, lng: 74.8608 },
    congestion: 'MEDIUM', activeVendors: 18, supplyLevel: 'LOW', isRecommended: false, zone: 'Zone C',
  },
  {
    id: 'h4', name: 'Malpe Harbor', nameKn: 'ಮಾಲ್ಪೆ ಬಂದರು',
    location: { lat: 13.3528, lng: 74.7069 },
    congestion: 'LOW', activeVendors: 12, supplyLevel: 'LOW', isRecommended: false, zone: 'Zone D',
  },
];

// ─── Mock Market Prices ───────────────────────────────────────────────────────
export const MOCK_PRICES: FishPrice[] = [
  { id: 'p1', species: 'Tuna',      harborId: 'h1', price: 260, previousPrice: 240, demand: 'HIGH',   supply: 'LOW',    trend: 'up',   vendorId: 'v1', trustScore: 92, updatedAt: new Date(), isVerified: true },
  { id: 'p2', species: 'Sardine',   harborId: 'h1', price: 95,  previousPrice: 100, demand: 'MEDIUM', supply: 'HIGH',   trend: 'down', vendorId: 'v2', trustScore: 88, updatedAt: new Date(), isVerified: true },
  { id: 'p3', species: 'Mackerel',  harborId: 'h1', price: 140, previousPrice: 135, demand: 'HIGH',   supply: 'MEDIUM', trend: 'up',   vendorId: 'v3', trustScore: 95, updatedAt: new Date(), isVerified: true },
  { id: 'p4', species: 'Pomfret',   harborId: 'h1', price: 480, previousPrice: 490, demand: 'HIGH',   supply: 'LOW',    trend: 'down', vendorId: 'v1', trustScore: 92, updatedAt: new Date(), isVerified: true },
  { id: 'p5', species: 'Seer Fish', harborId: 'h1', price: 650, previousPrice: 620, demand: 'HIGH',   supply: 'LOW',    trend: 'up',   vendorId: 'v4', trustScore: 97, updatedAt: new Date(), isVerified: true },
  { id: 'p6', species: 'Prawn',     harborId: 'h1', price: 380, previousPrice: 360, demand: 'HIGH',   supply: 'LOW',    trend: 'up',   vendorId: 'v5', trustScore: 90, updatedAt: new Date(), isVerified: true },
  { id: 'p7', species: 'Anchovy',   harborId: 'h2', price: 45,  previousPrice: 48,  demand: 'LOW',    supply: 'HIGH',   trend: 'down', vendorId: 'v6', trustScore: 80, updatedAt: new Date(), isVerified: false },
];

export const MOCK_MARKET_PRICES: MarketPrice[] = [
  { species: 'Tuna',      consensusPrice: 260, minPrice: 240, maxPrice: 280, demand: 'HIGH',   volatility: 0.12, trend: 'up',   updatedAt: new Date() },
  { species: 'Sardine',   consensusPrice: 95,  minPrice: 85,  maxPrice: 105, demand: 'MEDIUM', volatility: 0.08, trend: 'down', updatedAt: new Date() },
  { species: 'Mackerel',  consensusPrice: 140, minPrice: 130, maxPrice: 155, demand: 'HIGH',   volatility: 0.10, trend: 'up',   updatedAt: new Date() },
  { species: 'Pomfret',   consensusPrice: 480, minPrice: 450, maxPrice: 510, demand: 'HIGH',   volatility: 0.15, trend: 'down', updatedAt: new Date() },
  { species: 'Seer Fish', consensusPrice: 650, minPrice: 600, maxPrice: 700, demand: 'HIGH',   volatility: 0.18, trend: 'up',   updatedAt: new Date() },
  { species: 'Prawn',     consensusPrice: 380, minPrice: 350, maxPrice: 420, demand: 'HIGH',   volatility: 0.20, trend: 'up',   updatedAt: new Date() },
  { species: 'Anchovy',   consensusPrice: 45,  minPrice: 40,  maxPrice: 55,  demand: 'LOW',    volatility: 0.06, trend: 'down', updatedAt: new Date() },
];

// ─── Mock AI Recommendation ───────────────────────────────────────────────────
export const MOCK_RECOMMENDATION: AIRecommendation = {
  id: 'rec1',
  userId: 'user1',
  species: 'Tuna',
  harbor: HARBORS[0],
  expectedPrice: 260,
  confidence: 92,
  demand: 'HIGH',
  riskLevel: 'LOW',
  reasoning: 'High demand, low congestion, trusted vendors present.',
  alternativeHarbors: [HARBORS[2]],
  congestionLevel: 'LOW',
  transportFeasible: true,
  smsTriggered: true,
  timestamp: new Date(),
};

// ─── Price Chart Data ─────────────────────────────────────────────────────────
export const PRICE_CHART_DATA: PriceChartData[] = [
  { time: '6AM',  tuna: 230, sardine: 100, mackerel: 130, pomfret: 460 },
  { time: '8AM',  tuna: 240, sardine: 98,  mackerel: 132, pomfret: 465 },
  { time: '10AM', tuna: 248, sardine: 96,  mackerel: 136, pomfret: 470 },
  { time: '12PM', tuna: 255, sardine: 95,  mackerel: 138, pomfret: 475 },
  { time: '2PM',  tuna: 258, sardine: 95,  mackerel: 140, pomfret: 478 },
  { time: '4PM',  tuna: 260, sardine: 94,  mackerel: 141, pomfret: 480 },
  { time: 'Now',  tuna: 262, sardine: 95,  mackerel: 142, pomfret: 482 },
];

// ─── Mock Vendors ─────────────────────────────────────────────────────────────
export const MOCK_VENDORS: Vendor[] = [
  { id: 'v1', name: 'Rajan Traders',      harborId: 'h1', trustScore: 97, rewardPoints: 4520, badges: ['verified', 'top-seller', 'trusted'], priceUpdatesCount: 245, rank: 1 },
  { id: 'v2', name: 'Coastal Fish Depot', harborId: 'h1', trustScore: 94, rewardPoints: 3880, badges: ['verified', 'trusted'],              priceUpdatesCount: 198, rank: 2 },
  { id: 'v3', name: 'Mangalore Marine',   harborId: 'h1', trustScore: 91, rewardPoints: 3210, badges: ['verified'],                          priceUpdatesCount: 167, rank: 3 },
  { id: 'v4', name: 'Sealord Exports',    harborId: 'h2', trustScore: 88, rewardPoints: 2650, badges: ['verified', 'new'],                   priceUpdatesCount: 132, rank: 4 },
  { id: 'v5', name: 'Ullal Sea Foods',    harborId: 'h3', trustScore: 85, rewardPoints: 2100, badges: ['new'],                               priceUpdatesCount: 89,  rank: 5 },
];

// ─── SMS Templates ────────────────────────────────────────────────────────────
export const SMS_TEMPLATES: Record<Language, (species: string, harbor: string, price: number, demand: string) => string> = {
  en:  (s, h, p, d) => `FishFlow AI:\nBest Option:\nSell ${s} at ${h}\nExpected Price ₹${p}/kg\nDemand ${d}`,
  hi:  (s, h, p, d) => `FishFlow AI:\nसर्वोत्तम विकल्प:\n${s} को ${h} में बेचें\nअपेक्षित मूल्य ₹${p}/किग्रा\nमांग ${d}`,
  kn:  (s, h, p, d) => `FishFlow AI:\nಉತ್ತಮ ಆಯ್ಕೆ:\n${s} ಅನ್ನು ${h} ನಲ್ಲಿ ಮಾರಿರಿ\nನಿರೀಕ್ಷಿತ ಬೆಲೆ ₹${p}/ಕೆಜಿ\nಬೇಡಿಕೆ ${d}`,
  ml:  (s, h, p, d) => `FishFlow AI:\nമികച്ച ഓപ്ഷൻ:\n${s} ${h} ൽ വിൽക്കുക\nപ്രതീക്ഷിത വില ₹${p}/കി.ഗ്രാ\nഡിമാൻഡ് ${d}`,
  ta:  (s, h, p, d) => `FishFlow AI:\nசிறந்த விருப்பம்:\n${s} ${h} இல் விற்கவும்\nஎதிர்பார்க்கப்படும் விலை ₹${p}/கி.கி\nதேவை ${d}`,
  te:  (s, h, p, d) => `FishFlow AI:\nఉత్తమ ఎంపిక:\n${s}ని ${h}లో అమ్మండి\nఆశించిన ధర ₹${p}/కి.గ్రా\nడిమాండ్ ${d}`,
  mr:  (s, h, p, d) => `FishFlow AI:\nसर्वोत्तम पर्याय:\n${s} ${h} येथे विका\nअपेक्षित किंमत ₹${p}/किलो\nमागणी ${d}`,
  bn:  (s, h, p, d) => `FishFlow AI:\nসেরা বিকল্প:\n${s} ${h} এ বিক্রি করুন\nপ্রত্যাশিত মূল্য ₹${p}/কেজি\nচাহিদা ${d}`,
  gu:  (s, h, p, d) => `FishFlow AI:\nશ્રેષ્ઠ વિકલ્પ:\n${s} ${h} ખાતે વેચો\nઅપેક્ષિત ભાવ ₹${p}/કિ.ગ્રા\nમાંગ ${d}`,
  kok: (s, h, p, d) => `FishFlow AI:\nसर्वोत्तम पर्याय:\n${s} ${h} हांगा विको\nअपेक्षित किंमत ₹${p}/कि.ग्रा\nमागणी ${d}`,
} as Record<Language, (s: string, h: string, p: number, d: string) => string>;

// ─── Chatbot FAQ ──────────────────────────────────────────────────────────────
export const CHATBOT_FAQ = [
  'Where should I sell Tuna today?',
  'What is the best price for Sardine?',
  'Which harbor has low congestion?',
  'What is my auction status?',
  'When is the next auction?',
  'Is Pomfret demand high today?',
];
