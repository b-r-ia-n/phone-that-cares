import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import AndroidStatusBar from './AndroidStatusBar';

const memorySnippets = [
  'yesterday: you asked me to remind you about the dentist',
  'this morning: drafted a reply to Sarah',
  'tonight: the sky should be clear enough to see saturn',
];

export default function AskScreen() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(true);
  const [waveformBars, setWaveformBars] = useState<number[]>([]);

  useEffect(() => {
    // Generate random waveform bars - slowed down 50%
    const interval = setInterval(() => {
      if (isListening) {
        setWaveformBars(Array.from({ length: 5 }, () => Math.random() * 0.6 + 0.4));
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isListening]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Android Status Bar */}
      <AndroidStatusBar />

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-violet-950/30" />

      {/* Back button */}
      <div className="absolute top-12 left-6 z-20">
        <button
          onClick={() => navigate('/')}
          className="text-white/60 hover:text-white/90 transition-colors"
        >
          <ArrowLeft size={24} strokeWidth={1.5} />
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 pb-[70px]">
        {/* Memory snippets */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 space-y-3 w-[300px]"
        >
          {memorySnippets.map((snippet, index) => (
            <motion.div
              key={snippet}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="text-center text-sm text-white/20 italic"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {snippet}
            </motion.div>
          ))}
        </motion.div>

        {/* Waveform / listening indicator */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-end justify-center gap-2 h-24">
            {waveformBars.map((height, index) => (
              <motion.div
                key={index}
                className="w-2 bg-gradient-to-t from-violet-400 to-violet-300 rounded-full"
                animate={{
                  height: `${height * 100}%`,
                }}
                transition={{
                  duration: 0.2,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* AI prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center max-w-md"
        >
          <h2
            className="text-2xl font-light text-white/90 mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            What do you want to do?
          </h2>
          <p
            className="text-base text-white/40 mb-8"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            You can ask me to text someone, set a reminder, look something up, or just think through something with you.
          </p>

          {/* Listening indicator */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-violet-400"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <span
                  className="text-sm text-white/50"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Listening...
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Optional text input hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-[99px] left-0 right-0 text-center"
        >
          <button
            className="text-xs text-white/30 hover:text-white/50 transition-colors underline decoration-dotted"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            or type instead
          </button>
        </motion.div>
      </div>
    </div>
  );
}
