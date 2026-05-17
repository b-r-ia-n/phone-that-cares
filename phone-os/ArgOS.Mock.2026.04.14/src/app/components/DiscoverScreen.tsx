import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronUp, Sparkles, Music, Bell, Scroll } from 'lucide-react';
import { useNavigate } from 'react-router';
import AndroidStatusBar from './AndroidStatusBar';
import ScrollSettingsPanel, { experiments, type Experiment } from './ScrollSettingsPanel';

interface FeedPost {
  id: string;
  type: 'instagram-video' | 'substack' | 'youtube' | 'reddit' | 'instagram-photo';
  aspectRatio: '9:16' | '16:9' | '1:1';
  imageUrl: string;
  username?: string;
  song?: string;
  caption?: string;
  title?: string;
  author?: string;
  subreddit?: string;
  sourceLabel: string;
}

const feedPosts: FeedPost[] = [
  {
    id: '1',
    type: 'substack',
    aspectRatio: '16:9',
    imageUrl: 'https://images.unsplash.com/photo-1760764541302-e3955fbc6b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljcyUyMHBvdHRlcnklMjBoYW5kbWFkZXxlbnwxfHx8fDE3NzYxMzQ3ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Glazing techniques for wood-fired ceramics',
    author: 'Studio Notes',
    sourceLabel: 'SS',
  },
  {
    id: '2',
    type: 'instagram-video',
    aspectRatio: '9:16',
    imageUrl: 'https://images.unsplash.com/photo-1613378143355-5e3e681cfcef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXJmaW5nJTIwd2F2ZXMlMjBvY2VhbnxlbnwxfHx8fDE3NzYxMzQ3Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    username: '@surflinechronicles',
    song: 'Floating Points — Birth',
    caption: 'Morning glass, no one out. Felt like stealing',
    sourceLabel: 'IG',
  },
  {
    id: '3',
    type: 'youtube',
    aspectRatio: '16:9',
    imageUrl: 'https://images.unsplash.com/photo-1664088673619-38b275539bf9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxzdXJmaW5nJTIwd2F2ZXMlMjBvY2VhbnxlbnwxfHx8fDE3NzYxMzQ3Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Why Nazaré broke its own record this winter',
    author: 'Big Wave Chronicles',
    sourceLabel: 'YT',
  },
  {
    id: '4',
    type: 'reddit',
    aspectRatio: '1:1',
    imageUrl: 'https://images.unsplash.com/photo-1769001800015-00c68971aafa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxmdW5ueSUyMG1lbWUlMjBpbnRlcm5ldCUyMGN1bHR1cmV8ZW58MXx8fHwxNzc2MTM0NzgwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    subreddit: 'r/surfing',
    sourceLabel: 'RD',
  },
  {
    id: '5',
    type: 'instagram-photo',
    aspectRatio: '9:16',
    imageUrl: 'https://images.unsplash.com/photo-1629380321696-99d97eaa492a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxjZXJhbWljcyUyMHBvdHRlcnklMjBoYW5kbWFkZXxlbnwxfHx8fDE3NzYxMzQ3ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    username: '@clayandglaze',
    caption: 'New collection drop tomorrow 🌿',
    sourceLabel: 'IG',
  },
];

const categories = ['Highlight Reel', 'Surfing', 'Ceramics', 'Dank memes', 'Trail running'];

type Source = 'highlight' | 'substack' | 'youtube' | 'instagram' | 'twitter';

