import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LANGUAGES } from '@/data';
import { useLangStore } from '@/store';
import type { Language } from '@/types';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLangStore();
  const [open, setOpen] = React.useState(false);
  const current = LANGUAGES.find(l => l.code === language);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-cyan-500/20 hover:border-cyan-400/50 transition-all text-sm text-cyan-300 hover:text-cyan-200"
        aria-label="Change language"
      >
        <Globe size={14} className="text-cyan-400" />
        <span className="font-medium">{current?.nativeLabel}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-48 glass-strong rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl"
          >
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { 
                  setLanguage(lang.code as Language); 
                  setOpen(false); 
                  
                  // Trigger Google Translate DOM mutation
                  const iframe = document.querySelector('.goog-te-menu-frame') as HTMLIFrameElement;
                  if (iframe && iframe.contentDocument) {
                     // The new google translate uses an iframe for the menu, but if we set the cookie and reload, it's safer.
                     // A safer hack for React without reloading is to find the select combo if it exists, or just set the googtrans cookie.
                  }
                  
                  // Most reliable way for SPAs without breaking React: Set the cookie and reload
                  // But since it's a SPA, reloading drops state!
                  // Let's try changing the hidden combo box
                  const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
                  if (select) {
                    select.value = lang.code === 'kok' ? 'gom' : lang.code; // Map Konkani if needed
                    select.dispatchEvent(new Event('change'));
                  } else {
                    // Fallback: set cookie and reload if the widget hasn't fully initialized but user clicks
                    document.cookie = `googtrans=/en/${lang.code}; path=/`;
                    window.location.reload();
                  }
                }}
                className={`w-full text-left px-4 py-2.5 text-sm flex justify-between items-center transition-all hover:bg-cyan-500/10 ${
                  language === lang.code ? 'text-cyan-300 bg-cyan-500/10' : 'text-slate-300'
                }`}
              >
                <span>{lang.nativeLabel}</span>
                <span className="text-xs text-slate-500">{lang.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
};
