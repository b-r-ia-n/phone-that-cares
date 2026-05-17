import { motion } from 'motion/react';
import { ArrowLeft, CloudSun, Phone, MessageSquare, Camera, Sprout } from 'lucide-react';
import {
  SiGmail,
  SiGooglecalendar,
  SiGooglemaps,
  SiGooglephotos,
  SiSpotify,
  SiGooglekeep,
  SiUber,
  SiVenmo,
  SiInstagram,
  SiYoutube,
  SiWhatsapp,
  SiSignal,
  SiSlack,
  SiChase,
  SiAirbnb,
  SiGooglechrome,
} from 'react-icons/si';
import { useNavigate } from 'react-router';
import AndroidStatusBar from './AndroidStatusBar';

const apps = [
  // Row 1
  { id: 1, name: 'Gmail', icon: SiGmail, color: '#EA4335' },
  { id: 2, name: 'Calendar', icon: SiGooglecalendar, color: '#4285F4' },
  { id: 3, name: 'Maps', icon: SiGooglemaps, color: '#4285F4' },
  { id: 4, name: 'Weather', icon: CloudSun, color: '#5AC8FA' },
  // Row 2
  { id: 5, name: 'Photos', icon: SiGooglephotos, color: '#4285F4' },
  { id: 6, name: 'Spotify', icon: SiSpotify, color: '#1DB954' },
  { id: 7, name: 'Keep', icon: SiGooglekeep, color: '#FFBB00' },
  { id: 8, name: 'Uber', icon: SiUber, color: '#2a2a2a' },
  // Row 3
  { id: 9, name: 'Venmo', icon: SiVenmo, color: '#3D95CE' },
  { id: 10, name: 'Instagram', icon: SiInstagram, color: '#E4405F' },
  { id: 11, name: 'YouTube', icon: SiYoutube, color: '#FF0000' },
  { id: 12, name: 'WhatsApp', icon: SiWhatsapp, color: '#25D366' },
  // Row 4
  { id: 13, name: 'Signal', icon: SiSignal, color: '#3A76F0' },
  { id: 14, name: 'Slack', icon: SiSlack, color: '#4A154B' },
  { id: 15, name: 'Chase', icon: SiChase, color: '#117ACA' },
  { id: 16, name: 'Airbnb', icon: SiAirbnb, color: '#FF5A5F' },
  { id: 17, name: 'Discover', icon: Sprout, color: '#F5C563', route: '/sessions' },
];

const dockApps = [
  { id: 'phone', name: 'Phone', icon: Phone, color: '#30D158' },
  { id: 'messages', name: 'Messages', icon: MessageSquare, color: '#0A84FF' },
  { id: 'chrome', name: 'Chrome', icon: SiGooglechrome, color: '#4285F4' },
  { id: 'camera', name: 'Camera', icon: Camera, color: '#8E8E93' },
];

export default function HomeScreen() {
  const navigate = useNavigate();

  const timeString = '11:11';

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 via-transparent to-transparent" />

      {/* Android Status Bar */}
      <AndroidStatusBar />

      {/* Header with time */}
      <div className="relative z-10 px-6 pt-12">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-white/60 hover:text-white/90 transition-colors"
          >
            <ArrowLeft size={24} strokeWidth={1.5} />
          </button>
          <div
            className="text-xl font-light text-white/70"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {timeString}
          </div>
        </div>
      </div>

      {/* App grid */}
      <div className="relative z-10 px-8 pb-[120px]">
        <div className="grid grid-cols-4 gap-6">
          {apps.map((app, index) => (
            <motion.button
              key={app.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              className="flex flex-col items-center gap-2 group"
              onClick={() => { if ('route' in app && app.route) navigate(app.route); }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                style={{ backgroundColor: app.color }}
              >
                <app.icon size={30} className="text-white" />
              </div>
              <span
                className="text-xs text-white/70 group-hover:text-white/90 transition-colors text-center whitespace-nowrap h-4 leading-4"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {app.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Dock */}
      <div className="absolute bottom-[50px] left-0 right-0 z-20 px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 border border-white/20"
        >
          <div className="flex justify-around items-center">
            {dockApps.map((app) => (
              <button
                key={app.id}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                  style={{ backgroundColor: app.color }}
                >
                  <app.icon size={26} className="text-white" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
