import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiMessageSquare,
  FiSearch,
  FiLogOut,
  FiX,
  FiTrash2,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { useAuth } from "../../Auth/hooks/useAuth";
import { useChat } from "../../Chat/hooks/useChat";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isDesktop;
}

function formatDate(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "Previous 7 Days";
  return "Previous 30 Days";
}

export default function Sidebar({ isOpen, onToggle, activeChat, onSelectChat, onNewChat }) {
  const { user } = useSelector((state) => state.auth);
  const { handleLogout } = useAuth();
  const { chats, fetchChats, deleteChat } = useChat();
  const [searchQuery, setSearchQuery] = useState("");
  const isDesktop = useIsDesktop();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const filteredChats = chats.filter((c) =>
    (c.title || "New Chat").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedChats = filteredChats.reduce((acc, c) => {
    const group = formatDate(c.lastMessageAt || c.createdAt);
    if (!acc[group]) acc[group] = [];
    acc[group].push(c);
    return acc;
  }, {});

  const isVisible = isDesktop || isOpen;

  return (
    <>
      <AnimatePresence>
        {isOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isVisible ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed lg:relative z-40 top-0 left-0 h-full w-72 flex flex-col
          bg-[#0a0f1a]/90 backdrop-blur-xl border-r border-white/5"
      >
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500
              flex items-center justify-center shadow-lg shadow-violet-500/20">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-lg font-semibold bg-gradient-to-r from-violet-400 to-blue-400
              bg-clip-text text-transparent">
              Perplexity AI
            </span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
              bg-gradient-to-r from-violet-600/20 to-blue-600/20
              border border-violet-500/20 hover:border-violet-500/40
              text-white font-medium transition-all duration-200
              shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20"
          >
            <FiPlus className="w-5 h-5 text-violet-400" />
            <span>New Chat</span>
          </motion.button>
        </div>

        <div className="px-3 pb-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10
                text-sm text-gray-300 placeholder-gray-500
                focus:outline-none focus:border-violet-500/50 focus:bg-white/10
                transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-hide">
          {Object.entries(groupedChats).map(([date, groupChats]) => (
            <div key={date} className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 mb-2">
                {date}
              </p>
              <div className="space-y-1">
                {groupChats.map((c) => (
                  <div
                    key={c._id}
                    className="group flex items-center"
                  >
                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={() => onSelectChat(c._id)}
                      className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                        transition-all duration-200
                        ${
                          activeChat === c._id
                            ? "bg-white/10 border border-white/10 shadow-md"
                            : "hover:bg-white/5 border border-transparent"
                        }`}
                    >
                      <FiMessageSquare
                        className={`w-4 h-4 flex-shrink-0 transition-colors
                          ${activeChat === c._id ? "text-violet-400" : "text-gray-500 group-hover:text-gray-400"}`}
                      />
                      <span className="text-sm text-gray-300 truncate group-hover:text-white
                        transition-colors">
                        {c.title || "New Chat"}
                      </span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Delete this chat?")) {
                          deleteChat(c._id);
                        }
                      }}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100
                        hover:bg-red-500/10 text-gray-500 hover:text-red-400
                        transition-all duration-200 ml-1"
                      title="Delete chat"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-blue-500
              flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-sm">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.username || "User"}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email || "user@email.com"}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400
                transition-all duration-200"
              title="Logout"
            >
              <FiLogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
