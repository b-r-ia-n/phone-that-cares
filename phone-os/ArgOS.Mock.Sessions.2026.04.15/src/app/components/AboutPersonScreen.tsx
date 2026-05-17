import { useState, useEffect, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mic, BookOpen, Link2, Images, Calendar } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

type Tab = 'mic' | 'book' | 'link' | 'photo' | 'calendar';

const personData: Record<string, { name: string; avatar: string; imageUrl?: string }> = {
  '1': {
    name: 'Sarah',
    avatar: '👩‍🎨',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  },
  '2': {
    name: 'Marcus',
    avatar: '🧑‍💻',
  },
  '3': {
    name: 'Mom',
    avatar: '👩',
    imageUrl: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=400&q=80',
  },
  '4': {
    name: 'Dev Group',
    avatar: '💬',
  },
  '5': {
    name: 'Jamie',
    avatar: '🌊',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  },
  '6': {
    name: 'Alex',
    avatar: '🎭',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  '7': {
    name: 'Jordan',
    avatar: '🎨',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  '8': {
    name: 'Taylor',
    avatar: '🏃',
  },
  '9': {
    name: 'Sam',
    avatar: '🎸',
  },
  '10': {
    name: 'Dana',
    avatar: '📚',
  },
  '11': {
    name: 'Riley',
    avatar: '☕',
  },
  '12': {
    name: 'Chris',
    avatar: '🚴',
  },
};

const observations: Record<string, string> = {
  '1': 'You and Sarah usually talk every couple of days. You tend to send each other photos from trips. Your last few exchanges have been about the book club.',
  '2': 'You and Marcus usually talk every couple of weeks. Your conversations tend to run long. Your last few exchanges have been about work and side projects.',
  '3': 'You and your mom talk most Sundays. She tends to ask whether you\'ve been eating, and sends the occasional forwarded article. Last few calls have been about her garden and your uncle\'s surgery.',
  '4': 'The group thread is quietest between sessions and picks up the night before. Most of the recent activity has been around scheduling and a shared study guide.',
  '5': 'You and Jamie go through long quiet stretches and then a flurry of reels and voice notes. The last burst was about a show they wanted you to watch.',
  '6': 'You and Alex trade Instagram DMs a few times a year, usually around each other\'s posts. Last exchange was making vague plans for summer.',
  '7': 'You read most of Jordan\'s Substack posts and occasionally reply. Your exchanges are short but warm.',
  '8': 'You and Taylor mostly text to schedule runs. Your last few messages have been about weekend plans.',
  '9': 'You and Sam mostly talk about music and band logistics. Threads tend to go quiet for weeks and then pick up around a show.',
  '10': 'You and Dana trade book recommendations. Last thread was about a novel you both just finished.',
  '11': 'You and Riley bump into each other at the coffee shop more often than you text. Most messages are about small neighborhood stuff.',
  '12': 'You and Chris mostly talk about cycling. Messages cluster around weekend ride planning.',
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
  '3': {
    howYouMet: 'She\'s your mom. Rockford, Illinois. You were born in the spring.',
    likes: [
      'her garden, especially the tomatoes',
      'talking on the phone while doing dishes',
      'the local library\'s used book sale',
      'sending forwarded articles',
      'walking the dog after dinner',
    ],
    dislikes: [
      'being put on speakerphone',
      'when you don\'t eat enough',
      'loud restaurants',
    ],
    sharedContext: [
      'Sunday phone calls, most weeks',
      'Uncle Ron\'s knee surgery in February',
      'The week she visited last fall',
      'The ongoing saga of the neighbor\'s fence',
    ],
    people: [
      'Dad — retired, mostly in the workshop',
      'Uncle Ron — her brother, recovering from surgery',
      'Biscuit — the family dog, 11 years old',
    ],
    notes: [
      'Her birthday is in October',
      'Doesn\'t love texting, prefers calls',
      'Usually free in the evenings after 7',
      'Gets worried if you don\'t answer for a few days',
    ],
  },
  '4': {
    howYouMet: 'Started in 2023 when four of you paired up on a backend course. The group settled into seven regulars over the following year.',
    likes: [
      'systems design whiteboarding',
      'arguing about Rust vs. Go',
      'post-mortem reads',
      'a good leetcode puzzle',
      'celebrating when someone lands an interview',
    ],
    dislikes: [
      'scope creep in the study guide',
      'when half the group ghosts the week before a session',
      'LinkedIn humblebrags',
    ],
    sharedContext: [
      'The week everyone failed the same leetcode problem',
      'Shared Notion doc with the rotating facilitator schedule',
      'The group\'s first mock interview night, February',
      'Running inside joke about "the big O of this conversation"',
    ],
    people: [
      'Priya — started the group, backend at a fintech',
      'Marcus — also in your contacts, joined last summer',
      'Omar — quietest in chat, sharpest in review',
      'Leah — currently job hunting, prepping hard',
      'Devon — usually hosts when it\'s in-person',
      'Kai — newest member, joined in March',
      'Jamie B. — not the Jamie in your contacts, rotates as facilitator',
    ],
    notes: [
      'Next session: Thursday 7pm',
      'Rotating facilitator — Jamie B. is up next',
      'Group chat lives on Signal',
      'Shared study guide in the pinned message',
    ],
  },
  '5': {
    howYouMet: 'Met at a friend\'s beach weekend in 2020. Stayed in touch mostly through sending each other stuff.',
    likes: [
      'sending reels at 1am',
      'long voice notes',
      'surfing, badly',
      'whatever show they\'re currently deep in',
      'ambient playlists',
    ],
    dislikes: [
      'phone calls with no warning',
      'group chats with more than five people',
      'being asked to make plans far in advance',
    ],
    sharedContext: [
      'The beach weekend you both still reference',
      'The show they made you watch last winter',
      'A half-serious plan to do a trip together',
    ],
    people: [
      'Nico — their partner, graphic designer',
      'Otter — their dog, small and loud',
    ],
    notes: [
      'Works in marketing, freelance',
      'Often goes quiet for weeks — not personal',
      'Birthday in July',
    ],
  },
  '6': {
    howYouMet: 'Through a mutual friend\'s party a few years ago. Mostly keep in touch through each other\'s posts now.',
    likes: [
      'theater, especially small productions',
      'obscure restaurants',
      'late brunches',
    ],
    dislikes: [
      'flaky plans',
      'tourist neighborhoods',
    ],
    sharedContext: [
      'That one dinner in the fall of 2023',
      'Keep meaning to see a show together',
    ],
    people: [
      'Sam — their roommate, you\'ve met a couple times',
    ],
    notes: [
      'Mostly responsive on Instagram',
      'Lives across town',
    ],
  },
  '7': {
    howYouMet: 'Found their Substack through a friend\'s recommendation in 2022. Struck up a correspondence in the comments.',
    likes: [
      'long-form essays',
      'ink drawings',
      'slow mornings',
      'second-hand bookstores',
    ],
    dislikes: [
      'hot takes',
      'algorithmic feeds',
    ],
    sharedContext: [
      'Their essay on attention that you\'ve reread a few times',
      'Occasional back-and-forth in the comments',
    ],
    people: [
      'Their writing community — small, mostly online',
    ],
    notes: [
      'Publishes roughly every other week',
      'Lives somewhere in the Pacific Northwest',
    ],
  },
  '8': {
    howYouMet: 'Met through a running club about a year ago.',
    likes: [
      'early morning runs',
      'long trail routes',
    ],
    dislikes: [
      'treadmills',
    ],
    sharedContext: [
      'Sunday morning runs when the weather\'s good',
      'Training loosely for a half marathon',
    ],
    people: [],
    notes: [
      'Usually free Saturday mornings',
      'Prefers WhatsApp',
    ],
  },
  '9': {
    howYouMet: 'Through the band you both play in. Joined within a few months of each other.',
    likes: [
      'analog gear',
      'practice sessions that run late',
    ],
    dislikes: [
      'rushed soundchecks',
    ],
    sharedContext: [
      'Band practice, most Thursdays',
      'The basement show last fall',
    ],
    people: [
      'The rest of the band',
    ],
    notes: [
      'Plays bass',
      'Works days, so evenings are better',
    ],
  },
  '10': {
    howYouMet: 'Through a book club that quietly dissolved, but you kept trading recommendations.',
    likes: [
      'literary fiction',
      'bookstore browsing',
    ],
    dislikes: [
      'spoilers',
    ],
    sharedContext: [
      'A running list of shared book recs',
      'The novel you both just finished',
    ],
    people: [],
    notes: [
      'Mostly on Telegram',
    ],
  },
  '11': {
    howYouMet: 'Regular at the same neighborhood coffee shop. Eventually started texting.',
    likes: [
      'pour-over',
      'weekday mornings',
    ],
    dislikes: [
      'early closures',
    ],
    sharedContext: [
      'The coffee shop on the corner',
      'A handful of small neighborhood run-ins',
    ],
    people: [],
    notes: [
      'Lives a few blocks away',
    ],
  },
  '12': {
    howYouMet: 'Through a group ride a couple of summers ago.',
    likes: [
      'long weekend rides',
      'coffee stops mid-ride',
    ],
    dislikes: [
      'headwinds',
    ],
    sharedContext: [
      'Weekend rides when the weather holds',
    ],
    people: [],
    notes: [
      'Usually rides Saturday mornings',
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
    <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a]">
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
        className="relative z-10 mx-6 mb-6 rounded-2xl bg-white/[0.05] px-6 pt-8 pb-3 h-[calc(100%-180px)] flex flex-col"
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
