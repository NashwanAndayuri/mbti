
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnalysisResult, AppState } from './types';
import { QUESTIONS } from './constants';
import { getAnalysisAndImage } from './services/geminiService';
import MentalHealthChart from './components/MentalHealthChart';
import { SendIcon, SparklesIcon, RestartIcon, EyeIcon, AlertIcon, MapIcon } from './components/Icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showVisualDescription, setShowVisualDescription] = useState(false);

  const processFinalAnalysis = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAnalysisAndImage(userAnswers);
      setAnalysisResult(result);
      setAppState(AppState.RESULTS);
    } catch (error) {
      console.error("Error during final analysis:", error);
      setAppState(AppState.ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [userAnswers]);

  const handleStart = () => {
    setAppState(AppState.IN_PROGRESS);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const updatedAnswers = [...userAnswers, userInput];
    setUserAnswers(updatedAnswers);
    setUserInput('');
    
    const nextQuestionIndex = currentQuestionIndex + 1;

    if (nextQuestionIndex < QUESTIONS.length) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentQuestionIndex(nextQuestionIndex);
        setIsLoading(false);
      }, 400);
    } else {
        setAppState(AppState.ANALYZING);
    }
  };

    useEffect(() => {
        if(appState === AppState.ANALYZING) {
            processFinalAnalysis();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appState]);


  const handleRestart = () => {
    setAppState(AppState.WELCOME);
    setUserInput('');
    setIsLoading(false);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setAnalysisResult(null);
    setShowVisualDescription(false);
  };
  
  const renderContent = () => {
    switch (appState) {
      case AppState.WELCOME:
        return (
          <div className="text-center p-8 flex flex-col items-center justify-center h-full max-w-2xl mx-auto animate-fade-in relative overflow-hidden">
            {/* Decorative background blobs */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl -z-10"></div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-[2rem] shadow-xl mb-8 animate-bounce-slow border border-white/20">
                <SparklesIcon className="w-12 h-12 text-indigo-500" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tight drop-shadow-sm leading-tight">
              Shadow Work <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Companion</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-md font-medium">
              Ready to meet yourself? 12 questions to uncover your hidden patterns and start your healing era.
            </p>
            <button
              onClick={handleStart}
              className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xl font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Begin Check-In
            </button>
          </div>
        );

      case AppState.IN_PROGRESS:
        const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;
        
        return (
          <div className="flex flex-col h-full w-full relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Top Navigation & Progress */}
            <div className="w-full p-8 md:p-10 z-10">
                <div className="flex items-center justify-between mb-4">
                    <span className="px-4 py-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur text-sm font-bold text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900">
                        Level {currentQuestionIndex + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                         {Math.round(progress)}% Complete
                    </span>
                </div>
                <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                    <div 
                        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 h-full transition-all duration-700 ease-out bg-[length:200%_100%] animate-[gradient_3s_ease_infinite]" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Question Content Area */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-20 relative z-10">
                <div 
                    key={currentQuestionIndex}
                    className="w-full max-w-4xl animate-[slideUp_0.6s_cubic-bezier(0.22,1,0.36,1)_forwards]"
                >
                    {/* Glassmorphism Card */}
                    <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/60 dark:border-gray-700/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative overflow-hidden">
                        
                        {/* Decorative Number */}
                        <div className="absolute top-[-20px] right-[-20px] text-[120px] md:text-[180px] font-black text-indigo-500/5 select-none leading-none italic">
                            {currentQuestionIndex + 1 < 10 ? `0${currentQuestionIndex + 1}` : currentQuestionIndex + 1}
                        </div>

                        {/* Question Text - UPDATED for Readability */}
                        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.15] tracking-tight relative z-10 mb-10 font-sans drop-shadow-sm">
                            {QUESTIONS[currentQuestionIndex]}
                        </h2>

                        {/* Integrated Input */}
                        <form onSubmit={handleSubmit} className="relative z-10">
                            <div className="relative group">
                                <textarea
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                    }
                                }}
                                autoFocus
                                placeholder="Type your thoughts here..."
                                disabled={isLoading}
                                rows={4}
                                className="w-full bg-white/60 dark:bg-gray-800/60 p-6 pr-16 rounded-2xl text-lg md:text-xl font-medium text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-transparent focus:border-indigo-200 transition-all resize-none shadow-inner"
                                />
                                <button
                                type="submit"
                                disabled={isLoading || !userInput.trim()}
                                className="absolute bottom-4 right-4 p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 hover:shadow-lg transition-all duration-300"
                                >
                                <SendIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wide">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                                Press Enter to continue
                            </div>
                        </form>
                    </div>
                </div>
            </div>
          </div>
        );

      case AppState.ANALYZING:
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
                <div className="relative w-32 h-32 mb-8">
                    <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-3 border-t-4 border-purple-400 rounded-full animate-spin reverse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <SparklesIcon className="w-10 h-10 text-indigo-500 animate-pulse" />
                    </div>
                </div>
                <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight">Connecting the dots...</h2>
                <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">Reviewing your shadow work and mapping your path.</p>
            </div>
        );
      
      case AppState.RESULTS:
      case AppState.ERROR:
        return (
          <div className="h-full overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50 scroll-smooth backdrop-blur-sm">
            {analysisResult ? (
              <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-8 pb-24">
                
                {/* Header */}
                <div className="text-center space-y-3 mb-12 pt-8">
                    <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-bold tracking-widest uppercase text-xs">
                        Analysis Complete
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                        {analysisResult.theme}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">
                        Your personal shadow work report
                    </p>
                </div>

                {/* 1. Chart (Top Priority) */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl shadow-indigo-100/50 dark:shadow-none border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400"></div>
                   <div className="flex items-center justify-between mb-8 border-b border-gray-50 dark:border-gray-700 pb-4">
                       <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                         <SparklesIcon className="w-6 h-6 text-indigo-500"/>
                         Mental Landscape
                       </h3>
                   </div>
                  <div className="h-72 w-full">
                    <MentalHealthChart data={analysisResult.chartData} />
                  </div>
                </div>

                {/* 2. Deep Analysis Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Vibe Check */}
                    <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                        <div className="relative z-10">
                            <h3 className="text-indigo-100 text-xs font-bold uppercase tracking-[0.2em] mb-4">The Vibe Check</h3>
                            <p className="text-2xl md:text-4xl font-bold leading-tight">"{analysisResult.vibeCheck}"</p>
                        </div>
                    </div>

                    {/* Deep Dive */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl">
                                <EyeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400"/>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Deep Dive</h3>
                        </div>
                        <ul className="space-y-5">
                            {analysisResult.deepDive.map((point, i) => (
                                <li key={i} className="flex gap-4 items-start group">
                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:scale-150 transition-transform duration-300 flex-shrink-0"></span>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg font-medium">{point}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Reality Check */}
                    <div className="bg-orange-50/80 dark:bg-orange-900/10 p-8 rounded-[2rem] shadow-lg border border-orange-100 dark:border-orange-900/20 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-2xl">
                                <AlertIcon className="w-6 h-6 text-orange-600 dark:text-orange-400"/>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reality Check</h3>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-xl italic font-medium relative z-10">
                            "{analysisResult.realityCheck}"
                        </p>
                    </div>

                    {/* Healing Roadmap */}
                    <div className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-2xl">
                                <MapIcon className="w-6 h-6 text-green-600 dark:text-green-400"/>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Healing Era Roadmap</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {analysisResult.healingRoadmap.map((step, i) => (
                                <div key={i} className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-3xl relative group hover:bg-indigo-50 dark:hover:bg-gray-700/50 transition-colors duration-300">
                                    <span className="absolute top-4 right-4 text-4xl font-black text-gray-200 dark:text-gray-600 group-hover:text-indigo-100 dark:group-hover:text-gray-600 transition-colors select-none">0{i+1}</span>
                                    <p className="text-gray-700 dark:text-gray-200 font-semibold relative z-10 pt-2 leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Interactive Visual Anchor */}
                <div 
                  onClick={() => setShowVisualDescription(!showVisualDescription)}
                  className="relative w-full aspect-video md:aspect-[2.5/1] overflow-hidden rounded-[2rem] shadow-2xl group cursor-pointer mt-12"
                >
                  <img 
                    src={analysisResult.imageUrl} 
                    alt="Life Path Visual" 
                    className={`w-full h-full object-cover transform transition-transform duration-[1.5s] ease-in-out ${showVisualDescription ? 'scale-110 blur-md' : 'group-hover:scale-105'}`} 
                  />
                  
                  {/* Default Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent transition-opacity duration-500 ${showVisualDescription ? 'opacity-0' : 'opacity-100'}`}></div>
                  
                  {/* Default Text (Hidden when clicked) */}
                  <div className={`absolute bottom-0 left-0 p-8 md:p-12 w-full transition-all duration-500 ${showVisualDescription ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-1 bg-white/50 backdrop-blur rounded-full"></div>
                        <p className="text-white/90 text-xs font-bold uppercase tracking-[0.3em]">Visual Anchor</p>
                      </div>
                      <h3 className="text-white text-3xl md:text-5xl font-medium italic tracking-wide">{analysisResult.theme}</h3>
                      <p className="text-white/60 text-xs mt-4 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        Tap image to interpret
                      </p>
                  </div>

                  {/* Active Overlay (Shown when clicked) */}
                  <div className={`absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center transition-all duration-500 ${showVisualDescription ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                      <h4 className="text-white text-2xl font-bold mb-6 tracking-tight border-b border-white/20 pb-4">Visual Interpretation</h4>
                      <p className="text-white text-lg md:text-2xl font-medium leading-relaxed max-w-3xl italic">
                        "{analysisResult.visualDescription}"
                      </p>
                      <p className="text-white/40 text-xs mt-8 uppercase tracking-widest hover:text-white transition-colors">Tap to close</p>
                  </div>
                </div>

                <div className="flex justify-center pt-8">
                    <button
                        onClick={handleRestart}
                        className="flex items-center space-x-3 px-10 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <RestartIcon className="w-5 h-5" />
                        <span>Start A New Journey</span>
                    </button>
                </div>

              </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <p className="text-red-500 text-lg mb-4">We hit a snag generating your analysis. It happens!</p>
                    <button onClick={handleRestart} className="px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700">Try Again</button>
                </div>
            )}
          </div>
        );
    }
  };

  return (
    <main className="h-screen w-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center md:p-6 font-sans antialiased selection:bg-indigo-200 selection:text-indigo-900">
        <style>{`
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(40px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes gradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            .reverse { animation-direction: reverse; }
        `}</style>
      <div className="w-full max-w-6xl h-full md:h-[95vh] bg-white dark:bg-gray-900 md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-800 relative">
        {renderContent()}
      </div>
    </main>
  );
};

export default App;
