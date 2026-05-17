import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router';
import { useSessionsStore } from './store/sessionsStore';
import LockScreen from './components/LockScreen';
import ConnectScreen from './components/ConnectScreen';
import HomeScreen from './components/HomeScreen';
import AskScreen from './components/AskScreen';
import ThinkOutLoudScreen from './components/ThinkOutLoudScreen';
import AboutPersonScreen from './components/AboutPersonScreen';
import NotificationsScreen from './components/NotificationsScreen';
import ConversationScreen from './components/ConversationScreen';
import SessionsScreen from './components/SessionsScreen';
import TreatmentsListScreen from './components/TreatmentsListScreen';
import AppTreatmentDetailScreen from './components/AppTreatmentDetailScreen';
import SessionAppScreen from './components/SessionAppScreen';

export default function App() {
  useEffect(() => {
    useSessionsStore.getState().rehydrateDay();
  }, []);

  return (
    <HashRouter>
      {/* Phone — bezel + screen, two layers only */}
      <div className="w-full h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div
          className="relative w-[390px] h-[844px] rounded-[3rem] bg-zinc-900 shadow-2xl"
          style={{ padding: '12px' }}
        >
          <div className="w-full h-full rounded-[36px] overflow-hidden bg-[#0a0a0a]">
            <Routes>
              <Route path="/" element={<LockScreen />} />
              <Route path="/connect" element={<ConnectScreen />} />
              <Route path="/sessions" element={<SessionsScreen />} />
              <Route path="/sessions/treatments" element={<TreatmentsListScreen />} />
              <Route path="/sessions/treatments/:appId" element={<AppTreatmentDetailScreen />} />
              <Route path="/sessions/app/:appId" element={<SessionAppScreen />} />
              <Route path="/home" element={<HomeScreen />} />
              <Route path="/ask" element={<AskScreen />} />
              <Route path="/think-out-loud/:person" element={<ThinkOutLoudScreen />} />
              <Route path="/about/:personId" element={<AboutPersonScreen />} />
              <Route path="/notifications" element={<NotificationsScreen />} />
              <Route path="/conversation/:personId" element={<ConversationScreen />} />
            </Routes>
          </div>
        </div>
      </div>
    </HashRouter>
  );
}