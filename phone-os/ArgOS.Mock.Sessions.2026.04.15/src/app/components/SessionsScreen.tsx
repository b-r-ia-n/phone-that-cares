import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, SlidersHorizontal, Plus, X, Bell } from 'lucide-react';
import { useNavigate } from 'react-router';
import AndroidStatusBar from './AndroidStatusBar';
import { allScrollApps } from '../data/scrollApps';
import { useSessionsStore, getProgress } from '../store/sessionsStore';
import { getModeFilter, formatMinutes } from '../lib/modes';
import type { ScrollApp } from '../data/scrollApps';
import type { AppSessionState } from '../store/sessionsStore';

export default function SessionsScreen() {
  const navigate = useNavigate();
  const sessions = useSessionsStore((s) => s.sessions);
  const activeAppIds = useSessionsStore((s) => s.activeAppIds);
  const addApp = useSessionsStore((s) => s.addApp);
  const [showAddSheet, setShowAddSheet] = useState(false);

  const activeApps = allScrollApps.filter((a) => activeAppIds.includes(a.id));
  const inactiveApps = allScrollApps.filter((a) => !activeAppIds.includes(a.id));

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a]">
      <AndroidStatusBar />

      {/* Header */}
      <div className="relative z-10 px-6 pt-14 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-white/60 hover:text-white/90 transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <h1
            className="text-2xl font-light tracking-tight text-white/95"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Discover
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.1] transition-colors"
          >
            <Bell size={14} strokeWidth={1.75} />
          </button>
          <button
            onClick={() => navigate('/sessions/treatments')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.1] transition-colors"
          >
            <SlidersHorizontal size={13} strokeWidth={1.75} />
            <span
              className="text-xs"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Styles
            </span>
          </button>
        </div>
      </div>

      {/* Gray-box container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 mx-6 rounded-2xl bg-white/[0.05] px-5 pt-8 pb-5 h-[calc(100%-200px)] flex flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-3 gap-x-2 gap-y-5">
            {activeApps.map((app, index) => (
              <AppTile
                key={app.id}
                app={app}
                session={sessions[app.id]}
                index={index}
                onOpen={() => navigate(`/sessions/app/${app.id}`)}
              />
            ))}

            {/* Add app tile */}
            {inactiveApps.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + activeApps.length * 0.05, duration: 0.3 }}
                onClick={() => setShowAddSheet(true)}
                className="flex flex-col items-center gap-1.5 py-2 rounded-xl hover:bg-white/[0.03] transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-dashed border-white/15">
                  <Plus size={22} strokeWidth={1.5} className="text-white/40" />
                </div>
                <div
                  className="text-[11px] font-medium text-white/45 text-center"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Add app
                </div>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Add app bottom sheet */}
      <AnimatePresence>
        {showAddSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowAddSheet(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] rounded-t-2xl border-t border-white/10 max-h-[506px] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <h2
                  className="text-base font-medium text-white/90"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Add an app
                </h2>
                <button
                  onClick={() => setShowAddSheet(false)}
                  className="text-white/50 hover:text-white/80 transition-colors"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8">
                <div className="flex flex-col gap-1.5">
                  {inactiveApps.map((app) => {
                    const Icon = app.icon;
                    return (
                      <button
                        key={app.id}
                        onClick={() => {
                          addApp(app.id);
                          setShowAddSheet(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-colors"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: app.color }}
                        >
                          <Icon size={20} color="white" />
                        </div>
                        <span
                          className="text-sm text-white/80"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {app.name}
                        </span>
                        <Plus size={16} className="ml-auto text-white/30" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AppTileProps {
  app: ScrollApp;
  session: AppSessionState | undefined;
  index: number;
  onOpen: () => void;
}

function AppTile({ app, session, index, onOpen }: AppTileProps) {
  const Icon = app.icon;
  const mode = session?.mode ?? 'off';
  const progress = session ? getProgress(session) : 0;
  const timeSpent = session?.timeSpentTodayMs ?? 0;
  const rampMs = (session?.dailyRampMinutes ?? 0) * 60 * 1000;

  const iconFilter = getModeFilter(mode, progress);
  const hasIconVisual =
    (mode === 'grayscale' || mode === 'feed-blur') && progress > 0;

  const showProgressBar = mode !== 'off' && progress > 0;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 + index * 0.05, duration: 0.3 }}
      onClick={onOpen}
      className="flex flex-col items-center gap-1.5 py-2 rounded-xl hover:bg-white/[0.03] transition-colors"
    >
      <div className="relative">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            backgroundColor: app.color,
            ...iconFilter,
          }}
        >
          <Icon size={26} color="white" />
        </div>
        {progress > 0.5 && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              boxShadow: `0 0 ${Math.round(progress * 20)}px rgba(255,255,255,${0.05 + progress * 0.1})`,
            }}
          />
        )}
      </div>

      <div
        className="text-[11px] font-medium text-white/85 text-center"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {app.name}
      </div>

      <div className="w-14 flex flex-col items-center gap-0.5">
        {showProgressBar && (
          <div className="h-0.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: hasIconVisual ? 'rgba(255,255,255,0.5)' : app.color,
              }}
            />
          </div>
        )}
        {timeSpent > 0 && (
          <div
            className="text-[9px] text-white/40 tracking-wide"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {formatMinutes(timeSpent)}
            {rampMs > 0 ? ` / ${session!.dailyRampMinutes}m` : ''}
          </div>
        )}
      </div>
    </motion.button>
  );
}
