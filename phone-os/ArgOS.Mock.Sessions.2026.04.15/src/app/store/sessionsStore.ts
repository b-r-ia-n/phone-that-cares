import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { allScrollApps, defaultActiveIds } from '../data/scrollApps';
import type { ModeId } from '../lib/modes';

export interface AppSessionState {
  mode: ModeId;
  dailyRampMinutes: number;
  timeSpentTodayMs: number;
  dayKey: string;
}

interface SessionsStore {
  sessions: Record<string, AppSessionState>;
  activeAppIds: string[];
  tick: (appId: string, deltaMs: number) => void;
  setMode: (appId: string, mode: ModeId) => void;
  setDailyRamp: (appId: string, minutes: number) => void;
  resetDay: (appId: string) => void;
  scrubTime: (appId: string, ms: number) => void;
  addApp: (appId: string) => void;
  removeApp: (appId: string) => void;
  rehydrateDay: () => void;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

const DEMO_PRESETS: Record<string, number> = {
  instagram: 30 * 60 * 1000,
  x: 5 * 60 * 1000,
  youtube: 5 * 60 * 1000,
};

function initialSessions(): Record<string, AppSessionState> {
  const out: Record<string, AppSessionState> = {};
  for (const app of allScrollApps) {
    out[app.id] = {
      mode: app.defaultMode,
      dailyRampMinutes: app.defaultRampMinutes,
      timeSpentTodayMs: DEMO_PRESETS[app.id] ?? 0,
      dayKey: todayKey(),
    };
  }
  return out;
}

export const useSessionsStore = create<SessionsStore>()(
  persist(
    (set) => ({
      sessions: initialSessions(),
      activeAppIds: [...defaultActiveIds],
      tick: (appId, deltaMs) =>
        set((state) => {
          const current = state.sessions[appId];
          if (!current) return state;
          const tk = todayKey();
          const base =
            current.dayKey === tk
              ? current
              : {
                  ...current,
                  timeSpentTodayMs: DEMO_PRESETS[appId] ?? 0,
                  dayKey: tk,
                };
          return {
            sessions: {
              ...state.sessions,
              [appId]: {
                ...base,
                timeSpentTodayMs: base.timeSpentTodayMs + deltaMs,
              },
            },
          };
        }),
      setMode: (appId, mode) =>
        set((state) => {
          const current = state.sessions[appId];
          if (!current) return state;
          return {
            sessions: {
              ...state.sessions,
              [appId]: { ...current, mode },
            },
          };
        }),
      setDailyRamp: (appId, minutes) =>
        set((state) => {
          const current = state.sessions[appId];
          if (!current) return state;
          return {
            sessions: {
              ...state.sessions,
              [appId]: { ...current, dailyRampMinutes: minutes },
            },
          };
        }),
      resetDay: (appId) =>
        set((state) => {
          const current = state.sessions[appId];
          if (!current) return state;
          return {
            sessions: {
              ...state.sessions,
              [appId]: {
                ...current,
                timeSpentTodayMs: 0,
                dayKey: todayKey(),
              },
            },
          };
        }),
      scrubTime: (appId, ms) =>
        set((state) => {
          const current = state.sessions[appId];
          if (!current) return state;
          return {
            sessions: {
              ...state.sessions,
              [appId]: {
                ...current,
                timeSpentTodayMs: Math.max(0, ms),
                dayKey: todayKey(),
              },
            },
          };
        }),
      addApp: (appId) =>
        set((state) => {
          if (state.activeAppIds.includes(appId)) return state;
          const app = allScrollApps.find((a) => a.id === appId);
          if (!app) return state;
          const newSessions = { ...state.sessions };
          if (!newSessions[appId]) {
            newSessions[appId] = {
              mode: app.defaultMode,
              dailyRampMinutes: app.defaultRampMinutes,
              timeSpentTodayMs: 0,
              dayKey: todayKey(),
            };
          }
          return {
            activeAppIds: [...state.activeAppIds, appId],
            sessions: newSessions,
          };
        }),
      removeApp: (appId) =>
        set((state) => ({
          activeAppIds: state.activeAppIds.filter((id) => id !== appId),
        })),
      rehydrateDay: () =>
        set((state) => {
          const tk = todayKey();
          const nextSessions: Record<string, AppSessionState> = {};
          let changed = false;
          for (const [id, sess] of Object.entries(state.sessions)) {
            if (sess.dayKey !== tk) {
              nextSessions[id] = {
                ...sess,
                timeSpentTodayMs: DEMO_PRESETS[id] ?? 0,
                dayKey: tk,
              };
              changed = true;
            } else {
              nextSessions[id] = sess;
            }
          }
          return changed ? { sessions: nextSessions } : state;
        }),
    }),
    {
      name: 'argos-sessions-v4',
    },
  ),
);

export function getProgress(session: AppSessionState): number {
  const rampMs = session.dailyRampMinutes * 60 * 1000;
  if (rampMs <= 0) return 0;
  return Math.max(0, Math.min(1, session.timeSpentTodayMs / rampMs));
}
