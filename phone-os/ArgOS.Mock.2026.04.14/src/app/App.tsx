import { HashRouter, Routes, Route } from 'react-router';
import LockScreen from './components/LockScreen';
import ConnectScreen from './components/ConnectScreen';
import DiscoverScreen from './components/DiscoverScreen';
import HomeScreen from './components/HomeScreen';
import AskScreen from './components/AskScreen';
import ThinkOutLoudScreen from './components/ThinkOutLoudScreen';
import AboutPersonScreen from './components/AboutPersonScreen';
import NotificationsScreen from './components/NotificationsScreen';
import ConversationScreen from './components/ConversationScreen';

export default function App() {
  return (
    <HashRouter>
      {/* Desktop wrapper - centers phone on larger screens */}
      <div className="w-full h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-8">
        {/* Phone frame */}
        <div className="relative">
          {/* Phone bezel */}
          <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-2xl" style={{ padding: '12px' }}>
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-black shadow-inner" />
          </div>

          {/* Phone screen */}
          <div className="relative w-[390px] h-[844px] rounded-[3rem] overflow-hidden shadow-2xl" style={{ padding: '12px' }}>
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-[#0a0a0a]">
              <Routes>
                <Route path="/" element={<LockScreen />} />
                <Route path="/connect" element={<ConnectScreen />} />
                <Route path="/discover" element={<DiscoverScreen />} />
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
      </div>
    </HashRouter>
  );
}