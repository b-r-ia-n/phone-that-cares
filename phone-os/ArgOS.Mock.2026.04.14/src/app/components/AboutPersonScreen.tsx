import { useState, useEffect, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mic, BookOpen, Link2, Images, Calendar } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

type Tab = 'mic' | 'book' | 'link' | 'photo' | 'calendar';

const personData: Record<string, { name: string; avatar: string; imageUrl?: string }> = {
  '2': {
    name: 'Marcus',
    avatar: '🧑‍💻',
  },
  '1': {
    name: 'Caroline',
    avatar: '👩‍🎨',
    imageUrl: 'https://images.unsplash.com/photo-1490087763596-862a8bfcc16c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwbmF0dXJhbCUyMGxpZ2h0fGVufDF8fHx8MTc3NjE4Njg0Nnww&ixlib=rb-4.1.0&q=80&w=400',
  },
};

const observations: Record<string, string> = {
  '2': 'You and Marcus usually talk every couple of weeks. Your conversations tend to run long. Your last few exchanges have been about work and side projects.',
  '1': 'You and Caroline usually talk every couple of days. You tend to send each other photos from trips. Your last few exchanges have been about the book club.',
};

interface BookContent {
  howYouMet: string;
  likes: string[];
  dislikes: string[];
  sharedContext: string[];
  people: string[];
  notes: string[];
}

const bookContent: Record<string, BookContent> = {
  '1': {
    howYouMet: 'Book club at the Elm Street library, spring 2019. You both hated the same novel that month.',
    likes: [
      'strong black coffee',
      'portuguese pastries',
      'long walks at dusk',
      'her rescue dog, Mira',
      'handwritten letters',
    ],
    dislikes: [
      'crowded restaurants',
      'being rushed',
      'small talk at parties',
    ],
    sharedContext: [
      'Book club — 2nd Wednesday every month',
      'That week in Lisbon, October 2022',
      'Got lost together at the Ferry Building farmers market',
      'Inside joke about the word "actually"',
    ],
    people: [
      'Wren — her daughter, age 6, really into dinosaurs right now',
      'Theo — her partner, works in architecture',
      'Mira — her rescue dog, mostly retriever',
    ],
    notes: [
      'Allergic to shellfish',
      'Job hunting right now (product management)',
      'Usually free Thursday evenings',
      'Prefers voice memos over texts',
    ],
  },
  '2': {
    howYouMet: 'You worked together at a small startup back in 2017. Became friends after a late-night deploy.',
    likes: [
      'late-night coding sessions',
      'ramen',
      'board games',
      'vintage synths',
      'hiking trails with no one on them',
    ],
    dislikes: [
      'status meetings',
      'spicy food',
      'anything rushed',
    ],
    sharedContext: [
      'The side project you prototyped together in 2020',
      'Both went through the same layoff in 2023',
      'Shared music playlist you keep adding to',
    ],
    people: [
      'Jamie — his younger brother, in grad school',
      'Ruby — his cat, very opinionated',
    ],
    notes: [
      'Training for a marathon this fall',
      'Vegetarian',
      'Prefers texts over calls',
    ],
  },
};

const tabs: { key: Tab; icon: typeof Mic }[] = [
  { key: 'mic', icon: Mic },
  { key: 'book', icon: BookOpen },
  { key: 'link', icon: Link2 },
  { key: 'photo', icon: Images },
  { key: 'calendar', icon: Calendar },
];

