import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Send, Bookmark, Repeat, ThumbsUp, Play, Music, Search, PlusSquare, Clapperboard, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import AndroidStatusBar from './AndroidStatusBar';
import { getScrollApp } from '../data/scrollApps';
import { useSessionsStore, getProgress } from '../store/sessionsStore';
import {
  getModeFilter,
  getExtraGap,
  getBreakCardFrequency,
  getFontCycleFrequency,
  formatMinutes,
} from '../lib/modes';
import { mockFeedsByApp } from '../data/mockFeeds';
import type { FeedItem } from '../data/mockFeeds';
import { useSessionTimer } from '../hooks/useSessionTimer';

const ASCII_ART = [
  `
     .  *  .    .   *
  .    _____     .
 .   /     \\   .   *
    /  . .  \\    .
   |  ' _ '  |  .
    \\       /
  .  \\_____/   .  *
  *     .    .    .
  `,
  `
    ~ ~ ~ ~ ~ ~ ~
   ~   ~   ~   ~
  ~ ~ ~ ~ ~ ~ ~ ~
   ~   ~   ~   ~
  ~ ~ ~ ~ ~ ~ ~ ~
   ~   ~   ~   ~
    ~ ~ ~ ~ ~ ~ ~
  `,
  `
        |
       /|\\
      / | \\
     /  |  \\
    /   |   \\
   /____|____\\
       |||
       |||
  ~~~~~~~~~~~~~
  `,
  `
  . . . . . . . .
  .               .
  .    O    O     .
  .               .
  .      __       .
  .    /    \\     .
  .               .
  . . . . . . . .
  `,
  `
      *    .   *
   .    *    .   .
  *   .   *   .  *
   .    .   *   .
  *  .   *    . *
   .   *   .  *
      .  *   .
  `,
];

const BREAK_PROMPTS = [
  'How are you doing?',
  'Still here.',
  'Take a breath if you want.',
  'No rush.',
  'Just noticing.',
];

