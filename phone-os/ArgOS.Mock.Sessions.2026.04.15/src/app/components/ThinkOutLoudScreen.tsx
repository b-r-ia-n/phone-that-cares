import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mic } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

interface PersonPrompt {
  displayName: string;
  prompt: string;
  context: string;
}

const personPrompts: Record<string, PersonPrompt> = {
  sarah: {
    displayName: 'Sarah',
    prompt: "Take your time. What's coming up with Sarah?",
    context: "You last talked 2 days ago. You've messaged almost every week for years.",
  },
  marcus: {
    displayName: 'Marcus',
    prompt: "What are you thinking about with Marcus? Could be about work, the side project, or anything else.",
    context: "You last talked 6 weeks ago. You've messaged 40+ times over the years.",
  },
  mom: {
    displayName: 'Mom',
    prompt: "What's on your mind about your mom?",
    context: "You last talked 3 days ago. You usually catch up on Sundays.",
  },
  'dev-group': {
    displayName: 'Dev Group',
    prompt: "Anything on your mind about the next session? Feeling nervous about cancelling, unsure about the prep?",
    context: "Next session is Thursday. The thread’s been quiet for a couple of days.",
  },
  jamie: {
    displayName: 'Jamie',
    prompt: "What's on your mind about Jamie?",
    context: "You last talked 2 weeks ago. You tend to go quiet for stretches, then catch up in bursts.",
  },
};

function slugToName(slug: string): string {
  return slug
    .split('-')
    .map((part) => (part.length ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ');
}

export default function ThinkOutLoudScreen() {
  const navigate = useNavigate();
  const { person } = useParams<{ person: string }>();
  const [isListening, setIsListening] = useState(true);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);

  const slug = (person || 'marcus').toLowerCase();
  const entry = personPrompts[slug];
  const personName = entry ? entry.displayName : slugToName(slug);
  const promptLine = entry
    ? entry.prompt
    : `Take your time. What's going on with ${personName}?`;
  const contextLine = entry
    ? entry.context
    : "You last talked 6 weeks ago. You've messaged 40+ times over the years.";

  useEffect(() => {
    const interval = setInterval(() => {
      if (isListening) {
        setPulseScale((prev) => (prev === 1 ? 1.1 : 1));
      }
    }, 1000);

    // Simulate user speaking after 3 seconds
    const speakTimeout = setTimeout(() => {
      setHasSpoken(true);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(speakTimeout);
    };
  }, [isListening]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/10 via-transparent to-transparent" />

      {/* Header */}
      <div className="relative z-10 px-6 pt-12 pb-6 flex items-center">
        <button
          onClick={() => navigate('/connect')}
          className="text-white/60 hover:text-white/90 transition-colors"
        >
          <ArrowLeft size={24} strokeWidth={1.5} />
        </button>
        <h1
          className="ml-4 text-xl font-light tracking-tight text-white/70"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Think Out Loud
        </h1>
      </div>

      {/* Main content - centered */}
      <div className="relative z-10 flex flex-col items-center justify-center h-[724px] px-8">
        {/* Person name */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-lg">
            🧑‍💻
          </div>
          <h2
            className="text-3xl font-light text-white/95"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {personName}
          </h2>
        </motion.div>

        {/* Context line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-12 text-center"
        >
          <p
            className="text-sm text-white/40 tracking-wide"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {contextLine}
          </p>
        </motion.div>

        {/* Breathing microphone */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <motion.div
            className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500/20 to-violet-600/20 border-2 border-violet-400/30 flex items-center justify-center"
            animate={{
              scale: pulseScale,
            }}
            transition={{
              duration: 1,
              ease: 'easeInOut',
            }}
          >
            <Mic size={48} strokeWidth={1.5} className="text-violet-300/80" />
          </motion.div>
        </motion.div>

        {/* Prompt text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center max-w-xs"
        >
          <p
            className="text-base text-white/70"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {promptLine}
          </p>
        </motion.div>

        {/* Optional draft link - appears after speaking */}
        <AnimatePresence>
          {hasSpoken && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-20"
            >
              <button
                className="text-sm text-white/50 hover:text-white/80 transition-colors underline decoration-dotted"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Want me to help you draft something?
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
