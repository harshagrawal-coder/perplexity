import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useChat } from "../hooks/useChat";
import { setMessages, addMessage, clearMessages, setChatTitle } from "../chat.slice";
import Sidebar from "../components/Sidebar";
import Message from "../components/Message";
import MessageInput from "../components/MessageInput";
import TypingIndicator from "../components/TypingIndicator";
import SuggestedPrompts from "../components/SuggestedPrompts";
import AnimatedBackground from "../components/AnimatedBackground";
import { FiMenu, FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
export default function Dashboard() {
  const dispatch = useDispatch();
  const chat = useChat();
  const { user } = useSelector((state) => state.auth);
  const messages = useSelector((state) => state.chat.messages);
  const chatTitle = useSelector((state) => state.chat.chatTitle);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sendError, setSendError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chat.isLoading]);

  const handleSend = useCallback(async (content) => {
    const userMsg = {
      id: Date.now(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    dispatch(addMessage(userMsg));
    try {
      setSendError(null);
      const data = await chat.handleMessage({
        chatId: chat.currentChatId,
        message: content,
      });
      const aiMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessage(aiMsg));
      if (data.title) dispatch(setChatTitle(data.title));
    } catch (err) {
      setSendError(err.message || "Failed to get response. Try again.");
      setTimeout(() => setSendError(null), 5000);
    }
  }, [chat, dispatch]);

  const handleNewChat = useCallback(() => {
    chat.newChat();
    dispatch(clearMessages());
    dispatch(setChatTitle("New Chat"));
  }, [chat, dispatch]);

  const handleSelectChat = useCallback(async (chatId) => {
    try {
      dispatch(clearMessages());
      const msgs = await chat.fetchChatMessages(chatId);
      dispatch(
        setMessages(
          msgs.map((m) => ({
            id: m._id,
            role: m.role,
            content: m.content,
            timestamp: m.createdAt,
          })),
        ),
      );
      const selected = chat.chats.find((c) => c._id === chatId);
      if (selected) dispatch(setChatTitle(selected.title || "New Chat"));
      setSidebarOpen(false);
    } catch (err) {
      setSendError(err.message || "Failed to load chat");
      setTimeout(() => setSendError(null), 5000);
    }
  }, [chat, dispatch]);

  return (
    <div className="flex h-screen bg-[#08111d] overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeChat={chat.currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
      />

      <main className="flex-1 flex flex-col relative min-w-0">
        <AnimatedBackground />

        <AnimatePresence>
          {sendError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2
              px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl
              text-red-400 text-sm shadow-lg"
            >
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
              {sendError}
            </motion.div>
          )}
        </AnimatePresence>
        <header
          className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/5
          bg-[#0a0f1a]/40 backdrop-blur-xl"
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white
              transition-all duration-200"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          <h1 className="text-sm font-medium text-gray-300 truncate max-w-[200px] lg:max-w-md">
            {chatTitle}
          </h1>

          <div className="w-9" />
        </header>

        <div className="flex-1 overflow-y-auto relative z-10 scrollbar-hide">
          {messages.length === 0 && !chat.isLoading ? (
            <div className="flex flex-col items-center justify-center h-full px-4 py-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-8"
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500
                  flex items-center justify-center shadow-2xl shadow-violet-500/30"
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome back, {user?.username || "User"}
                </h2>
                <p className="text-gray-400 max-w-md">
                  How can I help you today? Ask me anything or choose a
                  suggestion below.
                </p>
              </motion.div>
              <SuggestedPrompts onSelect={handleSend} />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map((msg, index) => (
                <Message
                  key={msg.id}
                  message={msg}
                  isLast={index === messages.length - 1}
                />
              ))}
              {chat.isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <MessageInput onSend={handleSend} isLoading={chat.isLoading} />
      </main>
    </div>
  );
}
