import { motion } from 'motion/react';
import { Search, ArrowLeft, MessageSquarePlus } from 'lucide-react';
import {
  SiWhatsapp,
  SiSignal,
  SiInstagram,
  SiTelegram,
  SiMessenger,
  SiSubstack,
  SiGooglemessages,
  SiImessage,
} from 'react-icons/si';
import { useNavigate } from 'react-router';
import AndroidStatusBar from './AndroidStatusBar';

type Platform = 'sms' | 'imessage' | 'whatsapp' | 'messenger' | 'signal' | 'instagram' | 'telegram' | 'substack';

interface Message {
  id: string;
  name: string;
  avatar: string;
  imageUrl?: string;
  platform: Platform;
  preview: string;
  timeSince: string;
}

const mockMessages: Message[] = [
  {
    id: '1',
    name: 'Caroline',
    avatar: '👩‍🎨',
    imageUrl: 'https://images.unsplash.com/photo-1490087763596-862a8bfcc16c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwbmF0dXJhbCUyMGxpZ2h0fGVufDF8fHx8MTc3NjE4Njg0Nnww&ixlib=rb-4.1.0&q=80&w=400',
    platform: 'sms',
    preview: 'Did you see the photos from last weekend?',
    timeSince: '2 min',
  },
  {
    id: '2',
    name: 'Marcus',
    avatar: '🧑‍💻',
    platform: 'signal',
    preview: 'Thanks for the recommendation!',
    timeSince: '1 day',
  },
  {
    id: '3',
    name: 'Mom',
    avatar: '👩',
    imageUrl: 'https://images.unsplash.com/photo-1538333244582-5edcaa3bf37b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb20lMjBjYXN1YWwlMjBwaG90byUyMGZhbWlseSUyMHNuYXBzaG90fGVufDF8fHx8MTc3NjE4Njk5OHww&ixlib=rb-4.1.0&q=80&w=400',
    platform: 'sms',
    preview: 'Call me when you get a chance',
    timeSince: '3 days',
  },
  {
    id: '4',
    name: 'Dev Group',
    avatar: '💬',
    platform: 'signal',
    preview: 'Meeting at 3pm tomorrow',
    timeSince: '5 hours',
  },
  {
    id: '5',
    name: 'Jamie',
    avatar: '🌊',
    imageUrl: 'https://images.unsplash.com/photo-1687807035772-a7b7ccb0ef62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxwZXJzb24lMjBvdXRkb29ycyUyMHBvcnRyYWl0JTIwY2FzdWFsfGVufDF8fHx8MTc3NjE4Njg0N3ww&ixlib=rb-4.1.0&q=80&w=400',
    platform: 'whatsapp',
    preview: 'Sent you a reel',
    timeSince: '2 weeks',
  },
  {
    id: '6',
    name: 'Alex',
    avatar: '🎭',
    imageUrl: 'https://images.unsplash.com/photo-1560195829-1de13cf1f86a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHx5b3NlbWl0ZSUyMG1vdW50YWluJTIwcGVhayUyMGdyYW5pdGV8ZW58MXx8fHwxNzc2MTg3MDAzfDA&ixlib=rb-4.1.0&q=80&w=400',
    platform: 'instagram',
    preview: 'You: See you then!',
    timeSince: '4 months',
  },
  {
    id: '7',
    name: 'Jordan',
    avatar: '🎨',
    imageUrl: 'https://images.unsplash.com/photo-1768471125958-78556538fadc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxjcmVhdGl2ZSUyMHBlcnNvbiUyMGFydGlzdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NjE4Njg0N3ww&ixlib=rb-4.1.0&q=80&w=400',
    platform: 'substack',
    preview: 'That article was great',
    timeSince: '1 week',
  },
  {
    id: '8',
    name: 'Taylor',
    avatar: '🏃',
    platform: 'whatsapp',
    preview: 'Up for a run this weekend?',
    timeSince: '6 days',
  },
  {
    id: '9',
    name: 'Sam',
    avatar: '🎸',
    platform: 'signal',
    preview: 'Band practice Thursday?',
    timeSince: '2 weeks',
  },
  {
    id: '10',
    name: 'Dana',
    avatar: '📚',
    platform: 'telegram',
    preview: 'You: Finished the book!',
    timeSince: '3 weeks',
  },
  {
    id: '11',
    name: 'Riley',
    avatar: '☕',
    platform: 'imessage',
    preview: 'Coffee shop closed early today',
    timeSince: '1 month',
  },
  {
    id: '12',
    name: 'Chris',
    avatar: '🚴',
    platform: 'messenger',
    preview: 'Still on for the ride?',
    timeSince: '5 weeks',
  },
];