const mockStories = [
  { name: 'Your story', color: '#333', hasRing: false, imageUrl: 'https://images.unsplash.com/photo-1569379394746-0d3698f9d828?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBjYXN1YWwlMjBzZWxmaWUlMjBuYXR1cmFsfGVufDF8fHx8MTc3NjE4Njk5OHww&ixlib=rb-4.1.0&q=80&w=400' },
  { name: 'caroline.k', color: '#C13584', hasRing: true, imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
  { name: 'miketheb...', color: '#C13584', hasRing: true, imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { name: 'ceramics...', color: '#F77737', hasRing: true, imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { name: 'tides.and...', color: '#C13584', hasRing: true, imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=100&q=80' },
];

export default function SessionAppScreen() {
  const navigate = useNavigate();
  const { appId } = useParams<{ appId: string }>();
  const app = getScrollApp(appId);
  const session = useSessionsStore((s) => (appId ? s.sessions[appId] : undefined));

  useSessionTimer(appId);

  if (!app || !appId || !session) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-white/50 text-sm">Unknown app.</p>
      </div>
    );
  }

  const progress = getProgress(session);
  const mode = session.mode;

  const filterStyle = getModeFilter(mode, progress);
  const extraGap = getExtraGap(mode, progress);
  const breakFreq = getBreakCardFrequency(mode, progress);
  const fontFreq = getFontCycleFrequency(mode, progress);

  const items = mockFeedsByApp[appId] ?? [];

  const rendered = useMemo(() => {
    const out: Array<{ kind: 'item'; item: FeedItem; index: number } | { kind: 'break'; id: string; artIndex: number }> = [];
    let breakCount = 0;
    items.forEach((item, i) => {
      out.push({ kind: 'item', item, index: i });
      if (breakFreq > 0 && (i + 1) % breakFreq === 0) {
        out.push({ kind: 'break', id: `break-${i}`, artIndex: breakCount });
        breakCount++;
      }
    });
    return out;
  }, [items, breakFreq]);

  const isInstagram = appId === 'instagram';

  const minutesOnly = (ms: number) => {
    const min = Math.floor(ms / 60000);
    return `${min}m`;
  };

  if (isInstagram) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-black flex flex-col">
        <AndroidStatusBar />

        {/* Instagram header */}
        <div className="relative z-10 px-4 pt-11 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <img
              src="/os-mock-sessions/instagram-logo.png"
              alt="Instagram"
              className="h-[28px] w-auto"
            />
          </div>
          <div className="flex items-center gap-5">
            {mode !== 'off' && session.timeSpentTodayMs > 0 && (
              <button
                onClick={() => navigate(`/sessions/treatments/${appId}`)}
                className="flex items-center gap-1 text-white/20 hover:text-white/35 transition-colors"
              >
                <Clock size={12} strokeWidth={1.5} />
                <span className="text-[10px]" style={{ fontFamily: 'var(--font-body)' }}>
                  {minutesOnly(session.timeSpentTodayMs)}
                </span>
              </button>
            )}
            <Heart size={22} strokeWidth={1.6} className="text-white" />
            <Send size={22} strokeWidth={1.6} className="text-white" />
          </div>
        </div>

        {/* Feed area */}
        <div
          className="flex-1 overflow-y-auto scrollbar-hide"
          style={filterStyle}
        >
          {/* Stories row */}
          <div className="flex gap-3 px-3 py-3 overflow-x-auto scrollbar-hide border-b border-white/[0.06]">
            {mockStories.map((story, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0 w-16">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    story.hasRing ? 'p-[2px]' : ''
                  }`}
                  style={story.hasRing ? {
                    background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                  } : undefined}
                >
                  <div
                    className="w-full h-full rounded-full bg-cover bg-center border-2 border-black"
                    style={story.imageUrl
                      ? { backgroundImage: `url(${story.imageUrl})` }
                      : { backgroundColor: '#1a1a1a' }
                    }
                  >
                    {!story.imageUrl && (
                      <div className="w-full h-full rounded-full flex items-center justify-center text-white/60 text-lg">
                        {story.name[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-white/60 truncate w-full text-center">
                  {story.name}
                </span>
              </div>
            ))}
          </div>

          {/* Feed */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col"
            style={{ gap: `${extraGap}px` }}
          >
            {rendered.map((row) => {
              if (row.kind === 'break') {
                return <InstagramBreakCard key={row.id} artIndex={row.artIndex} />;
              }
              const altFont =
                fontFreq > 0 && row.index % fontFreq === 0
                  ? 'Georgia, serif'
                  : 'var(--font-body)';
              return (
                <InstagramCard
                  key={row.item.id}
                  item={row.item}
                  fontFamily={altFont}
                  accent={app.color}
                />
              );
            })}

            <div className="text-[10px] text-white/20 text-center py-8">
              You&apos;re all caught up
            </div>
          </motion.div>
        </div>

        {/* Instagram bottom nav */}
        <div className="relative z-10 flex items-center justify-around px-4 py-2.5 border-t border-white/[0.08] bg-black">
          <button className="p-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M9.005 16.545a2.997 2.997 0 012.997-2.997h0A2.997 2.997 0 0115 16.545V22h7V11.543L12 2 2 11.543V22h7.005z" stroke="white" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
          <button className="p-2">
            <Search size={22} strokeWidth={1.6} className="text-white/60" />
          </button>
          <button className="p-2">
            <PlusSquare size={22} strokeWidth={1.6} className="text-white/60" />
          </button>
          <button className="p-2">
            <Clapperboard size={22} strokeWidth={1.6} className="text-white/60" />
          </button>
          <button className="p-2">
            <div
              className="w-6 h-6 rounded-full bg-cover bg-center border border-white/30"
              style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1569379394746-0d3698f9d828?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=80)' }}
            />
          </button>
        </div>
      </div>
    );
  }

  const isX = appId === 'x';

  if (isX) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-black flex flex-col">
        <AndroidStatusBar />

        {/* X header */}
        <div className="relative z-10 px-4 pt-11 pb-0 flex items-center justify-between">
          <div
            className="w-8 h-8 rounded-full bg-cover bg-center bg-white/10"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1569379394746-0d3698f9d828?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBjYXN1YWwlMjBzZWxmaWUlMjBuYXR1cmFsfGVufDF8fHx8MTc3NjE4Njk5OHww&ixlib=rb-4.1.0&q=80&w=400)' }}
          />
          <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <div className="flex items-center gap-3">
            {mode !== 'off' && session.timeSpentTodayMs > 0 && (
              <button
                onClick={() => navigate(`/sessions/treatments/${appId}`)}
                className="flex items-center gap-1 text-white/20 hover:text-white/35 transition-colors"
              >
                <Clock size={12} strokeWidth={1.5} />
                <span className="text-[10px]" style={{ fontFamily: 'var(--font-body)' }}>
                  {minutesOnly(session.timeSpentTodayMs)}
                </span>
              </button>
            )}
            <svg viewBox="0 0 24 24" width="18" height="18" fill="white" opacity="0.5">
              <path d="M10.54 1.75h2.92l1.57 2.36c.11.17.32.25.53.21l2.53-.59 2.17 2.17-.59 2.53c-.04.21.04.42.21.53l2.36 1.57v2.92l-2.36 1.57c-.17.11-.25.32-.21.53l.59 2.53-2.17 2.17-2.53-.59c-.21-.04-.42.04-.53.21l-1.57 2.36h-2.92l-1.57-2.36c-.11-.17-.32-.25-.53-.21l-2.53.59-2.17-2.17.59-2.53c.04-.21-.04-.42-.21-.53L1.75 13.46v-2.92l2.36-1.57c.17-.11.25-.32.21-.53l-.59-2.53 2.17-2.17 2.53.59c.21.04.42-.04.53-.21zm1.46 5.33a4.93 4.93 0 100 9.86 4.93 4.93 0 000-9.86z" />
            </svg>
          </div>
        </div>

        {/* Tab bar */}
        <div className="relative z-10 flex border-b border-white/[0.08] mt-2">
          <button className="flex-1 py-3 text-center">
            <span className="text-[14px] font-bold text-white border-b-2 border-[#1D9BF0] pb-3 px-2">For you</span>
          </button>
          <button className="flex-1 py-3 text-center">
            <span className="text-[14px] text-white/50 pb-3 px-2">Following</span>
          </button>
        </div>

        {/* Feed */}
        <div
          className="flex-1 overflow-y-auto scrollbar-hide"
          style={mode === 'feed-blur' ? undefined : filterStyle}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col"
            style={{ gap: `${extraGap}px` }}
          >
            {rendered.map((row) => {
              if (row.kind === 'break') {
                return <BreakCard key={row.id} accent={app.color} />;
              }
              const altFont =
                fontFreq > 0 && row.index % fontFreq === 0
                  ? 'Georgia, serif'
                  : 'var(--font-body)';
              const tweetBlur =
                mode === 'feed-blur' && row.index > 0 && row.index % 12 === 0
                  ? 3.5
                  : 0;
              return (
                <XCard
                  key={row.item.id}
                  item={row.item}
                  fontFamily={altFont}
                  blurPx={tweetBlur}
                />
              );
            })}
          </motion.div>
        </div>

        {/* X bottom nav */}
        <div className="relative z-10 flex items-center justify-around px-2 py-2.5 border-t border-white/[0.08] bg-black">
          <button className="p-2">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
              <path d="M12 1.696L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696zM12 16.5c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5z" />
            </svg>
          </button>
          <button className="p-2">
            <Search size={22} strokeWidth={1.8} className="text-white/50" />
          </button>
          <button className="p-2">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="white" opacity="0.5">
              <path d="M10.54 1.75h2.92l1.57 2.36c.11.17.32.25.53.21l2.53-.59 2.17 2.17-.59 2.53c-.04.21.04.42.21.53l2.36 1.57v2.92l-2.36 1.57c-.17.11-.25.32-.21.53l.59 2.53-2.17 2.17-2.53-.59c-.21-.04-.42.04-.53-.21l-1.57 2.36h-2.92l-1.57-2.36c-.11-.17-.32-.25-.53-.21l-2.53.59-2.17-2.17.59-2.53c.04-.21-.04-.42-.21-.53L1.75 13.46v-2.92l2.36-1.57c.17-.11.25-.32.21-.53l-.59-2.53 2.17-2.17 2.53.59c.21.04.42-.04.53-.21zm1.46 5.33a4.93 4.93 0 100 9.86 4.93 4.93 0 000-9.86z" />
            </svg>
          </button>
          <button className="p-2">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="white" opacity="0.5">
              <path d="M19.993 9.042C19.48 5.017 16.054 2 11.996 2s-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.435-1.718 4.9-4h4.236zM12 20c-1.306 0-2.417-.835-2.829-2h5.658c-.412 1.165-1.523 2-2.829 2zm-6.866-4l1.077-8.22C6.624 4.843 9.086 3 12 3s5.376 1.843 5.79 4.775L18.866 16z" />
            </svg>
          </button>
          <button className="p-2">
            <MessageCircle size={22} strokeWidth={1.8} className="text-white/50" />
          </button>
        </div>
      </div>
    );
  }

  // Other apps keep the generic layout
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a] flex flex-col">
      <AndroidStatusBar />

      <div className="relative z-10 px-5 pt-12 pb-3 flex items-center justify-between border-b border-white/[0.05]">
        <button
          onClick={() => navigate('/sessions')}
          className="text-white/60 hover:text-white/90 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>

        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: app.color }}
          >
            <app.icon size={15} color="white" />
          </div>
          <h1
            className="text-sm font-medium text-white/90"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {app.name}
          </h1>
        </div>

        <button
          onClick={() => navigate(`/sessions/treatments/${appId}`)}
          className="text-[11px] text-white/50 hover:text-white/85 transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {formatMinutes(session.timeSpentTodayMs)}
        </button>
      </div>

      {mode !== 'off' && (
        <div className="h-[2px] w-full bg-white/[0.04]">
          <div
            className="h-full transition-all"
            style={{
              width: `${Math.round(progress * 100)}%`,
              backgroundColor: app.color,
            }}
          />
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto scrollbar-hide"
        style={filterStyle}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col py-3 px-4"
          style={{ gap: `${16 + extraGap}px` }}
        >
          {rendered.map((row) => {
            if (row.kind === 'break') {
              return <BreakCard key={row.id} accent={app.color} />;
            }
            const altFont =
              fontFreq > 0 && row.index % fontFreq === 0
                ? 'Georgia, serif'
                : 'var(--font-body)';
            return (
              <FeedCard
                key={row.item.id}
                item={row.item}
                appId={appId}
                fontFamily={altFont}
                accent={app.color}
              />
            );
          })}

          <div
            className="text-[10px] text-white/25 text-center pt-4 pb-10"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            End of feed
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InstagramBreakCard({ artIndex }: { artIndex: number }) {
  const art = ASCII_ART[artIndex % ASCII_ART.length];
  const prompt = BREAK_PROMPTS[artIndex % BREAK_PROMPTS.length];
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 bg-black min-h-[420px]">
      <pre className="text-white/20 text-[11px] leading-tight font-mono text-center whitespace-pre mb-8">
        {art}
      </pre>
      <p className="text-[13px] text-white/40 text-center" style={{ fontFamily: 'var(--font-body)' }}>
        {prompt}
      </p>
    </div>
  );
}

function BreakCard({ accent }: { accent: string }) {
  return (
    <div
      className="rounded-2xl p-5 border border-white/[0.08] bg-white/[0.03] flex flex-col items-center text-center"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      <div
        className="w-2 h-2 rounded-full mb-3"
        style={{ backgroundColor: accent }}
      />
      <p className="text-sm text-white/75">How are you doing?</p>
      <p className="text-[11px] text-white/40 mt-1">Nothing to do. Just noticing.</p>
    </div>
  );
}

interface FeedCardProps {
  item: FeedItem;
  appId: string;
  fontFamily: string;
  accent: string;
}

function FeedCard({ item, appId, fontFamily, accent }: FeedCardProps) {
  if (appId === 'x') return <XCard item={item} fontFamily={fontFamily} />;
  if (appId === 'youtube') return <YouTubeCard item={item} fontFamily={fontFamily} />;
  if (appId === 'reddit') return <RedditCard item={item} fontFamily={fontFamily} accent={accent} />;
  if (appId === 'substack') return <SubstackCard item={item} fontFamily={fontFamily} />;
  return null;
}

function AspectBox({
  ratio,
  imageUrl,
  isVideo,
}: {
  ratio: FeedItem['aspectRatio'];
  imageUrl?: string;
  isVideo?: boolean;
}) {
  const aspectClass =
    ratio === 'tall' ? 'aspect-[9/14]' : ratio === 'wide' ? 'aspect-[16/9]' : 'aspect-square';
  return (
    <div
      className={`relative w-full ${aspectClass} rounded-xl overflow-hidden bg-white/[0.04] bg-cover bg-center`}
      style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
    >
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <Play size={20} fill="white" className="text-white ml-0.5" />
          </div>
        </div>
      )}
    </div>
  );
}

function InstagramCard({
  item,
  fontFamily,
  accent,
}: {
  item: FeedItem;
  fontFamily: string;
  accent: string;
}) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const images = item.imageUrls ?? (item.imageUrl ? [item.imageUrl] : []);
  const hasCarousel = images.length > 1;
  const currentImage = images[carouselIndex] ?? images[0];

  const formatLikes = (n?: number) => {
    if (!n) return null;
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
    return n.toLocaleString();
  };

  return (
    <div className="flex flex-col pb-2">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-semibold bg-gradient-to-br from-white/15 to-white/5"
        >
          {item.handle?.[1]?.toUpperCase() ?? '·'}
        </div>
        <span className="text-[13px] font-semibold text-white" style={{ fontFamily }}>
          {item.handle?.replace('@', '')}
        </span>
        <div className="flex-1" />
        <span className="text-white/50 text-lg leading-none">···</span>
      </div>

      {/* Image — full width, no rounding */}
      <div className="relative">
        <div
          className="w-full aspect-square bg-cover bg-center bg-[#111]"
          style={currentImage ? { backgroundImage: `url(${currentImage})` } : undefined}
        >
          {item.isVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <Play size={22} fill="white" className="text-white ml-0.5" />
              </div>
            </div>
          )}
        </div>
        {hasCarousel && (
          <>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === carouselIndex ? 'bg-[#0095F6]' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
            {carouselIndex < images.length - 1 && (
              <button
                onClick={() => setCarouselIndex((p) => p + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 text-sm"
              >
                ›
              </button>
            )}
            {carouselIndex > 0 && (
              <button
                onClick={() => setCarouselIndex((p) => p - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 text-sm"
              >
                ‹
              </button>
            )}
          </>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-4 px-3 pt-2.5 pb-1 text-white">
        <Heart size={22} strokeWidth={1.6} />
        <MessageCircle size={22} strokeWidth={1.6} />
        <Send size={22} strokeWidth={1.6} />
        <div className="flex-1" />
        <Bookmark size={22} strokeWidth={1.6} />
      </div>

      {/* Like count */}
      {item.likes && (
        <p className="text-[13px] font-semibold text-white px-3" style={{ fontFamily }}>
          {formatLikes(item.likes)} likes
        </p>
      )}

      {/* Caption */}
      {item.body && (
        <p className="text-[13px] text-white/80 leading-snug px-3 mt-0.5" style={{ fontFamily }}>
          <span className="text-white font-semibold mr-1">{item.handle?.replace('@', '')}</span>
          {item.body}
        </p>
      )}

      {/* Comments preview */}
      {item.comments && item.comments.length > 0 && (
        <div className="flex flex-col gap-0 px-3 mt-1">
          {item.commentCount && item.commentCount > (item.comments?.length ?? 0) && (
            <p className="text-[13px] text-white/40 mb-0.5" style={{ fontFamily }}>
              View all {item.commentCount} comments
            </p>
          )}
          {item.comments.map((c, i) => (
            <p key={i} className="text-[13px] text-white/70 leading-snug" style={{ fontFamily }}>
              <span className="text-white font-semibold mr-1">{c.handle.replace('@', '')}</span>
              {c.text}
            </p>
          ))}
        </div>
      )}

      {/* Song attribution */}
      {item.song && (
        <div className="flex items-center gap-1.5 px-3 mt-1">
          <Music size={10} strokeWidth={2} className="text-white/40" />
          <span className="text-[11px] text-white/40" style={{ fontFamily }}>
            {item.song}
          </span>
        </div>
      )}
    </div>
  );
}

function XCard({ item, fontFamily, blurPx = 0 }: { item: FeedItem; fontFamily: string; blurPx?: number }) {
  const formatCount = (n?: number) => {
    if (!n) return '';
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
    return n.toString();
  };

  const timePart = item.meta?.split('·')[0]?.trim() ?? '';
  const repostCount = item.meta?.match(/([\d.]+[kK]?)\s*reposts/)?.[1] ?? '';

  return (
    <div
      className="flex gap-2.5 px-4 py-3 border-b border-white/[0.06]"
      style={blurPx > 0 ? { filter: `blur(${blurPx}px)` } : undefined}
    >
      <div
        className="w-10 h-10 rounded-full bg-cover bg-center bg-white/10 flex-shrink-0"
        style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined}
      >
        {!item.imageUrl && (
          <div className="w-full h-full rounded-full flex items-center justify-center text-white/70 text-sm font-semibold">
            {item.author?.[0] ?? '·'}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 leading-tight">
          <span className="text-[14px] font-bold text-white truncate" style={{ fontFamily }}>
            {item.author}
          </span>
          <span className="text-[13px] text-white/40 truncate" style={{ fontFamily }}>
            {item.handle}
          </span>
          <span className="text-white/30 text-[13px]">·</span>
          <span className="text-[13px] text-white/40 flex-shrink-0">{timePart}</span>
          <div className="flex-1" />
          <span className="text-white/30 text-lg leading-none flex-shrink-0">···</span>
        </div>
        <p
          className="text-[15px] text-white leading-[1.35] mt-0.5"
          style={{ fontFamily }}
        >
          {item.body}
        </p>
        {item.imageUrls && item.imageUrls.length > 0 && (
          <div
            className="mt-2.5 w-full aspect-[16/9] rounded-2xl bg-cover bg-center border border-white/[0.08]"
            style={{ backgroundImage: `url(${item.imageUrls[0]})` }}
          />
        )}
        <div className="flex items-center justify-between mt-2.5 text-white/40 max-w-[85%]">
          <div className="flex items-center gap-1">
            <MessageCircle size={15} strokeWidth={1.5} />
            <span className="text-[12px]">{item.commentCount ?? ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Repeat size={15} strokeWidth={1.5} />
            <span className="text-[12px]">{repostCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart size={15} strokeWidth={1.5} />
            <span className="text-[12px]">{formatCount(item.likes)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bookmark size={15} strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  );
}

function YouTubeCard({
  item,
  fontFamily,
}: {
  item: FeedItem;
  fontFamily: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <AspectBox ratio="wide" imageUrl={item.imageUrl} />
      <div className="flex gap-2 px-0.5">
        <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p
            className="text-[13px] font-medium text-white/95 leading-snug"
            style={{ fontFamily }}
          >
            {item.title}
          </p>
          <p
            className="text-[11px] text-white/45 mt-0.5"
            style={{ fontFamily }}
          >
            {item.author} · {item.meta}
          </p>
        </div>
      </div>
    </div>
  );
}

function RedditCard({
  item,
  fontFamily,
  accent,
}: {
  item: FeedItem;
  fontFamily: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <span className="text-[10px] text-white/50" style={{ fontFamily }}>
          {item.meta}
        </span>
      </div>
      <p
        className="text-[13px] font-semibold text-white/95 leading-snug"
        style={{ fontFamily }}
      >
        {item.title}
      </p>
      {item.body && (
        <p
          className="text-[12px] text-white/65 leading-snug mt-1.5"
          style={{ fontFamily }}
        >
          {item.body}
        </p>
      )}
      {item.imageUrl && (
        <div className="mt-2">
          <AspectBox ratio="wide" imageUrl={item.imageUrl} />
        </div>
      )}
      <div
        className="flex items-center gap-4 mt-2 text-white/45 text-[10px]"
        style={{ fontFamily }}
      >
        <div className="flex items-center gap-1">
          <ThumbsUp size={11} strokeWidth={1.8} />
          <span>{item.author}</span>
        </div>
        <MessageCircle size={11} strokeWidth={1.8} />
      </div>
    </div>
  );
}

function SubstackCard({
  item,
  fontFamily,
}: {
  item: FeedItem;
  fontFamily: string;
}) {
  return (
    <div className="flex flex-col gap-2 pb-3 border-b border-white/[0.05]">
      {item.imageUrl && <AspectBox ratio="wide" imageUrl={item.imageUrl} />}
      <p
        className="text-[10px] text-white/40 uppercase tracking-wider"
        style={{ fontFamily }}
      >
        {item.author} · {item.meta}
      </p>
      <p
        className="text-[15px] font-semibold text-white/95 leading-tight"
        style={{ fontFamily }}
      >
        {item.title}
      </p>
      {item.body && (
        <p
          className="text-[12px] text-white/60 leading-relaxed"
          style={{ fontFamily }}
        >
          {item.body}
        </p>
      )}
    </div>
  );
}