export default function AboutPersonScreen() {
  const navigate = useNavigate();
  const { personId } = useParams<{ personId: string }>();
  const [isListening, setIsListening] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('mic');

  const person = personData[personId || '1'] || personData['1'];
  const personObservation = observations[personId || '1'] || observations['1'];
  const book = bookContent[personId || '1'] || bookContent['1'];

  useEffect(() => {
    const interval = setInterval(() => {
      if (isListening) {
        setPulseScale((prev) => (prev === 1 ? 1.08 : 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isListening]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Header - back arrow left, name + photo together on right */}
      <div className="relative z-10 px-6 pt-12 pb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/connect')}
          className="text-white/60 hover:text-white/90 transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>

        {/* Name and photo together */}
        <div className="flex items-center gap-3">
          <h1
            className="text-base font-medium text-white/90"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            About {person.name}
          </h1>
          {person.imageUrl ? (
            <div
              className="w-10 h-10 rounded-full bg-cover bg-center border border-white/10"
              style={{ backgroundImage: `url(${person.imageUrl})` }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-lg border border-white/10">
              {person.avatar}
            </div>
          )}
        </div>
      </div>

      {/* Large container - the repository */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 mx-6 rounded-2xl bg-white/[0.05] px-6 pt-8 pb-3 h-[calc(100vh-220px)] flex flex-col"
      >
        {activeTab === 'mic' && (
          <>
            {/* Think Out Loud section */}
            <div className="flex flex-col items-center mb-10">
              <p
                className="text-base text-white/70 mb-2 text-center"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Think out loud
              </p>
              <p
                className="text-sm text-white/40 mb-6 text-center max-w-[280px]"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Want to sit with this for a second? Something you've been wanting to say? Let's talk.
              </p>

              {/* Breathing microphone */}
              <button
                onClick={() => setIsListening(!isListening)}
                className="relative"
              >
                <motion.div
                  className="w-[68px] h-[68px] rounded-full bg-gradient-to-br from-violet-500/20 to-violet-600/20 border-2 border-violet-400/30 flex items-center justify-center"
                  animate={{
                    scale: isListening ? pulseScale : 1,
                  }}
                  transition={{
                    duration: 1,
                    ease: 'easeInOut',
                  }}
                >
                  <Mic size={28} strokeWidth={1.5} className="text-violet-300/80" />
                </motion.div>
                {isListening && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-violet-400/50"
                    animate={{
                      scale: [1, 1.3],
                      opacity: [0.5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                )}
              </button>
            </div>

            {/* Example prompts */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <p
                className="text-[10px] tracking-[0.15em] uppercase text-white/25 mb-3"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                OR TRY...
              </p>
              <div className="space-y-2 mb-6">
                {[
                  "Search our conversation for birthday gift ideas",
                  "I want to tell her something but I'm nervous",
                  "Help me remember her favorite restaurant in Mexico City",
                  "I don't know what to say back",
                  "Remind me what we've enjoyed talking about in the past",
                ].map((prompt, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.04 }}
                    className="w-full text-left px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.11] transition-all"
                  >
                    <span className="text-[13px] text-white/60" style={{ fontFamily: 'var(--font-body)' }}>
                      {prompt}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Relationship observations */}
              <div className="space-y-3 mb-6">
                <p className="text-xs text-white/60 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                  {personObservation}
                </p>
                <p className="text-xs text-white/60 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                  More past conversation summaries and collected notes{' '}
                  <button
                    onClick={() => setActiveTab('book')}
                    className="text-xs font-normal underline text-white/70 hover:text-white/90 transition-colors"
                  >
                    here
                  </button>
                  .
                </p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'book' && (
          <>
            <div className="mb-5 text-center">
              <p
                className="text-base text-white/80"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                You and {person.name}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-5 pb-2">
              <Section label="HOW YOU MET">
                <p className="text-[13px] text-white/70 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                  {book.howYouMet}
                </p>
              </Section>
              <Section label="LIKES">
                <BulletList items={book.likes} />
              </Section>
              <Section label="DISLIKES">
                <BulletList items={book.dislikes} />
              </Section>
              <Section label="SHARED CONTEXT">
                <BulletList items={book.sharedContext} />
              </Section>
              <Section label="PEOPLE">
                <BulletList items={book.people} />
              </Section>
              <Section label="NOTES">
                <BulletList items={book.notes} />
              </Section>
            </div>
          </>
        )}

        {(activeTab === 'link' || activeTab === 'photo' || activeTab === 'calendar') && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-white/30" style={{ fontFamily: 'var(--font-body)' }}>
              nothing saved here yet
            </p>
          </div>
        )}

        {/* Icon strip at bottom */}
        <div className="flex items-center justify-around pt-4 border-t border-white/[0.08]">
          {tabs.map(({ key, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`p-2 transition-colors ${
                  isActive ? 'text-white' : 'text-white/30 hover:text-white/60'
                }`}
              >
                <Icon size={18} strokeWidth={1.5} />
              </button>
            );
          })}
        </div>

        {/* Privacy line - inside container, below icons */}
        <p
          className="text-[9px] tracking-[0.15em] uppercase text-white/20 text-center mt-3"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          THIS STAYS BETWEEN YOU AND YOUR PHONE
        </p>
      </motion.div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p
        className="text-[10px] tracking-[0.15em] uppercase text-white/25 mb-2"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li
          key={i}
          className="text-[13px] text-white/70 leading-relaxed pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-white/40"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
