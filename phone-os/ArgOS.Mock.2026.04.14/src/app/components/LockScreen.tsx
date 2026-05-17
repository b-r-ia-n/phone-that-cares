import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Sprout, Mic, MessageCircleHeart, Grid3x3, Camera, Flashlight, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AndroidStatusBar from './AndroidStatusBar';

export default function LockScreen() {
  const navigate = useNavigate();
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [activeDirection, setActiveDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef({ x: 0, y: 0 });

  const CIRCLE_RADIUS = 80;
  const THRESHOLD = 60;
  const COLOR_START_THRESHOLD = CIRCLE_RADIUS * 0.33;
  const COLOR_MAX_THRESHOLD = CIRCLE_RADIUS * 0.85;

  useEffect(() => {
    if (circleRef.current) {
      const rect = circleRef.current.getBoundingClientRect();
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
  }, []);

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    centerRef.current = {
      x: clientX,
      y: clientY,
    };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const deltaX = clientX - centerRef.current.x;
    const deltaY = clientY - centerRef.current.y;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const constrainedDistance = Math.min(distance, CIRCLE_RADIUS);
    const angle = Math.atan2(deltaY, deltaX);

    const x = Math.cos(angle) * constrainedDistance;
    const y = Math.sin(angle) * constrainedDistance;

    setDragPosition({ x, y });

    // Determine direction
    if (Math.abs(y) > Math.abs(x)) {
      setActiveDirection(y < 0 ? 'up' : 'down');
    } else {
      setActiveDirection(x < 0 ? 'left' : 'right');
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;

    const distance = Math.sqrt(dragPosition.x ** 2 + dragPosition.y ** 2);

    if (distance > THRESHOLD) {
      // Navigate based on direction
      switch (activeDirection) {
        case 'up':
          navigate('/discover');
          break;
        case 'down':
          navigate('/ask');
          break;
        case 'left':
          navigate('/connect');
          break;
        case 'right':
          navigate('/home');
          break;
      }
    }

    setIsDragging(false);
    setDragPosition({ x: 0, y: 0 });
    setActiveDirection(null);
  };

  const IDLE_RING_COLOR = 'rgba(255, 255, 255, 0.09)';

  const getCircleColor = () => {
    if (!activeDirection) return IDLE_RING_COLOR;

    const distance = Math.sqrt(dragPosition.x ** 2 + dragPosition.y ** 2);

    // No color until 1/3 of the way
    if (distance < COLOR_START_THRESHOLD) {
      return IDLE_RING_COLOR;
    }

    // Gradual color from 1/3 to edge
    const colorProgress = Math.min(
      (distance - COLOR_START_THRESHOLD) / (COLOR_MAX_THRESHOLD - COLOR_START_THRESHOLD),
      1
    );

    const baseColors = {
      up: { r: 245, g: 197, b: 99 },
      down: { r: 177, g: 156, b: 217 },
      left: { r: 134, g: 239, b: 172 },
      right: { r: 125, g: 211, b: 252 },
    };

    const color = baseColors[activeDirection];
    const opacity = 0.025 + (colorProgress * 0.15);

    return `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
  };

  const getEdgeBrightness = () => {
    const distance = Math.sqrt(dragPosition.x ** 2 + dragPosition.y ** 2);
    return distance >= COLOR_MAX_THRESHOLD ? 1.5 : 1;
  };

  const now = new Date();
  const timeString = '11:11';
  const dateString = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-transparent to-zinc-900/30" />

      {/* Android Status Bar */}
      <AndroidStatusBar />

      {/* Time, date, and weather cluster */}
      <div className="absolute top-16 left-0 right-0 flex flex-col items-center z-10 select-none">
        {/* Time */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-[5.5rem] font-light tracking-tight text-white/95"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {timeString}
        </motion.div>

        {/* Date and weather on same line - much closer to time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-2"
          style={{ marginTop: '-0.5rem' }}
        >
          <span
            className="text-xs tracking-[0.2em] uppercase text-white/50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {dateString}
          </span>
          <span className="text-white/30">·</span>
          <div className="flex items-center gap-1.5">
            <Sun size={12} strokeWidth={1.5} className="text-white/50" />
            <span
              className="text-xs tracking-[0.15em] uppercase text-white/50"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              68°
            </span>
          </div>
        </motion.div>
      </div>

      {/* Notifications */}
      <div className="absolute top-[260px] left-6 right-6 space-y-2 z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08]"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs flex-shrink-0">
            M
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white/70" style={{ fontFamily: 'var(--font-body)' }}>
              Messages
            </div>
            <div className="text-[11px] text-white/50 truncate" style={{ fontFamily: 'var(--font-body)' }}>
              Caroline: Hey! Want to grab coffee later?
            </div>
          </div>
          <div className="text-[10px] text-white/30">now</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08]"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xs flex-shrink-0">
            S
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white/70" style={{ fontFamily: 'var(--font-body)' }}>
              Slack
            </div>
            <div className="text-[11px] text-white/50 truncate" style={{ fontFamily: 'var(--font-body)' }}>
              2 new messages in #general
            </div>
          </div>
          <div className="text-[10px] text-white/30">5m</div>
        </motion.div>
      </div>

      {/* Interactive circle */}
      <div className="absolute bottom-[29vh] left-1/2 -translate-x-1/2 flex items-center justify-center">
        <div className="relative">
          {/* Outer circle */}
          <motion.div
            ref={circleRef}
            className="w-40 h-40 rounded-full border transition-all duration-300"
            style={{
              borderColor: getCircleColor(),
              borderWidth: '2px',
              backgroundColor: getCircleColor(),
              filter: `brightness(${getEdgeBrightness()})`,
            }}
            animate={{
              scale: isDragging ? 1.05 : 1,
            }}
            transition={{ duration: 0.2 }}
          />

          {/* Direction indicators - icons */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 text-white/75"
            animate={{ opacity: activeDirection === 'up' ? 1 : 0.75 }}
          >
            <Sprout size={20} strokeWidth={1.5} />
          </motion.div>

          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-12 text-white/75"
            animate={{ opacity: activeDirection === 'down' ? 1 : 0.75 }}
          >
            <Mic size={20} strokeWidth={1.5} />
          </motion.div>

          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-white/75"
            animate={{ opacity: activeDirection === 'left' ? 1 : 0.75 }}
          >
            <MessageCircleHeart size={20} strokeWidth={1.5} />
          </motion.div>

          <motion.div
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-white/75"
            animate={{ opacity: activeDirection === 'right' ? 1 : 0.75 }}
          >
            <Grid3x3 size={20} strokeWidth={1.5} />
          </motion.div>

          {/* Draggable puck */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm cursor-grab active:cursor-grabbing"
            style={{
              x: dragPosition.x,
              y: dragPosition.y,
              translateX: '-50%',
              translateY: '-50%',
            }}
            animate={{
              scale: isDragging ? 1.2 : 1,
              backgroundColor: isDragging ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)',
            }}
            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
            onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
            onMouseUp={handleEnd}
            onTouchEnd={handleEnd}
            onMouseLeave={() => {
              if (isDragging) handleEnd();
            }}
          />
        </div>
      </div>

      {/* Direction labels */}
      <AnimatePresence>
        {activeDirection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-[104px] h-12 left-1/2 -translate-x-1/2 flex items-center text-white/60 text-sm tracking-wide"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {activeDirection === 'up' && 'Discover'}
            {activeDirection === 'down' && 'Ask'}
            {activeDirection === 'left' && 'Connect'}
            {activeDirection === 'right' && 'Home'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera and Flashlight indicators */}
      <div className="absolute bottom-28 left-0 right-0 flex justify-between px-12 z-10">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ delay: 0.8 }}
          className="w-10 h-10 rounded-full border border-white/12 flex items-center justify-center hover:bg-white/5 transition-all"
        >
          <Flashlight size={16} strokeWidth={1.5} className="text-white/55" />
        </motion.button>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ delay: 0.8 }}
          className="w-10 h-10 rounded-full border border-white/12 flex items-center justify-center hover:bg-white/5 transition-all"
        >
          <Camera size={16} strokeWidth={1.5} className="text-white/55" />
        </motion.button>
      </div>
    </div>
  );
}
