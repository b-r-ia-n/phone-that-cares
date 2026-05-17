import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import AndroidStatusBar from './AndroidStatusBar';
import { getScrollApp } from '../data/scrollApps';
import { useSessionsStore, getProgress } from '../store/sessionsStore';
import { modes, formatMinutes } from '../lib/modes';
import type { ModeId } from '../lib/modes';

export default function AppTreatmentDetailScreen() {
  const navigate = useNavigate();
  const { appId } = useParams<{ appId: string }>();
  const app = getScrollApp(appId);

  const session = useSessionsStore((s) => (appId ? s.sessions[appId] : undefined));
  const setMode = useSessionsStore((s) => s.setMode);
  const setDailyRamp = useSessionsStore((s) => s.setDailyRamp);

  if (!app || !appId || !session) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-white/50 text-sm">Unknown app.</p>
      </div>
    );
  }

  const Icon = app.icon;
  const progress = getProgress(session);
  const modeMeta = modes[session.mode];

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a]">
      <AndroidStatusBar />

      {/* Header */}
      <div className="relative z-10 px-6 pt-12 pb-5 flex items-center justify-between">
        <button
          onClick={() => navigate('/sessions/treatments')}
          className="text-white/60 hover:text-white/90 transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-2.5">
          <h1
            className="text-base font-medium text-white/90"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {app.name}
          </h1>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: app.color }}
          >
            <Icon size={18} color="white" />
          </div>
        </div>
      </div>

      {/* Gray-box container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 mx-6 rounded-2xl bg-white/[0.05] px-5 pt-6 pb-5 h-[calc(100%-200px)] flex flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto scrollbar-hide pr-1 -mr-1">
          {/* Today section */}
          <div className="mb-6">
            <div
              className="text-[10px] uppercase tracking-[0.15em] text-white/35 mb-2"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Today
            </div>
            <div className="mb-2">
              <div
                className="text-2xl font-light text-white/90"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {formatMinutes(session.timeSpentTodayMs)}
              </div>
            </div>
            <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.round(progress * 100)}%`,
                  backgroundColor: app.color,
                }}
              />
            </div>
            <div
              className="text-[11px] text-white/40 mt-1.5"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              of {session.dailyRampMinutes}m ramp
            </div>
          </div>

          {/* Daily ramp slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div
                className="text-[10px] uppercase tracking-[0.15em] text-white/35"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Ramp
              </div>
              <div
                className="text-xs text-white/60"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {session.dailyRampMinutes} min
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={session.dailyRampMinutes}
              onChange={(e) => setDailyRamp(appId, Number(e.target.value))}
              className="w-full sessions-slider"
              style={{ accentColor: app.color }}
            />
            <div
              className="text-[11px] text-white/35 mt-1"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Time to full effect.
            </div>
          </div>

          {/* Mode picker */}
          <div className="mb-6">
            <div
              className="text-[10px] uppercase tracking-[0.15em] text-white/35 mb-3"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Mode
            </div>
            <div className="flex flex-col gap-2">
              {app.availableModes.map((modeId: ModeId) => {
                const m = modes[modeId];
                const selected = session.mode === modeId;
                return (
                  <button
                    key={modeId}
                    onClick={() => setMode(appId, modeId)}
                    className={`flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl text-left transition-colors border ${
                      selected
                        ? 'bg-white/[0.08] border-white/20'
                        : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-sm font-medium ${selected ? 'text-white/95' : 'text-white/75'}`}
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {m.name}
                      </span>
                      {selected && (
                        <span
                          className="text-[10px] uppercase tracking-wider"
                          style={{ color: app.color, fontFamily: 'var(--font-body)' }}
                        >
                          Active
                        </span>
                      )}
                    </div>
                    <span
                      className="text-[11px] text-white/45"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {m.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="text-[11px] text-white/45 leading-relaxed px-1 pb-2"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {modeMeta.longDescription}
          </div>
        </div>

        {/* Open app button */}
        <button
          onClick={() => navigate(`/sessions/app/${appId}`)}
          className="mt-3 w-full py-3 rounded-xl text-sm font-medium text-white transition-transform active:scale-[0.98]"
          style={{
            backgroundColor: app.color,
            fontFamily: 'var(--font-body)',
          }}
        >
          Open {app.name}
        </button>
      </motion.div>
    </div>
  );
}
