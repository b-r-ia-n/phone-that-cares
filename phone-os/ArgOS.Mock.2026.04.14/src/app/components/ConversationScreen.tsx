import { motion } from 'motion/react';
import { ArrowLeft, Sprout, MoreVertical, Phone, Video, Sparkles } from 'lucide-react';
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
    name: 'Caroline',
    avatar: '👩‍🎨',
    imageUrl: 'https://images.unsplash.com/photo-1490087763596-862a8bfcc16c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwbmF0dXJhbCUyMGxpZ2h0fGVufDF8fHx8MTc3NjE4Njg0Nnww&ixlib=rb-4.1.0&q=80&w=400',
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
};

export default function ConversationScreen() {
  const navigate = useNavigate();
  const { personId } = useParams<{ personId: string }>();

  const conversation = personId ? conversationData[personId] : null;

  if (!conversation) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a]">
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
      <div className="relative z-10 px-4 py-4 overflow-y-auto h-[calc(100vh-240px)]">
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

      {/* Floating "Think about this person" affordance */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => navigate(`/about/${personId}`)}
        className="absolute top-1/2 right-4 z-30 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg"
        style={{
          backgroundColor: 'rgba(10, 10, 10, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <Sprout size={20} strokeWidth={1.5} className="text-white/70" />
      </motion.button>

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
