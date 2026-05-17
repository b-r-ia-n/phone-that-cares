import { motion } from 'motion/react';
import { ArrowLeft, MoreVertical, Phone, Video, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import AndroidStatusBar from './AndroidStatusBar';

interface TextMessage {
  id: string;
  text: string;
  fromUser: boolean;
  timestamp: string;
}

const conversationData: { [key: string]: { name: string; avatar: string; imageUrl?: string; messages: TextMessage[] } } = {
  '1': {
    name: 'Sarah',
    avatar: '👩‍🎨',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    messages: [
      {
        id: '1',
        text: 'Hey! Did you finish that book you were reading?',
        fromUser: false,
        timestamp: '2:14 PM',
      },
      {
        id: '2',
        text: 'Yes! Just wrapped it up yesterday. It was incredible',
        fromUser: true,
        timestamp: '2:16 PM',
      },
      {
        id: '3',
        text: "I knew you'd love it! The ending was so good",
        fromUser: false,
        timestamp: '2:17 PM',
      },
      {
        id: '4',
        text: 'Want to grab coffee this weekend and talk about it?',
        fromUser: false,
        timestamp: '2:17 PM',
      },
      {
        id: '5',
        text: 'That would be perfect. Saturday morning?',
        fromUser: true,
        timestamp: '2:19 PM',
      },
      {
        id: '6',
        text: 'Saturday works! 10am at the usual spot?',
        fromUser: false,
        timestamp: '2:20 PM',
      },
      {
        id: '7',
        text: 'See you then ☕',
        fromUser: true,
        timestamp: '2:21 PM',
      },
      {
        id: '8',
        text: 'Did you see the photos from last weekend?',
        fromUser: false,
        timestamp: '3:42 PM',
      },
    ],
  },
  '2': {
    name: 'Marcus',
    avatar: '🧑‍💻',
    messages: [
      {
        id: '1',
        text: 'yo have you tried that new state lib everyone is posting about',
        fromUser: false,
        timestamp: 'Yesterday 10:02 AM',
      },
      {
        id: '2',
        text: 'Zustand? yeah been using it for a while. it\'s good',
        fromUser: true,
        timestamp: 'Yesterday 10:14 AM',
      },
      {
        id: '3',
        text: 'lol no the newer one. anyway unrelated — my side project keeps choking on large lists',
        fromUser: false,
        timestamp: 'Yesterday 10:15 AM',
      },
      {
        id: '4',
        text: 'try react-virtuoso. drop-in and it just works',
        fromUser: true,
        timestamp: 'Yesterday 10:18 AM',
      },
      {
        id: '5',
        text: 'oh nice I had been avoiding virtualization bc the tanstack one felt like a lot',
        fromUser: false,
        timestamp: 'Yesterday 10:19 AM',
      },
      {
        id: '6',
        text: 'virtuoso is way friendlier. you\'ll be done in an afternoon',
        fromUser: true,
        timestamp: 'Yesterday 10:21 AM',
      },
      {
        id: '7',
        text: 'ok trying it now. if this works I owe you a beer',
        fromUser: false,
        timestamp: 'Yesterday 10:22 AM',
      },
      {
        id: '8',
        text: 'Thanks for the recommendation!',
        fromUser: false,
        timestamp: 'Yesterday 4:48 PM',
      },
    ],
  },
  '3': {
    name: 'Mom',
    avatar: '👩',
    imageUrl: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=400&q=80',
    messages: [
      {
        id: '1',
        text: 'How did your presentation go sweetheart?',
        fromUser: false,
        timestamp: 'Sunday 8:12 AM',
      },
      {
        id: '2',
        text: 'It went really well! They want me to run the next one too',
        fromUser: true,
        timestamp: 'Sunday 9:40 AM',
      },
      {
        id: '3',
        text: 'Oh I knew it would. So proud of you ❤️',
        fromUser: false,
        timestamp: 'Sunday 9:42 AM',
      },
      {
        id: '4',
        text: 'Did you end up making the soup recipe I sent?',
        fromUser: false,
        timestamp: 'Sunday 9:43 AM',
      },
      {
        id: '5',
        text: 'Yes! Made it last night. Way better than mine lol',
        fromUser: true,
        timestamp: 'Sunday 10:05 AM',
      },
      {
        id: '6',
        text: 'The trick is the extra garlic. Don\'t tell your father',
        fromUser: false,
        timestamp: 'Sunday 10:07 AM',
      },
      {
        id: '7',
        text: 'Call me when you get a chance',
        fromUser: false,
        timestamp: 'Sunday 6:21 PM',
      },
    ],
  },
  '4': {
    name: 'Dev Group',
    avatar: '💬',
    messages: [
      {
        id: '1',
        text: 'anyone got notes from last week? I totally spaced on the big-O stuff',
        fromUser: false,
        timestamp: 'Monday 7:14 PM',
      },
      {
        id: '2',
        text: 'I have some. will drop them in the drive tonight',
        fromUser: true,
        timestamp: 'Monday 7:22 PM',
      },
      {
        id: '3',
        text: 'for the two-pointer one — sort first, then shrink the window. that\'s the whole trick',
        fromUser: false,
        timestamp: 'Monday 7:40 PM',
      },
      {
        id: '4',
        text: 'ugh I have to bail on Thursday, got a work thing. can someone record?',
        fromUser: false,
        timestamp: 'Tuesday 9:02 AM',
      },
      {
        id: '5',
        text: 'I can record. also can we push start time 30 min? traffic has been rough',
        fromUser: true,
        timestamp: 'Tuesday 9:15 AM',
      },
      {
        id: '6',
        text: 'fine with me',
        fromUser: false,
        timestamp: 'Tuesday 9:18 AM',
      },
      {
        id: '7',
        text: 'Meeting at 3pm tomorrow',
        fromUser: false,
        timestamp: '10:30 AM',
      },
    ],
  },
  '5': {
    name: 'Jamie',
    avatar: '🌊',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    messages: [
      {
        id: '1',
        text: 'hiiii',
        fromUser: false,
        timestamp: 'Apr 6',
      },
      {
        id: '2',
        text: 'hey! how\'s the coast treating you',
        fromUser: true,
        timestamp: 'Apr 6',
      },
      {
        id: '3',
        text: 'unreal. water was glassy this morning',
        fromUser: false,
        timestamp: 'Apr 6',
      },
      {
        id: '4',
        text: '📷',
        fromUser: false,
        timestamp: 'Apr 6',
      },
      {
        id: '5',
        text: 'ok that\'s absurd. jealous',
        fromUser: true,
        timestamp: 'Apr 7',
      },
      {
        id: '6',
        text: 'come visit!! I\'m here another two weeks',
        fromUser: false,
        timestamp: 'Apr 7',
      },
      {
        id: '7',
        text: 'Sent you a reel',
        fromUser: false,
        timestamp: 'Apr 8',
      },
    ],
  },
};

export default function ConversationScreen() {
  const navigate = useNavigate();
  const { personId } = useParams<{ personId: string }>();

  const conversation = personId ? conversationData[personId] : null;

  if (!conversation) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a]">
        <AndroidStatusBar />
        <div className="flex items-center justify-center h-full text-white/50">
          Conversation not found
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a]">
      {/* Android Status Bar */}
      <AndroidStatusBar />

      {/* Header */}
      <div className="relative z-10 px-4 pt-14 pb-3 flex items-center justify-between border-b border-white/[0.08]">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => navigate('/connect')}
            className="text-white/60 hover:text-white/90 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>

          <button
            onClick={() => navigate(`/about/${personId}`)}
            className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
          >
            {conversation.imageUrl ? (
              <div
                className="w-10 h-10 rounded-full bg-cover bg-center border border-white/10 flex-shrink-0"
                style={{ backgroundImage: `url(${conversation.imageUrl})` }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-lg flex-shrink-0">
                {conversation.avatar}
              </div>
            )}
            <h1
              className="text-lg font-medium text-white/95 truncate"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {conversation.name}
            </h1>
          </button>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => navigate(`/about/${personId}`)}
            className="text-white/60 hover:text-white/90 transition-colors"
          >
            <Sparkles size={20} strokeWidth={1.5} />
          </button>
          <button className="text-white/60 hover:text-white/90 transition-colors">
            <Phone size={20} strokeWidth={1.5} />
          </button>
          <button className="text-white/60 hover:text-white/90 transition-colors">
            <Video size={20} strokeWidth={1.5} />
          </button>
          <button className="text-white/60 hover:text-white/90 transition-colors">
            <MoreVertical size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 px-4 py-4 overflow-y-auto h-[calc(100%-160px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="space-y-2">
          {conversation.messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${message.fromUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[75%]">
                <div
                  className={`px-4 py-2.5 rounded-2xl ${
                    message.fromUser
                      ? 'bg-[#0A84FF] text-white rounded-br-md'
                      : 'bg-white/[0.08] text-white/90 rounded-bl-md'
                  }`}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  <p className="text-[15px] leading-relaxed">{message.text}</p>
                </div>
                <p
                  className={`text-[11px] text-white/30 mt-1 px-1 ${
                    message.fromUser ? 'text-right' : 'text-left'
                  }`}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {message.timestamp}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Compose field */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 py-3 border-t border-white/[0.08]"
        style={{
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Text message"
            className="flex-1 px-4 py-2.5 rounded-full bg-white/[0.08] text-white/90 placeholder-white/40 text-[15px] focus:outline-none focus:ring-1 focus:ring-white/20"
            style={{ fontFamily: 'var(--font-body)' }}
          />
          <button className="w-9 h-9 rounded-full bg-[#0A84FF] flex items-center justify-center flex-shrink-0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white translate-x-[1px]"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
