import React, { useState, useEffect } from 'react';
import { parseQuizText } from './utils/parser';
import QuestionCard from './components/QuestionCard';
import HistoryBoard from './components/HistoryBoard';
import { Upload, BookOpen, ChevronLeft, ChevronRight, LayoutGrid, List, Trophy, Grid3X3, ArrowRight, Trash2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [systemQuizzes, setSystemQuizzes] = useState([]);
  const [customQuizzes, setCustomQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizName, setQuizName] = useState("");
  const [quizId, setQuizId] = useState("");
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('home'); // 'home', 'quiz', 'history'
  const [isFinished, setIsFinished] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    // Load history
    const savedHistory = localStorage.getItem('quiz_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    // Load custom quizzes from localStorage
    const savedCustom = localStorage.getItem('custom_quizzes');
    if (savedCustom) setCustomQuizzes(JSON.parse(savedCustom));

    // Load system quizzes from manifest
    fetch('/quizzes.json')
      .then(res => res.json())
      .then(data => setSystemQuizzes(data))
      .catch(err => console.log("Failed to load system quizzes"));
  }, []);

  const loadQuiz = (quiz, isCustom = false) => {
    if (isCustom) {
      // Find the quiz data in our state
      const quizData = customQuizzes.find(q => q.id === quiz.id);
      if (quizData) {
        setQuestions(quizData.questions);
        setQuizName(quizData.name);
        setQuizId(quizData.id);
        setupProgress(quizData.id);
      }
    } else {
      fetch(quiz.file)
        .then(res => res.text())
        .then(text => {
          const parsed = parseQuizText(text);
          if (parsed.length > 0) {
            setQuestions(parsed);
            setQuizName(quiz.name);
            setQuizId(quiz.id);
            setupProgress(quiz.id);
          }
        });
    }
  };

  const setupProgress = (id) => {
    const savedProgress = localStorage.getItem(`progress_${id}`);
    if (savedProgress) {
      const { index, score: savedScore } = JSON.parse(savedProgress);
      setCurrentIndex(index);
      setScore(savedScore);
    } else {
      setCurrentIndex(0);
      setScore(0);
    }
    setIsFinished(false);
    setView('quiz');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsed = parseQuizText(text);
      if (parsed.length === 0) {
        alert("Không tìm thấy câu hỏi hợp lệ trong tệp này.");
        return;
      }
      
      const newQuiz = {
        id: "custom_" + Date.now(),
        name: file.name.replace('.txt', ''),
        questions: parsed,
        isCustom: true,
        timestamp: Date.now()
      };

      const updatedCustom = [...customQuizzes, newQuiz];
      setCustomQuizzes(updatedCustom);
      localStorage.setItem('custom_quizzes', JSON.stringify(updatedCustom));
      
      // Auto-load it
      setQuestions(newQuiz.questions);
      setQuizName(newQuiz.name);
      setQuizId(newQuiz.id);
      setCurrentIndex(0);
      setScore(0);
      setIsFinished(false);
      setView('quiz');
    };
    reader.readAsText(file);
  };

  const deleteCustomQuiz = (id) => {
    setCustomQuizzes(prev => {
      const updated = prev.filter(q => q.id !== id);
      localStorage.setItem('custom_quizzes', JSON.stringify(updated));
      return updated;
    });
    localStorage.removeItem(`progress_${id}`);
    setDeletingId(null);
  };

  useEffect(() => {
    if (quizId && questions.length > 0 && !isFinished) {
      localStorage.setItem(`progress_${quizId}`, JSON.stringify({
        index: currentIndex,
        score: score
      }));
    }
  }, [currentIndex, score, quizId, questions, isFinished]);

  const handleResult = (isCorrect, next = false) => {
    if (next) {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        finishQuiz();
      }
      return;
    }
    
    if (isCorrect) setScore(prev => prev + 1);
  };

  const finishQuiz = () => {
    const entry = {
      quizName,
      score,
      total: questions.length,
      timestamp: Date.now()
    };
    const newHistory = [...history, entry];
    setHistory(newHistory);
    localStorage.setItem('quiz_history', JSON.stringify(newHistory));
    localStorage.removeItem(`progress_${quizId}`);
    setIsFinished(true);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('quiz_history');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <nav className="relative z-11 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">QuizMaster</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setView('home')} className={`px-4 py-2 rounded-lg transition-colors ${view === 'home' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>Trang chủ</button>
            <button onClick={() => setView('history')} className={`px-4 py-2 rounded-lg transition-colors ${view === 'history' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>Lịch sử</button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h1 className="text-5xl font-black text-white leading-tight">Thư viện <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">của bạn</span></h1>
                <p className="text-lg text-slate-400">Khám phá các bộ đề hệ thống hoặc quản lý các bộ đề bạn đã tải lên.</p>
              </div>

              {/* System Quizzes Section */}
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" /> Đề từ hệ thống
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {systemQuizzes.map((quiz) => (
                    <button key={quiz.id} onClick={() => loadQuiz(quiz)} className="glass p-6 rounded-2xl text-left group hover:border-indigo-500/50 transition-all duration-300">
                      <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <List className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{quiz.name}</h3>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest italic">Official</span>
                        <ArrowRight className="w-5 h-5 text-indigo-500 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Custom Quizzes Section */}
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" /> Đề của bạn
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customQuizzes.map((quiz) => (
                    <div key={quiz.id} className="relative group">
                      <div 
                        onClick={() => loadQuiz(quiz, true)} 
                        className="glass p-6 rounded-2xl text-left group-hover:border-emerald-500/50 transition-all duration-300 cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 pr-10">{quiz.name}</h3>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{quiz.questions.length} câu</span>
                          <ArrowRight className="w-5 h-5 text-emerald-500 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                      
                      <button 
                        type="button"
                        title="Xóa bộ đề"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeletingId(quiz.id);
                        }}
                        className="absolute top-3 right-3 p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all z-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  
                  <label className="glass p-6 rounded-2xl border-dashed border-2 border-slate-700/50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-800/30 transition-colors group min-h-[180px]">
                    <Upload className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    <div className="text-center">
                      <p className="font-bold text-slate-300">Tải đề mới</p>
                      <p className="text-xs text-slate-500">Kéo thả hoặc nhấn để chọn</p>
                    </div>
                    <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </section>
            </motion.div>
          )}

          {view === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <ChevronLeft className="w-5 h-5" /> Thoát
                </button>
                <div className="flex items-center gap-6">
                  <button onClick={() => setShowNav(!showNav)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${showNav ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 text-slate-400 hover:text-white'}`}>
                    <Grid3X3 className="w-4 h-4" /> Danh sách câu
                  </button>
                  <div className="text-center"><p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Điểm</p><p className="text-2xl font-black text-emerald-400">{score}</p></div>
                  <div className="text-center"><p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Câu</p><p className="text-2xl font-black text-indigo-400">{currentIndex + 1}/{questions.length}</p></div>
                </div>
              </div>
              <div className="grid lg:grid-cols-4 gap-8">
                <div className={`${showNav ? 'lg:col-span-3' : 'lg:col-span-4'} transition-all duration-300`}>
                  {questions.length > 0 && !isFinished ? (
                    <QuestionCard question={questions[currentIndex]} onResult={handleResult} />
                  ) : isFinished && (
                    <div className="glass p-12 rounded-3xl text-center max-w-xl mx-auto space-y-6">
                      <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto"><Trophy className="w-10 h-10 text-emerald-500" /></div>
                      <h2 className="text-3xl font-black text-white">Hoàn thành!</h2>
                      <p className="text-slate-400 text-lg">Đúng {score}/{questions.length} câu.</p>
                      <div className="pt-6 flex gap-4">
                        <button onClick={() => { setCurrentIndex(0); setScore(0); setIsFinished(false); }} className="premium-button-primary flex-1">Làm lại</button>
                        <button onClick={() => setView('home')} className="premium-button-secondary flex-1">Quay lại</button>
                      </div>
                    </div>
                  )}
                </div>
                <AnimatePresence>
                  {showNav && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass p-6 rounded-2xl h-fit max-h-[70vh] overflow-y-auto">
                      <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Grid3X3 className="w-4 h-4" /> Chọn câu</h3>
                      <div className="grid grid-cols-5 gap-2">
                        {questions.map((_, idx) => (
                          <button key={idx} onClick={() => { setCurrentIndex(idx); setShowNav(false); }} className={`w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-colors ${currentIndex === idx ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{idx + 1}</button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto">
              <HistoryBoard history={history} onClear={clearHistory} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingId(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative glass p-8 rounded-3xl max-w-sm w-full space-y-6 text-center border-rose-500/20"
            >
              <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8 text-rose-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Xác nhận xóa?</h3>
                <p className="text-slate-400">Hành động này không thể hoàn tác. Bộ đề và tiến độ sẽ bị xóa vĩnh viễn.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeletingId(null)}
                  className="premium-button-secondary flex-1"
                >
                  Hủy
                </button>
                <button 
                  onClick={() => deleteCustomQuiz(deletingId)}
                  className="premium-button-primary bg-rose-600 hover:bg-rose-500 shadow-rose-500/20 flex-1"
                >
                  Xác nhận xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