export default function DiscoverScreen() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Highlight Reel');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Source>('highlight');
  const [activeExperiment, setActiveExperiment] = useState<Experiment>('grayscale');

  const getAspectRatioClass = (ratio: string) => {
    if (ratio === '9:16') return 'aspect-[9/16]';
    if (ratio === '16:9') return 'aspect-[16/9]';
    if (ratio === '1:1') return 'aspect-square';
    return 'aspect-[16/9]';
  };

  const getSourceIcon = (sourceLabel: string) => {
    switch (sourceLabel) {
      case 'SS': // Substack
        return <Scroll size={16} strokeWidth={1.5} className="text-white" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }} />;
      case 'YT': // YouTube
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }}>
            <rect x="2" y="6" width="20" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" />
          </svg>
        );
      case 'IG': // Instagram
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }}>
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
          </svg>
        );
      case 'RD': // Reddit
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v8m-4-4h8" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a]">
      {/* Android Status Bar */}
      <AndroidStatusBar />

      {/* Header */}
      <div className="relative z-10 px-6 pt-14 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-white/60 hover:text-white/90 transition-colors"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </button>
            <h1
              className="text-3xl font-light tracking-tight text-white/95"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Discover
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Grayscale intervention indicator with triangle */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white/40">
                <path d="M0 10 L10 0 L10 10 Z" fill="currentColor" />
              </svg>
              <span className="text-xs" style={{ fontFamily: 'var(--font-body)' }}>
                {experiments[activeExperiment].name}
              </span>
            </button>

            {/* Notifications icon - medium size */}
            <button
              onClick={() => navigate('/notifications')}
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              <Bell size={15} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Category chips - smaller */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category, index) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-white/10 text-white/90'
                  : 'bg-white/[0.04] text-white/40 hover:text-white/60'
              }`}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Feed - full bleed with tight spacing */}
      <div className="relative z-10 pb-24 space-y-1.5 overflow-y-auto h-[calc(100vh-180px)]">
        {feedPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="relative w-full overflow-hidden cursor-pointer group"
          >
            {/* Media */}
            <div className={`relative w-full ${getAspectRatioClass(post.aspectRatio)} overflow-hidden`}>
              <img
                src={post.imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />

              {/* Source icon top-right */}
              <div className="absolute top-3 right-3">
                {getSourceIcon(post.sourceLabel)}
              </div>

              {/* Video play button */}
              {(post.type === 'instagram-video' || post.type === 'youtube') && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[14px] border-l-white border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent ml-1" />
                  </div>
                </div>
              )}

              {/* Metadata overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                {post.username && (
                  <p className="text-sm font-medium text-white mb-1" style={{ fontFamily: 'var(--font-body)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    {post.username}
                  </p>
                )}
                {post.song && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <Music size={11} strokeWidth={2} className="text-white" />
                    <p className="text-xs text-white/90" style={{ fontFamily: 'var(--font-body)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                      {post.song}
                    </p>
                  </div>
                )}
                {post.caption && (
                  <p className="text-xs text-white/80 line-clamp-1" style={{ fontFamily: 'var(--font-body)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    {post.caption} <span className="text-white/60">...more</span>
                  </p>
                )}
                {post.title && (
                  <p className="text-sm font-medium text-white" style={{ fontFamily: 'var(--font-display)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    {post.title}
                  </p>
                )}
                {post.author && (
                  <p className="text-xs text-white/80 mt-0.5" style={{ fontFamily: 'var(--font-body)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    {post.author}
                  </p>
                )}
                {post.subreddit && (
                  <p className="text-xs text-white/80" style={{ fontFamily: 'var(--font-body)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    {post.subreddit}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom tab bar - source switcher - persistent */}
      <div className="absolute bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center justify-around py-3 px-4">
          {/* Highlight Reel - Sparkles */}
          <button
            onClick={() => setSelectedSource('highlight')}
            className={`p-2 transition-all ${selectedSource === 'highlight' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
          >
            <Sparkles size={24} strokeWidth={1.5} className="text-white" />
          </button>

          {/* Substack - Scroll */}
          <button
            onClick={() => setSelectedSource('substack')}
            className={`p-2 transition-all ${selectedSource === 'substack' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
          >
            <Scroll size={24} strokeWidth={1.5} className="text-white" />
          </button>

          {/* YouTube - Play button in rounded rect */}
          <button
            onClick={() => setSelectedSource('youtube')}
            className={`p-2 transition-all ${selectedSource === 'youtube' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <rect x="2" y="6" width="20" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" />
            </svg>
          </button>

          {/* Instagram - Square camera */}
          <button
            onClick={() => setSelectedSource('instagram')}
            className={`p-2 transition-all ${selectedSource === 'instagram' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
          </button>

          {/* Twitter/X */}
          <button
            onClick={() => setSelectedSource('twitter')}
            className={`p-2 transition-all ${selectedSource === 'twitter' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
              <path d="M4 4l11.733 16h4.267l-11.733-16z" />
              <path d="M4 20l6.768-6.768m2.46-2.46L20 4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scroll Settings Panel */}
      <ScrollSettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeExperiment={activeExperiment}
        setActiveExperiment={setActiveExperiment}
      />
    </div>
  );
}
