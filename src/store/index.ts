import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebase/config';
import type { User, Language, AIRecommendation, FishScan, AuctionListing } from '@/types';
import { MOCK_RECOMMENDATION } from '@/data';

// ─── Auth Store ───────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        try {
          signOut(auth);
        } catch (e) {
          console.error('Firebase signOut failed', e);
        }
        set({ user: null });
      },
    }),
    { name: 'fishflow-auth' }
  )
);

// ─── Language Store ───────────────────────────────────────────────────────────
interface LangState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'fishflow-lang' }
  )
);

// ─── Recommendation Store ─────────────────────────────────────────────────────
interface RecommendationState {
  current: AIRecommendation | null;
  history: AIRecommendation[];
  isAnalyzing: boolean;
  setRecommendation: (rec: AIRecommendation) => void;
  setAnalyzing: (v: boolean) => void;
  loadMock: () => void;
}

export const useRecommendationStore = create<RecommendationState>((set) => ({
  current: null,
  history: [],
  isAnalyzing: false,
  setRecommendation: (rec) =>
    set((s) => ({ current: rec, history: [rec, ...s.history].slice(0, 20) })),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  loadMock: () => set({ current: MOCK_RECOMMENDATION }),
}));

// ─── Scanner Store ────────────────────────────────────────────────────────────
interface ScanState {
  scans: FishScan[];
  currentScan: FishScan | null;
  scanStage: 'idle' | 'qr' | 'scanning' | 'analyzing' | 'complete';
  addScan: (scan: FishScan) => void;
  setScanStage: (stage: ScanState['scanStage']) => void;
  setCurrentScan: (scan: FishScan | null) => void;
  reset: () => void;
}

export const useScanStore = create<ScanState>((set) => ({
  scans: [],
  currentScan: null,
  scanStage: 'idle',
  addScan: (scan) => set((s) => ({ scans: [scan, ...s.scans] })),
  setScanStage: (scanStage) => set({ scanStage }),
  setCurrentScan: (currentScan) => set({ currentScan }),
  reset: () => set({ scanStage: 'idle', currentScan: null }),
}));

// ─── UI Store ─────────────────────────────────────────────────────────────────
interface UIState {
  chatbotOpen: boolean;
  sidebarOpen: boolean;
  toggleChatbot: () => void;
  setChatbotOpen: (v: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  chatbotOpen: false,
  sidebarOpen: false,
  toggleChatbot: () => set((s) => ({ chatbotOpen: !s.chatbotOpen })),
  setChatbotOpen: (chatbotOpen) => set({ chatbotOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));

// ─── Auction Store ────────────────────────────────────────────────────────────
interface AuctionState {
  auctions: AuctionListing[];
  setAuctions: (auctions: AuctionListing[]) => void;
  addAuction: (auction: AuctionListing) => void;
  updateBid: (id: string, currentBid: number) => void;
}

const INITIAL_AUCTIONS: AuctionListing[] = [
  { id: 'a1', species: 'Pomfret',   weight: 12.5, grade: 'A+', grade_certified: true,  startPrice: 480, currentBid: 520, endsAt: new Date(Date.now() + 18 * 60000), sellerId: 's1', status: 'active', imageUrl: '' },
  { id: 'a2', species: 'Seer Fish', weight: 8.0,  grade: 'A',  grade_certified: true,  startPrice: 620, currentBid: 680, endsAt: new Date(Date.now() + 35 * 60000), sellerId: 's2', status: 'active' },
  { id: 'a3', species: 'Tuna',      weight: 25.0, grade: 'A+', grade_certified: true,  startPrice: 250, currentBid: 285, endsAt: new Date(Date.now() + 52 * 60000), sellerId: 's3', status: 'active' },
  { id: 'a4', species: 'Prawn',     weight: 5.0,  grade: 'A',  grade_certified: false, startPrice: 360, currentBid: 360, endsAt: new Date(Date.now() + 8  * 60000), sellerId: 's4', status: 'active' },
];

export const useAuctionStore = create<AuctionState>()(
  persist(
    (set) => ({
      auctions: INITIAL_AUCTIONS,
      setAuctions: (auctions) => set({ auctions }),
      addAuction: (auction) => set((s) => ({ auctions: [auction, ...s.auctions] })),
      updateBid: (id, currentBid) => set((s) => ({
        auctions: s.auctions.map(a => a.id === id ? { ...a, currentBid } : a)
      })),
    }),
    {
      name: 'fishflow-auctions',
      // Need to re-hydrate the Date objects since localStorage serializes them as strings
      deserialize: (state) => {
        const parsed = JSON.parse(state);
        if (parsed?.state?.auctions) {
          parsed.state.auctions = parsed.state.auctions.map((a: any) => ({
            ...a,
            endsAt: new Date(a.endsAt)
          }));
        }
        return parsed;
      }
    }
  )
);

// ─── Market Store ────────────────────────────────────────────────────────────
export interface VendorPriceUpdate {
  id: string;
  species: string;
  price: number;
  vendorId: string;
  vendorName: string;
  timestamp: number;
}

interface MarketState {
  vendorPrices: VendorPriceUpdate[];
  congestion: Record<string, 'LOW' | 'MEDIUM' | 'HIGH'>;
  addVendorPrice: (update: VendorPriceUpdate) => void;
  updateCongestion: (harborId: string, level: 'LOW' | 'MEDIUM' | 'HIGH') => void;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set) => ({
      vendorPrices: [],
      congestion: {
        'h1': 'LOW',    // Mangalore Central
        'h2': 'HIGH',   // Malpe Harbor
        'h3': 'MEDIUM', // Karwar Port
        'h4': 'LOW'     // Honnavar
      },
      addVendorPrice: (update) => set((s) => ({
        vendorPrices: [update, ...s.vendorPrices]
      })),
      updateCongestion: (harborId, level) => set((s) => ({
        congestion: { ...s.congestion, [harborId]: level }
      }))
    }),
    { name: 'fishflow-market' }
  )
);
