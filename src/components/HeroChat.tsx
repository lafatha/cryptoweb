'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';

// Types
interface Message {
  isUser: boolean;
  text: string;
  delayMs?: number;
}

interface HeroChatProps {
  messages?: Message[];
  typingSpeedMs?: number;
  stagger?: number;
  loop?: boolean;
}

// Default script for conversation
const DEFAULT_SCRIPT: Message[] = [
  { isUser: true, text: 'What is the optimal portfolio allocation amount?', delayMs: 800 },
  { 
    isUser: false, 
    text: 'The optimal portfolio allocation can vary depending on several factors such as investment objectives and risk tolerance. Diversification is usually recommended across Bitcoin (60%), major altcoins (30%), and stablecoins (10%).', 
    delayMs: 1200 
  },
  { isUser: true, text: 'How should I assess my risk tolerance?', delayMs: 1000 },
  { isUser: false, text: 'Risk tolerance assessment involves evaluating your investment timeline, financial goals, and comfort with volatility. Conservative investors might prefer 40% BTC, 20% ETH, 40% stablecoins, while aggressive investors could go 70% BTC, 25% altcoins, 5% stables.', delayMs: 1400 },
];

// Hook for typewriter effect
function useTypewriter(text: string, speedMs: number = 45) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    // Check for reduced motion preference
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  useEffect(() => {
    if (prefersReducedMotion.current) {
      // Skip animation for reduced motion
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    
    if (!text) return;

    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speedMs);

    return () => clearInterval(timer);
  }, [text, speedMs]);

  return { displayedText, isTyping };
}

// Component for typing dots
function TypingDots() {
  return (
    <div 
      className="flex space-x-1 py-2"
      role="status"
      aria-label="Typing"
    >
      <motion.div
        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.0, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.0, repeat: Infinity, delay: 0.3 }}
      />
      <motion.div
        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.0, repeat: Infinity, delay: 0.6 }}
      />
    </div>
  );
}

// Component for individual chat bubble
function ChatBubble({ 
  message, 
  isVisible, 
  typingSpeedMs,
  onTypingComplete 
}: {
  message: Message;
  isVisible: boolean;
  typingSpeedMs: number;
  onTypingComplete: () => void;
}) {
  const { displayedText, isTyping } = useTypewriter(
    isVisible ? message.text : '', 
    typingSpeedMs
  );

  useEffect(() => {
    if (isVisible && !isTyping && displayedText === message.text) {
      onTypingComplete();
    }
  }, [isVisible, isTyping, displayedText, message.text, onTypingComplete]);

  const bubbleVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 25
      }
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className="flex items-start space-x-2 max-w-[85%]">
        {/* Avatar for bot */}
        {!message.isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm">
            🤖
          </div>
        )}
        
        {/* Message bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            message.isUser
              ? 'bg-gray-700 text-white rounded-br-md dark:bg-gray-600 dark:text-white'
              : 'bg-gray-200 text-gray-900 rounded-bl-md dark:bg-gray-700 dark:text-gray-100'
          }`}
        >
          {displayedText}
          {isTyping && <TypingDots />}
        </div>

        {/* Avatar for user */}
        {message.isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-gray-600 dark:bg-gray-500 rounded-full flex items-center justify-center text-sm text-white dark:text-white">
            👤
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Main HeroChat component
export default function HeroChat({
  messages = DEFAULT_SCRIPT,
  typingSpeedMs = 45,
  stagger = 0.6,
  loop = false
}: HeroChatProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [shouldRestart, setShouldRestart] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll ke bawah
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Handle typing completion untuk pesan saat ini
  const handleTypingComplete = useCallback(() => {
    setIsTypingComplete(true);
    scrollToBottom();
  }, [scrollToBottom]);

  // Restart animation untuk loop
  const restartAnimation = useCallback(() => {
    setCurrentMessageIndex(-1);
    setIsTypingComplete(false);
    setShouldRestart(false);
  }, []);

  // Main timeline effect
  useEffect(() => {
    if (shouldRestart) {
      timeoutRef.current = setTimeout(restartAnimation, 2000);
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }

    if (currentMessageIndex >= messages.length) {
      if (loop) {
        setShouldRestart(true);
      }
      return;
    }

    if (currentMessageIndex === -1) {
      // Start dengan pesan pertama setelah delay awal
      timeoutRef.current = setTimeout(() => {
        setCurrentMessageIndex(0);
        setIsTypingComplete(false);
      }, 1000);
    } else if (isTypingComplete) {
      // Lanjut ke pesan berikutnya setelah typing selesai
      const currentMessage = messages[currentMessageIndex];
      const delay = currentMessage.delayMs || 1200;
      
      timeoutRef.current = setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
        setIsTypingComplete(false);
      }, delay);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentMessageIndex, isTypingComplete, messages, loop, shouldRestart, restartAnimation]);

  // Scroll saat pesan baru muncul
  useEffect(() => {
    if (currentMessageIndex >= 0) {
      scrollToBottom();
    }
  }, [currentMessageIndex, scrollToBottom]);

  // Variants untuk animasi container
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      y: 12, 
      scale: 0.96, 
      filter: 'blur(8px)' 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 25,
        delay: 0.2
      }
    },
    exit: {
      opacity: 0,
      y: 12,
      scale: 0.96,
      filter: 'blur(8px)',
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 25,
        delay: 0.2
      }
    }
  };

  const chatAreaVariants = {
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: 1.0
      }
    }
  };

  useEffect(() => {
    if (currentMessageIndex >= messages.length && loop) {
      setTimeout(() => {
        setCurrentMessageIndex(-1);
        setIsTypingComplete(false);
      }, 2000);
    }
  }, [currentMessageIndex, messages.length, loop]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md mx-auto"
    >
      {/* Container kartu chat */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-600 dark:bg-gray-500 rounded-full flex items-center justify-center text-white dark:text-white font-bold">
              AI
            </div>
            <div>
              <h3 className="font-semibold text-black dark:text-white">AI Assistant</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
            </div>
          </div>
        </div>

        {/* Area percakapan */}
        <motion.div
          ref={scrollRef}
          variants={chatAreaVariants}
          className="max-h-[360px] overflow-y-auto p-4 space-y-3"
          aria-live="polite"
        >
          <AnimatePresence>
            {messages.slice(0, currentMessageIndex + 1).map((message, index) => (
              <ChatBubble
                key={`${index}-${shouldRestart}`}
                message={message}
                isVisible={index <= currentMessageIndex}
                typingSpeedMs={typingSpeedMs}
                onTypingComplete={index === currentMessageIndex ? handleTypingComplete : () => {}}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Input placeholder (non-interactive) */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-700 h-10 w-full px-4 flex items-center">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Ask about portfolio strategy...</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
