import { motion } from "framer-motion";
import { FiZap, FiCode, FiBookOpen, FiTrendingUp } from "react-icons/fi";

const suggestions = [
  {
    icon: <FiZap className="w-5 h-5" />,
    title: "Explain a concept",
    prompt: "Explain how quantum entanglement works in simple terms",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: <FiCode className="w-5 h-5" />,
    title: "Write code",
    prompt: "Write a React component with hooks for a todo list",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <FiBookOpen className="w-5 h-5" />,
    title: "Summarize text",
    prompt: "Summarize the key principles of clean code architecture",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: <FiTrendingUp className="w-5 h-5" />,
    title: "Analyze trends",
    prompt: "What are the latest trends in AI and machine learning?",
    color: "from-violet-500 to-purple-500",
  },
];

export default function SuggestedPrompts({ onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto px-4">
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={suggestion.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(suggestion.prompt)}
          className="flex items-start gap-3 p-4 rounded-xl text-left
            bg-white/5 backdrop-blur-sm border border-white/10
            hover:border-white/20 hover:bg-white/10
            transition-all duration-300 group"
        >
          <div className={`p-2 rounded-lg bg-gradient-to-br ${suggestion.color}
            shadow-lg group-hover:shadow-xl transition-shadow`}>
            {suggestion.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-white group-hover:text-violet-300
              transition-colors">
              {suggestion.title}
            </p>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{suggestion.prompt}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
