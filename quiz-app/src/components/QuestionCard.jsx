import React, { useState, useEffect } from 'react';
import { Check, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const QuestionCard = ({ question, currentIndex, savedAnswer, onResult, onRetryQuestion }) => {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  // Restore or reset state when question or savedAnswer changes
  useEffect(() => {
    if (savedAnswer) {
      setSelected(savedAnswer.selected);
      setSubmitted(savedAnswer.submitted);
      setIsCorrect(savedAnswer.isCorrect);
    } else {
      setSelected(null);
      setSubmitted(false);
      setIsCorrect(null);
    }
  }, [question.id, savedAnswer]);

  const handleSubmit = () => {
    if (selected === null) return;
    const correct = question.options.find(o => o.isCorrect);
    const wasCorrect = selected === correct.label;
    setIsCorrect(wasCorrect);
    setSubmitted(true);
    onResult(wasCorrect, false, selected);
  };

  const handleRetry = () => {
    setSelected(null);
    setSubmitted(false);
    setIsCorrect(null);
    if (onRetryQuestion) {
      onRetryQuestion(currentIndex);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass p-4 sm:p-6 rounded-2xl w-full max-w-2xl mx-auto"
    >
      <div className="mb-4 sm:mb-6">
        <span className="text-xs sm:text-sm font-medium text-indigo-400 uppercase tracking-wider">Câu {question.id}</span>
        <h2 className="text-lg sm:text-xl font-bold mt-1.5 sm:mt-2 text-slate-100 leading-relaxed">
          {question.question}
        </h2>
      </div>

      <div className="space-y-3">
        {question.options.map((opt) => {
          const isSelected = selected === opt.label;
          const showSuccess = submitted && opt.isCorrect;
          const showDanger = submitted && isSelected && !opt.isCorrect;

          return (
            <button
              key={opt.label}
              disabled={submitted}
              onClick={() => setSelected(opt.label)}
              className={cn(
                "w-full flex items-center p-3 sm:p-4 rounded-xl text-left transition-all duration-200 border-2 cursor-pointer",
                "bg-slate-800/30 border-slate-700/50 hover:border-indigo-500/50",
                isSelected && "border-indigo-500 bg-indigo-500/10",
                showSuccess && "border-emerald-500 bg-emerald-500/10 text-emerald-400",
                showDanger && "border-rose-500 bg-rose-500/10 text-rose-400",
                submitted && !isSelected && !opt.isCorrect && "opacity-50 grayscale-[0.5]"
              )}
            >
              <div className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold mr-3 sm:mr-4 shrink-0 text-sm sm:text-base",
                "bg-slate-700 text-slate-300",
                isSelected && "bg-indigo-600 text-white",
                showSuccess && "bg-emerald-600 text-white",
                showDanger && "bg-rose-600 text-white"
              )}>
                {opt.label}
              </div>
              <span className="flex-1 text-sm sm:text-base text-slate-200">{opt.text}</span>
              
              <AnimatePresence>
                {showSuccess && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-2">
                    <Check className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                  </motion.div>
                )}
                {showDanger && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-2">
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      <div className="mt-6 sm:mt-8 flex flex-row gap-3 sm:gap-4">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className="premium-button-primary flex-1 py-2 sm:py-3 text-sm sm:text-base cursor-pointer"
          >
            Nộp câu hỏi
          </button>
        ) : (
          <>
            <button
              onClick={handleRetry}
              className="premium-button-secondary flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-3 text-sm sm:text-base cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden min-[360px]:inline">Làm lại</span><span className="min-[360px]:hidden">Lại</span>
            </button>
            <button
              onClick={() => onResult(null, true)} // Signal to go to next
              className="premium-button-primary flex-1 py-2 sm:py-3 text-sm sm:text-base cursor-pointer"
            >
              Câu tiếp theo
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default QuestionCard;
