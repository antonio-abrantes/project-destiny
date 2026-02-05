import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';

export const LandscapeHint = () => {
  const [showHint, setShowHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      const isSmallScreen = window.innerWidth < 640;
      setShowHint(isPortrait && isSmallScreen && !dismissed);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [dismissed]);

  if (!showHint) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-4 left-4 right-4 z-50"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
      >
        <div className="card-mystic rounded-lg p-4 flex items-center gap-3">
          <RotateCcw className="w-8 h-8 text-primary flex-shrink-0 animate-pulse" />
          <div className="flex-1">
            <p className="text-sm font-body">
              Para uma melhor experiência, <span className="text-primary font-semibold">gire o celular</span> para o modo paisagem.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
