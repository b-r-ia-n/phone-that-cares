import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Circle, Type, Eye, CreditCard, Activity, Minus, RotateCcw } from 'lucide-react';

export type Experiment =
  | 'grayscale'
  | 'tweet-padding'
  | 'feed-blur'
  | 'font-cycling'
  | 'break-cards'
  | 'passive-tracking'
  | 'none';

interface ScrollSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeExperiment: Experiment;
  setActiveExperiment: (exp: Experiment) => void;
}

export const experiments: Record<Experiment, { name: string; description: string; icon: any }> = {
  'grayscale': {
    name: 'Grayscale',
    description: 'Feed gradually loses color',
    icon: Circle,
  },
  'tweet-padding': {
    name: 'Tweet padding',
    description: 'Spreads feed out over time',
    icon: CreditCard,
  },
  'feed-blur': {
    name: 'Feed blur',
    description: 'Gradually softens timeline',
    icon: Eye,
  },
  'font-cycling': {
    name: 'Font cycling',
    description: 'Alternates serif and sans',
    icon: Type,
  },
  'break-cards': {
    name: 'Break cards',
    description: 'Pauses between posts',
    icon: Activity,
  },
  'passive-tracking': {
    name: 'Passive tracking',
    description: 'No visual changes',
    icon: Minus,
  },
  'none': {
    name: 'None',
    description: 'Feed as-is',
    icon: Minus,
  },
};

export default function ScrollSettingsPanel({ isOpen, onClose, activeExperiment, setActiveExperiment }: ScrollSettingsPanelProps) {
  const [timeValue, setTimeValue] = useState(20);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-white/10 rounded-t-3xl max-h-[70vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-[#0a0a0a] px-4 py-2 flex items-center justify-between rounded-t-3xl">
              <h2
                className="text-sm font-medium text-white/90"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Scroll settings
              </h2>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white/90 transition-colors"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div className="px-4 pb-4">
              {/* Current experiment */}
              <div className="mt-3">
                <div className="text-[8px] tracking-[0.15em] uppercase text-white/40 mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>
                  CURRENT
                </div>
                <button
                  className="w-full p-2 rounded-lg bg-white/[0.05] border border-white/10 flex items-center gap-2"
                >
                  <div className="flex-1 text-left">
                    <span className="text-[12px] font-medium text-white/90" style={{ fontFamily: 'var(--font-body)' }}>
                      {experiments[activeExperiment].name}
                    </span>
                    <span className="text-[11px] text-white/50 ml-1.5" style={{ fontFamily: 'var(--font-body)' }}>
                      · {experiments[activeExperiment].description}
                    </span>
                  </div>
                </button>
              </div>

              {/* Other experiments */}
              <div className="mt-3">
                <div className="text-[8px] tracking-[0.15em] uppercase text-white/40 mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>
                  OTHER WAYS TO SCROLL
                </div>
                <div className="space-y-1">
                  {(Object.keys(experiments) as Experiment[])
                    .filter((key) => key !== activeExperiment)
                    .map((key) => {
                      const exp = experiments[key];
                      return (
                        <button
                          key={key}
                          onClick={() => setActiveExperiment(key)}
                          className="w-full p-2 rounded-lg bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all flex items-center gap-2"
                        >
                          <div className="flex-1 text-left">
                            <span className="text-[12px] text-white/80" style={{ fontFamily: 'var(--font-body)' }}>
                              {exp.name}
                            </span>
                            <span className="text-[11px] text-white/40 ml-1.5" style={{ fontFamily: 'var(--font-body)' }}>
                              · {exp.description}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Timing */}
              <div className="mt-3">
                <div className="text-[8px] tracking-[0.15em] uppercase text-white/40 mb-1.5" style={{ fontFamily: 'var(--font-body)' }}>
                  TIME TO FULL EFFECT
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10">
                  {/* Value display */}
                  <div className="text-center mb-2">
                    <span className="text-base font-light text-white/90" style={{ fontFamily: 'var(--font-display)' }}>
                      {timeValue} min
                    </span>
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={timeValue}
                    onChange={(e) => setTimeValue(Number(e.target.value))}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.3) ${(timeValue / 20) * 100}%, rgba(255,255,255,0.1) ${(timeValue / 20) * 100}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />

                  {/* Labels */}
                  <div className="flex justify-between mt-1">
                    <span className="text-[8px] text-white/40" style={{ fontFamily: 'var(--font-body)' }}>
                      Instant
                    </span>
                    <span className="text-[8px] text-white/40" style={{ fontFamily: 'var(--font-body)' }}>
                      10 min
                    </span>
                    <span className="text-[8px] text-white/40" style={{ fontFamily: 'var(--font-body)' }}>
                      20 min
                    </span>
                  </div>
                </div>
              </div>

              {/* Session info */}
              <div className="mt-3">
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[8px] tracking-[0.15em] uppercase text-white/30 mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                      SESSION
                    </div>
                    <div className="text-sm font-medium text-white/80" style={{ fontFamily: 'var(--font-body)' }}>
                      1:30
                    </div>
                  </div>
                  <button className="text-white/40 hover:text-white/70 transition-colors">
                    <RotateCcw size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
