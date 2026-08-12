import { useEffect, useState } from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';

declare global {
  interface Window {
    $chatway?: {
      openChatwayWidget?: () => void;
      closeChatwayWidget?: () => void;
      hideChatwayIcon?: () => void;
      showChatwayIcon?: () => void;
      isChatwayLoaded?: () => boolean;
      isChatwayWidgetOpen?: () => boolean;
    };
  }
}

const openChatway = () => {
  const chatway = window.$chatway;
  if (chatway?.isChatwayLoaded?.() && chatway.openChatwayWidget) {
    chatway.openChatwayWidget();
    return;
  }
  // Widget still loading — retry briefly
  const started = Date.now();
  const timer = window.setInterval(() => {
    const cw = window.$chatway;
    if (cw?.isChatwayLoaded?.() && cw.openChatwayWidget) {
      cw.openChatwayWidget();
      window.clearInterval(timer);
    } else if (Date.now() - started > 8000) {
      window.clearInterval(timer);
    }
  }, 200);
};

const FloatingActions = () => {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  const fabClass =
    'flex h-12 w-12 items-center justify-center rounded-full bg-cobalt text-[#F4F6FF] shadow-[0_10px_30px_rgba(79,109,245,0.28)] transition-all duration-300 hover:bg-cobalt-light hover:shadow-[0_14px_40px_rgba(79,109,245,0.36)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900';

  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col items-center gap-3 sm:bottom-8 sm:right-6">
      <button
        type="button"
        onClick={scrollToTop}
        className={`${fabClass} ${
          showTop ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
        }`}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
      >
        <ArrowUp className="h-5 w-5" strokeWidth={2.25} />
      </button>
      <button
        type="button"
        onClick={openChatway}
        className={fabClass}
        aria-label="Open live chat"
      >
        <MessageCircle className="h-5 w-5" strokeWidth={2.25} />
      </button>
    </div>
  );
};

export default FloatingActions;
