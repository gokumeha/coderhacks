// ─── Fish Types ───────────────────────────────────────────────────────────────
export interface FishSpecies {
  id: string;
  name: string;
  nameKn: string;  // Kannada
  nameMl: string;  // Malayalam
  nameTa: string;  // Tamil
  category: 'premium' | 'standard' | 'bulk';
  avgWeight: number; // kg
  icon: string;
}

export interface FishScan {
  id: string;
  userId: string;
  species: string;
  freshness: 'excellent' | 'good' | 'average' | 'poor';
  grade: 'A+' | 'A' | 'B' | 'C';
  estimatedWeight: number;
  confidence: number;
  imageUrl?: string;
  timestamp: Date;
  recommendation?: AIRecommendation;
  error?: string;
  requiresConfirmation?: boolean;
  topPredictions?: string[];
}

// ─── Pricing Types ────────────────────────────────────────────────────────────
export interface FishPrice {
  id: string;
  species: string;
  harborId: string;
  price: number;           // per kg in INR
  previousPrice: number;
  demand: 'HIGH' | 'MEDIUM' | 'LOW';
  supply: 'HIGH' | 'MEDIUM' | 'LOW';
  trend: 'up' | 'down' | 'stable';
  vendorId: string;
  trustScore: number;
  updatedAt: Date;
  isVerified: boolean;
}

export interface MarketPrice {
  species: string;
  consensusPrice: number;
  minPrice: number;
  maxPrice: number;
  demand: 'HIGH' | 'MEDIUM' | 'LOW';
  volatility: number;
  trend: 'up' | 'down' | 'stable';
  updatedAt: Date;
}

// ─── AI Types ─────────────────────────────────────────────────────────────────
export interface AIRecommendation {
  id: string;
  userId: string;
  species: string;
  harbor: Harbor;
  expectedPrice: number;
  confidence: number;
  demand: 'HIGH' | 'MEDIUM' | 'LOW';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reasoning: string;
  alternativeHarbors: Harbor[];
  congestionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  transportFeasible: boolean;
  smsTriggered: boolean;
  timestamp: Date;
}

// ─── Harbor Types ─────────────────────────────────────────────────────────────
export interface Harbor {
  id: string;
  name: string;
  nameKn: string;
  location: { lat: number; lng: number };
  congestion: 'LOW' | 'MEDIUM' | 'HIGH';
  activeVendors: number;
  supplyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  isRecommended: boolean;
  zone: string;
}

// ─── User Types ───────────────────────────────────────────────────────────────
export type UserRole = 'fisherman' | 'vendor' | 'buyer' | 'admin';

export interface User {
  uid: string;
  email?: string;
  phone?: string;
  displayName: string;
  role: UserRole;
  language: Language;
  harbor?: string;
  trustScore?: number;
  rewardPoints?: number;
  badges?: string[];
  createdAt: Date;
}

// ─── Auction Types ────────────────────────────────────────────────────────────
export interface AuctionListing {
  id: string;
  species: string;
  weight: number;
  grade: string;
  grade_certified: boolean;
  startPrice: number;
  currentBid: number;
  highestBidderId?: string;
  endsAt: Date;
  sellerId: string;
  status: 'active' | 'ended' | 'cancelled';
  imageUrl?: string;
}

// ─── Language Types ───────────────────────────────────────────────────────────
export type Language =
  | 'en' | 'hi' | 'kn' | 'ml' | 'ta' | 'te' | 'mr' | 'bn' | 'gu' | 'kok';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  voiceLang: string;
}

// ─── Vendor Types ─────────────────────────────────────────────────────────────
export interface Vendor {
  id: string;
  name: string;
  harborId: string;
  trustScore: number;
  rewardPoints: number;
  badges: ('verified' | 'top-seller' | 'trusted' | 'new')[];
  priceUpdatesCount: number;
  rank: number;
}

// ─── SMS Types ────────────────────────────────────────────────────────────────
export interface SMSNotification {
  id: string;
  to: string;
  message: string;
  language: Language;
  status: 'sent' | 'pending' | 'failed';
  timestamp: Date;
  type: 'recommendation' | 'auction' | 'alert';
}

// ─── Chart Types ──────────────────────────────────────────────────────────────
export interface PriceChartData {
  time: string;
  tuna: number;
  sardine: number;
  mackerel: number;
  pomfret: number;
}
