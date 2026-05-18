import React, { useState, useEffect } from 'react';
import { parseQuizText } from './utils/parser';
import QuestionCard from './components/QuestionCard';
import HistoryBoard from './components/HistoryBoard';
import { Upload, BookOpen, ChevronLeft, ChevronRight, LayoutGrid, List, Trophy, Grid3X3, ArrowRight, Trash2, User, Home, History, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [systemQuizzes, setSystemQuizzes] = useState([]);
  const [customQuizzes, setCustomQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const score = Object.values(userAnswers).filter(a => a.isCorrect).length;
  const [quizName, setQuizName] = useState("");
  const [quizId, setQuizId] = useState("");
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('home'); // 'home', 'quiz', 'history'
  const [isFinished, setIsFinished] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const getQuestionBtnClass = (idx) => {
    const isCurrent = currentIndex === idx;
    const answer = userAnswers[idx];
    
    if (isCurrent) {
      return 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30';
    }
    
    if (answer) {
      if (answer.isCorrect) {
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30';
      } else {
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30';
      }
    }
    
    return 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent';
  };

  const handleRetryQuestion = (index) => {
    setUserAnswers(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  useEffect(() => {
    // Load history
    const savedHistory = localStorage.getItem('quiz_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    // Load custom quizzes from localStorage
    const savedCustom = localStorage.getItem('custom_quizzes');
    if (savedCustom) setCustomQuizzes(JSON.parse(savedCustom));

    // Load system quizzes from manifest
    fetch(`${import.meta.env.BASE_URL}quizzes.json`)
      .then(res => res.json())
      .then(data => setSystemQuizzes(data))
      .catch(err => console.error("Failed to load system quizzes:", err));
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
      // For system quizzes, ensure path is correct relative to base
      const filePath = quiz.file.startsWith('/') ? quiz.file.substring(1) : quiz.file;
      fetch(`${import.meta.env.BASE_URL}${filePath}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.text();
        })
        .then(text => {
          const parsed = parseQuizText(text);
          if (parsed.length > 0) {
            setQuestions(parsed);
            setQuizName(quiz.name);
            setQuizId(quiz.id);
            setupProgress(quiz.id);
          } else {
            console.error("Parsed quiz is empty for file:", filePath);
          }
        })
        .catch(err => {
          console.error("Failed to load quiz file:", err);
          alert("Không thể tải bộ đề này. Vui lòng kiểm tra kết nối hoặc tệp tin.");
        });
    }
  };

  const setupProgress = (id) => {
    const savedProgress = localStorage.getItem(`progress_${id}`);
    if (savedProgress) {
      const { index, answers } = JSON.parse(savedProgress);
      setCurrentIndex(index);
      setUserAnswers(answers || {});
    } else {
      setCurrentIndex(0);
      setUserAnswers({});
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
      setUserAnswers({});
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
        score: score,
        answers: userAnswers
      }));
    }
  }, [currentIndex, score, quizId, questions, isFinished, userAnswers]);

  const handleResult = (isCorrect, next = false, selectedOption = null) => {
    if (next) {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        finishQuiz();
      }
      return;
    }
    
    setUserAnswers(prev => ({
      ...prev,
      [currentIndex]: {
        selected: selectedOption,
        isCorrect: isCorrect,
        submitted: true
      }
    }));
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

      <nav className="relative z-20 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white hidden xs:inline min-[360px]:inline">SpeedQuizMaker</span>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={() => setView('home')} 
              className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center gap-2 ${view === 'home' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Trang chủ</span>
            </button>
            <button 
              onClick={() => setView('history')} 
              className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center gap-2 ${view === 'history' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Lịch sử</span>
            </button>
            <button 
              onClick={() => setView('help')} 
              className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center gap-2 ${view === 'help' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Hướng dẫn</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-12">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 sm:space-y-12">
              <div className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto">
                <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">Thư viện <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">của bạn</span></h1>
                <p className="text-sm sm:text-lg text-slate-400">Khám phá các bộ đề hệ thống hoặc quản lý các bộ đề bạn đã tải lên.</p>
              </div>

              {/* System Quizzes Section */}
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" /> Đề từ hệ thống
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
            <motion.div key="quiz" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-4 sm:space-y-8">
              <div className="flex flex-row items-center justify-between gap-2 mb-4 sm:mb-8 bg-slate-900/40 p-3 sm:p-0 rounded-2xl border border-slate-800/50 sm:border-0 sm:bg-transparent">
                <button onClick={() => setView('home')} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm sm:text-base">
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden min-[360px]:inline">Thoát</span>
                </button>
                <div className="flex items-center gap-3 sm:gap-6">
                  <button onClick={() => setShowNav(!showNav)} className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border transition-colors text-xs sm:text-sm ${showNav ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 text-slate-400 hover:text-white'}`}>
                    <Grid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Danh sách câu</span><span className="sm:hidden">Chọn câu</span>
                  </button>
                  <div className="text-center min-w-[36px]"><p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest font-bold">Điểm</p><p className="text-base sm:text-2xl font-black text-emerald-400">{score}</p></div>
                  <div className="text-center min-w-[48px]"><p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest font-bold">Câu</p><p className="text-base sm:text-2xl font-black text-indigo-400">{currentIndex + 1}/{questions.length}</p></div>
                </div>
              </div>
              <div className="grid lg:grid-cols-4 gap-6 sm:gap-8">
                <div className={`${showNav ? 'lg:col-span-3' : 'lg:col-span-4'} transition-all duration-300`}>
                  {questions.length > 0 && !isFinished ? (
                    <QuestionCard 
                      question={questions[currentIndex]} 
                      currentIndex={currentIndex}
                      savedAnswer={userAnswers[currentIndex]}
                      onResult={handleResult}
                      onRetryQuestion={handleRetryQuestion}
                    />
                  ) : isFinished && (
                    <div className="glass p-6 sm:p-12 rounded-3xl text-center max-w-xl mx-auto space-y-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto"><Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" /></div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">Hoàn thành!</h2>
                      <p className="text-slate-400 text-base sm:text-lg">Đúng {score}/{questions.length} câu.</p>
                      <div className="pt-4 sm:pt-6 flex gap-3 sm:gap-4">
                        <button onClick={() => { setCurrentIndex(0); setUserAnswers({}); setIsFinished(false); }} className="premium-button-primary flex-1 py-2 sm:py-3">Làm lại</button>
                        <button onClick={() => setView('home')} className="premium-button-secondary flex-1 py-2 sm:py-3">Quay lại</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar list selection on desktop */}
                <div className="hidden lg:block">
                  <AnimatePresence>
                    {showNav && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass p-6 rounded-2xl h-fit max-h-[70vh] overflow-y-auto">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Grid3X3 className="w-4 h-4" /> Chọn câu</h3>
                        <div className="grid grid-cols-5 gap-2">
                          {questions.map((_, idx) => (
                            <button 
                              key={idx} 
                              onClick={() => { setCurrentIndex(idx); setShowNav(false); }} 
                              className={`w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${getQuestionBtnClass(idx)}`}
                            >
                              {idx + 1}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom sheet selector on mobile */}
                <div className="lg:hidden">
                  <AnimatePresence>
                    {showNav && (
                      <>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setShowNav(false)}
                          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm"
                        />
                        <motion.div 
                          initial={{ y: "100%" }}
                          animate={{ y: 0 }}
                          exit={{ y: "100%" }}
                          transition={{ type: "spring", damping: 25, stiffness: 200 }}
                          className="fixed bottom-0 left-0 right-0 z-50 glass p-6 rounded-t-3xl h-[60vh] overflow-y-auto border-t border-slate-700"
                        >
                          <div className="w-12 h-1.5 bg-slate-600 rounded-full mx-auto mb-6 cursor-pointer" onClick={() => setShowNav(false)} />
                          <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-lg"><Grid3X3 className="w-5 h-5 text-indigo-400" /> Chọn câu hỏi</h3>
                          <div className="grid grid-cols-5 sm:grid-cols-8 gap-3 justify-items-center">
                            {questions.map((_, idx) => (
                              <button 
                                key={idx} 
                                onClick={() => { setCurrentIndex(idx); setShowNav(false); }} 
                                className={`w-12 h-12 rounded-xl text-base font-bold flex items-center justify-center transition-all ${getQuestionBtnClass(idx)}`}
                              >
                                {idx + 1}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto">
              <HistoryBoard history={history} onClear={clearHistory} />
            </motion.div>
          )}

          {view === 'help' && (
            <motion.div key="help" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-black text-white">Hướng dẫn <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">tạo đề</span></h1>
                <p className="text-lg text-slate-400">Chỉ mất 1 phút để soạn một bộ đề ôn tập chuẩn.</p>
              </div>

              <div className="glass p-8 rounded-3xl space-y-6">
                <section className="space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center text-indigo-400 text-sm">1</div>
                    Cấu trúc câu hỏi
                  </h3>
                  <p className="text-slate-400">Mỗi câu hỏi cần tuân thủ cấu trúc sau để hệ thống có thể nhận diện chính xác:</p>
                  <div className="bg-slate-950/50 p-6 rounded-2xl font-mono text-sm border border-slate-800 text-indigo-300">
                    <p>Câu 1: Nội dung câu hỏi ở đây?</p>
                    <p>A. Đáp án lựa chọn 1</p>
                    <p>*B. Đáp án lựa chọn 2 (Đây là đáp án đúng)</p>
                    <p>C. Đáp án lựa chọn 3</p>
                    <p>D. Đáp án lựa chọn 4</p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center text-indigo-400 text-sm">2</div>
                    Quy tắc quan trọng
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-slate-300">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span>Bắt đầu bằng cụm từ <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">Câu n:</code> (ví dụ: Câu 1:, Câu 2:).</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-300">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span>Sử dụng dấu <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">*</code> ngay trước chữ cái đáp án đúng (ví dụ: <code className="text-emerald-400 font-bold">*A.</code>).</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-300">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span>Lưu tệp dưới định dạng văn bản thuần túy (<code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">.txt</code>) với mã hóa **UTF-8** để hiển thị đúng tiếng Việt.</span>
                    </li>
                  </ul>
                </section>

                <div className="pt-6 border-t border-slate-800">
                  <button 
                    onClick={() => setView('home')}
                    className="premium-button-primary w-full"
                  >
                    Đã hiểu, quay lại trang chủ
                  </button>
                </div>
              </div>
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
