import React from 'react';
import { Trophy, Clock, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const HistoryBoard = ({ history, onClear }) => {
  if (history.length === 0) {
    return (
      <div className="glass p-8 rounded-2xl text-center">
        <Clock className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <p className="text-slate-400">Chưa có lịch sử làm bài nào.</p>
      </div>
    );
  }

  return (
    <div className="glass p-4 sm:p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-100">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" /> Lịch sử ôn tập
        </h3>
        <button 
          onClick={onClear}
          className="p-2 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-colors cursor-pointer"
          title="Xóa lịch sử"
        >
          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto pr-1 sm:pr-2">
        {history.slice().reverse().map((entry, idx) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={entry.timestamp}
            className="p-3 sm:p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 flex justify-between items-center gap-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-400 truncate">
                {new Date(entry.timestamp).toLocaleString('vi-VN')}
              </p>
              <p className="font-semibold text-slate-200 text-sm sm:text-base truncate">{entry.quizName}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-base sm:text-xl font-bold text-indigo-400">
                {entry.score}/{entry.total}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500">
                {Math.round((entry.score / entry.total) * 100)}%
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HistoryBoard;