const platformConfig: Record<Platform, { icon: typeof SiWhatsapp; color: string }> = {
  sms: { icon: SiGooglemessages, color: '#1A73E8' },
  imessage: { icon: SiImessage, color: '#0A84FF' },
  whatsapp: { icon: SiWhatsapp, color: '#25D366' },
  messenger: { icon: SiMessenger, color: '#0084FF' },
  signal: { icon: SiSignal, color: '#3A76F0' },
  instagram: { icon: SiInstagram, color: '#E4405F' },
  telegram: { icon: SiTelegram, color: '#26A5E4' },
  substack: { icon: SiSubstack, color: '#FF6719' },
};

export default function ConnectScreen() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a]">
      {/* Android Status Bar */}
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
            Connect
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-white/60 hover:text-white/90 transition-colors">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <button
            className="w-8 h-8 rounded-full bg-cover bg-center border border-white/20"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1569379394746-0d3698f9d828?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBjYXN1YWwlMjBzZWxmaWUlMjBuYXR1cmFsfGVufDF8fHx8MTc3NjE4Njk5OHww&ixlib=rb-4.1.0&q=80&w=400)' }}
          />
        </div>
      </div>

      {/* Messages list */}
      <div className="relative z-10 px-6 pb-8 overflow-y-auto h-[calc(100%-140px)]">
        {mockMessages.map((message, index) => {
          const PlatformIcon = platformConfig[message.platform].icon;
          const platformColor = platformConfig[message.platform].color;
          return (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="py-2"
          >
            {/* Single rounded rectangle with vertical divider */}
            <div className="flex items-center rounded-2xl bg-white/[0.05] overflow-hidden">
              {/* Left zone - Person photo */}
              <button
                onClick={() => navigate(`/about/${message.id}`)}
                className="w-16 h-16 flex items-center justify-center flex-shrink-0 hover:bg-white/[0.03] transition-all"
              >
                <div className="relative">
                  {message.imageUrl ? (
                    <div
                      className="w-12 h-12 rounded-full bg-cover bg-center border border-white/10"
                      style={{ backgroundImage: `url(${message.imageUrl})` }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-xl">
                      {message.avatar}
                    </div>
                  )}
                  {/* Platform badge */}
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center ring-2 ring-[#0a0a0a]"
                    style={{ backgroundColor: platformColor }}
                  >
                    <PlatformIcon size={10} className="text-white" />
                  </div>
                </div>
              </button>

              {/* Vertical divider */}
              <div className="w-[1px] h-12 bg-white/[0.12] flex-shrink-0" />

              {/* Right zone - Message content */}
              <button
                onClick={() => navigate(`/conversation/${message.id}`)}
                className="flex-1 p-3 min-w-0 hover:bg-white/[0.03] transition-all"
              >
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <h3 className="font-medium text-white/90 truncate text-[15px]" style={{ fontFamily: 'var(--font-body)' }}>
                    {message.name}
                  </h3>
                  <span className="text-[11px] text-white/30 flex-shrink-0">{message.timeSince}</span>
                </div>
                <p className="text-[13px] text-white/50 truncate text-left" style={{ fontFamily: 'var(--font-body)' }}>
                  {message.preview}
                </p>
              </button>
            </div>
          </motion.div>
          );
        })}

        {/* Callout card - appears in scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 mb-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10"
        >
          <p className="text-sm text-white/70 mb-2" style={{ fontFamily: 'var(--font-body)' }}>
            You haven't talked to Marcus in 6 weeks — you two usually vibe.
          </p>
          <button
            onClick={() => navigate('/think-out-loud/marcus')}
            className="text-sm text-white/90 hover:text-white transition-colors underline decoration-dotted"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Think out loud about it →
          </button>
        </motion.div>
      </div>

      {/* Floating action button - new message */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-6 right-6 z-30 w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <MessageSquarePlus size={24} strokeWidth={1.5} className="text-white/90" />
      </motion.button>
    </div>
  );
}
