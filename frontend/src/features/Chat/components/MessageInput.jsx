import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FiSend, FiPaperclip } from "react-icons/fi";

export default function MessageInput({ onSend, isLoading }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-white/5 bg-[#0a0f1a]/60 backdrop-blur-xl p-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 p-2 rounded-2xl
          bg-white/5 backdrop-blur-sm border border-white/10
          focus-within:border-violet-500/50 focus-within:bg-white/10
          transition-all duration-300 shadow-lg">
          <button
            className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-violet-400
              transition-all duration-200 flex-shrink-0"
            title="Attach file"
          >
            <FiPaperclip className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none
              focus:outline-none py-2 max-h-40 text-sm leading-relaxed"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
            className={`p-2.5 rounded-xl flex-shrink-0 transition-all duration-200
              ${
                message.trim() && !isLoading
                  ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
                  : "bg-white/5 text-gray-500 cursor-not-allowed"
              }`}
          >
            <FiSend className="w-5 h-5" />
          </motion.button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-3">
          Perplexity AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
