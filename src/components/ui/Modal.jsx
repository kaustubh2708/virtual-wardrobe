import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

export default function Modal({ open, onClose, title, children }) {
  const isDesktop = useIsDesktop();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Flexbox handles positioning (bottom-sheet on mobile, centered dialog on desktop)
              so it never fights with Framer Motion's own transform animation on the panel. */}
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center pointer-events-none">
            <motion.div
              className="pointer-events-auto w-full max-w-[480px] lg:max-w-lg bg-surface rounded-t-3xl lg:rounded-3xl overflow-hidden flex flex-col lg:shadow-2xl"
              style={{ maxHeight: '85vh' }}
              initial={isDesktop ? { opacity: 0, scale: 0.95 } : { y: '100%' }}
              animate={isDesktop ? { opacity: 1, scale: 1 } : { y: 0 }}
              exit={isDesktop ? { opacity: 0, scale: 0.95 } : { y: '100%' }}
              transition={isDesktop ? { duration: 0.18 } : { type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
                <h2 className="text-sm font-bold text-primary">{title}</h2>
                <button onClick={onClose} className="p-1 text-muted hover:text-primary transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 px-5 py-4">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
