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
    <div className="glass p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-100">
          <Trophy className="w-5 h-5 text-amber-500" /> Lịch sử ôn tập
        </h3>
        <button 
          onClick={onClear}
          className="p-2 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-colors"
          title="Xóa lịch sử"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {history.slice().reverse().map((entry, idx) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={entry.timestamp}
            className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 flex justify-between items-center"
          >
            <div>
              <p className="text-sm text-slate-400">
                {new Date(entry.timestamp).toLocaleString('vi-VN')}
              </p>
              <p className="font-semibold text-slate-200">{entry.quizName}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-indigo-400">
                {entry.score}/{entry.total}
              </p>
              <p className="text-xs text-slate-500">
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
