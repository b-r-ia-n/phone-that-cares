import { motion } from 'motion/react';
import { ArrowLeft, Camera, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router';
import AndroidStatusBar from './AndroidStatusBar';

interface NotificationGroup {
  id: string;
  app: string;
  icon: any;
  time: string;
  primary: string;
  secondary: string[];
  moreCount?: number;
  section: 'today' | 'earlier';
}

const notificationGroups: NotificationGroup[] = [
  {
    id: '1',
    app: 'INSTAGRAM',
    icon: Camera,
    time: '15 min',
    primary: 'Caroline and 12 others liked your post',
    secondary: [
      '@surflinechronicles started following you',
      'New message request from @clay_studio_sf',
    ],
    moreCount: 5,
    section: 'today',
  },
  {
    id: '2',
    app: 'TWITTER/X',
    icon: MessageSquare,
    time: '45 min',
    primary: 'Vitalik Buterin and 3 others liked your reply',
    secondary: [
      '@patio11 replied to your thread',
      '2 new followers',
    ],
    moreCount: 8,
    section: 'today',
  },
  {
    id: '3',
    app: 'YOUTUBE',
    icon: MessageSquare,
    time: '1 hour',
    primary: "Kelly Slater Official uploaded: 'Pipeline, final heat'",
    secondary: [
      '3 channels you follow posted this week',
    ],
    section: 'today',
  },
  {
    id: '4',
    app: 'SUBSTACK',
    icon: MessageSquare,
    time: '2 hours',
    primary: "New post from Robin Sloan: 'An app can be a home-cooked meal'",
    secondary: [
      '2 writers you follow published this week',
    ],
    section: 'today',
  },
  {
    id: '5',
    app: 'REDDIT',
    icon: MessageSquare,
    time: 'yesterday',
    primary: 'Your post in r/surfing got 47 upvotes',
    secondary: [
      '3 replies to your comment in r/ceramics',
    ],
    section: 'earlier',
  },
  {
    id: '6',
    app: 'INSTAGRAM',
    icon: Camera,
    time: 'yesterday',
    primary: 'Jamie and 6 others liked your story',
    secondary: [
      'New comment on your post from @seaglass_studio',
    ],
    section: 'earlier',
  },
];

export default function NotificationsScreen() {
  const navigate = useNavigate();

  const todayGroups = notificationGroups.filter((n) => n.section === 'today');
  const earlierGroups = notificationGroups.filter((n) => n.section === 'earlier');

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Android Status Bar */}
      <AndroidStatusBar />

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/30 via-transparent to-transparent" />

      {/* Header */}
      <div className="relative z-10 px-6 pt-14 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/discover')}
            className="text-white/60 hover:text-white/90 transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <h1
            className="text-2xl font-light tracking-tight text-white/95"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Notifications
          </h1>
        </div>

        <button
          className="text-xs text-white/50 hover:text-white/80 transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Clear all
        </button>
      </div>

      {/* Notifications list */}
      <div className="relative z-10 px-6 pb-8 overflow-y-auto h-[calc(100vh-120px)]">
        {/* Today section */}
        <div className="mb-6">
          <div
            className="text-[10px] tracking-[0.15em] uppercase text-white/30 mb-3"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            TODAY
          </div>
          <div className="space-y-3">
            {todayGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <group.icon size={14} strokeWidth={1.5} className="text-white/40" />
                    <span
                      className="text-[10px] tracking-[0.12em] uppercase text-white/40"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {group.app}
                    </span>
                  </div>
                  <span
                    className="text-[11px] text-white/30"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {group.time}
                  </span>
                </div>

                {/* Primary notification */}
                <p
                  className="text-[15px] text-white/70 leading-relaxed mb-2"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {group.primary}
                </p>

                {/* Secondary notifications */}
                {group.secondary.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {group.secondary.map((secondary, idx) => (
                      <p
                        key={idx}
                        className="text-xs text-white/50 leading-relaxed pl-2"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {secondary}
                      </p>
                    ))}
                  </div>
                )}

                {/* More count */}
                {group.moreCount && (
                  <div className="flex justify-end">
                    <span
                      className="text-xs text-white/40 hover:text-white/60 transition-colors"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      + {group.moreCount} more
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Earlier section */}
        <div>
          <div
            className="text-[10px] tracking-[0.15em] uppercase text-white/30 mb-3"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            EARLIER
          </div>
          <div className="space-y-3">
            {earlierGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (todayGroups.length + index) * 0.05 }}
                className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <group.icon size={14} strokeWidth={1.5} className="text-white/40" />
                    <span
                      className="text-[10px] tracking-[0.12em] uppercase text-white/40"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {group.app}
                    </span>
                  </div>
                  <span
                    className="text-[11px] text-white/30"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {group.time}
                  </span>
                </div>

                {/* Primary notification */}
                <p
                  className="text-[15px] text-white/70 leading-relaxed mb-2"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {group.primary}
                </p>

                {/* Secondary notifications */}
                {group.secondary.length > 0 && (
                  <div className="space-y-1">
                    {group.secondary.map((secondary, idx) => (
                      <p
                        key={idx}
                        className="text-xs text-white/50 leading-relaxed pl-2"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {secondary}
                      </p>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
