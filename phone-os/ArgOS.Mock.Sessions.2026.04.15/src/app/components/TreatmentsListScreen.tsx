import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import AndroidStatusBar from './AndroidStatusBar';
import { allScrollApps } from '../data/scrollApps';
import { useSessionsStore, getProgress } from '../store/sessionsStore';
import { modes, formatMinutes } from '../lib/modes';

export default function TreatmentsListScreen() {
  const navigate = useNavigate();
  const sessions = useSessionsStore((s) => s.sessions);
  const activeAppIds = useSessionsStore((s) => s.activeAppIds);
  const activeApps = allScrollApps.filter((a) => activeAppIds.includes(a.id));

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a]">
      <AndroidStatusBar />

      {/* Header */}
      <div className="relative z-10 px-6 pt-12 pb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/sessions')}
          className="text-white/60 hover:text-white/90 transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>

        <h1
          className="text-base font-medium text-white/90"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Styles
        </h1>

        <div className="w-5" />
      </div>

      {/* Gray-box container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 mx-6 rounded-2xl bg-white/[0.05] px-4 pt-6 pb-3 h-[calc(100%-200px)] flex flex-col"
      >
        <p
          className="text-xs text-white/40 mb-5 text-center tracking-wide px-2"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Pick how the phone should meet you in each app.
        </p>

        <div className="flex flex-col gap-2">
          {activeApps.map((app, index) => {
            const session = sessions[app.id];
            const Icon = app.icon;
            const mode = session?.mode ?? 'off';
            const modeMeta = modes[mode];
            const progress = session ? getProgress(session) : 0;

            return (
              <motion.button
                key={app.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                onClick={() => navigate(`/sessions/treatments/${app.id}`)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] transition-colors border border-white/[0.05]"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: app.color }}
                >
                  <Icon size={20} color="white" />
                </div>

                <div className="flex-1 text-left min-w-0">
                  <div
                    className="text-sm font-medium text-white/90"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {app.name}
                  </div>
                  <div
                    className="text-[11px] text-white/45 truncate"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {modeMeta.name}
                    {mode !== 'off' && session && session.timeSpentTodayMs > 0 && (
                      <>
                        {' · '}
                        {formatMinutes(session.timeSpentTodayMs)} / {session.dailyRampMinutes}m
                      </>
                    )}
                  </div>
                  {mode !== 'off' && progress > 0 && (
                    <div className="mt-1.5 h-0.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round(progress * 100)}%`,
                          backgroundColor: app.color,
                        }}
                      />
                    </div>
                  )}
                </div>

                <ChevronRight
                  size={16}
                  strokeWidth={1.75}
                  className="text-white/30 flex-shrink-0"
                />
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
