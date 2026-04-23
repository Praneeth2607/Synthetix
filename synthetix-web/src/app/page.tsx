"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, UploadCloud, BrainCircuit, Activity, RefreshCcw, CheckCircle2, ChevronRight, LogOut, UserCircle, History, Headphones } from "lucide-react";
import axios from "axios";
import KnowledgeGraph from "../components/KnowledgeGraph";
import HistoryDrawer from "../components/HistoryDrawer";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Home() {
  const [textInput, setTextInput] = useState("");
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<any>(null);
  const [genGraph, setGenGraph] = useState(true);
  const [genSummary, setGenSummary] = useState(true);
  const [numSummary, setNumSummary] = useState(5);
  const [genQuiz, setGenQuiz] = useState(true);
  const [numQuiz, setNumQuiz] = useState(3);
  const [genAudio, setGenAudio] = useState(true);
  
  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  
  const [session, setSession] = useState<any>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSynthesize = async () => {
    if (!textInput && !file) return;

    setIsSynthesizing(true);
    setSynthesisResult(null);
    setSelectedAnswers({});
    setQuizSubmitted(false);

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const formData = new FormData();
      if (textInput) formData.append("text", textInput);
      if (query) formData.append("query", query);
      if (file) formData.append("files", file);
      
      if (currentSession?.user?.id) formData.append("user_id", currentSession.user.id);
      if (currentSession?.access_token) formData.append("access_token", currentSession.access_token);
      
      formData.append("generate_graph", genGraph.toString());
      formData.append("generate_summary", genSummary.toString());
      formData.append("generate_quiz", genQuiz.toString());
      formData.append("generate_audio", genAudio.toString());
      formData.append("num_summary", numSummary.toString());
      formData.append("num_quiz", numQuiz.toString());

      const res = await axios.post("http://localhost:8000/synthesize", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setSynthesisResult(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to synthesize material. Ensure backend is running.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden text-slate-100 p-8 sm:p-24">
      {/* Background Decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Synthetix.</h1>
              <p className="text-sm text-slate-400">The Ultimate Academic Synthesis Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <button onClick={() => setIsHistoryOpen(true)} className="hidden sm:flex glass px-4 py-2 rounded-full font-medium text-purple-300 hover:text-white hover:bg-purple-500/10 transition-colors text-sm items-center gap-2 border border-purple-500/30">
                  <History className="w-4 h-4" /> History
                </button>
                <button onClick={() => supabase.auth.signOut()} className="hidden sm:flex glass px-4 py-2 rounded-full font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-sm items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className="glass px-5 py-2 rounded-full font-medium text-indigo-300 hover:bg-indigo-500/10 transition-colors flex gap-2 items-center text-sm border border-indigo-500/30">
                <UserCircle className="w-4 h-4" /> Sign In
              </Link>
            )}
            <div className="glass px-4 py-2 rounded-full font-medium text-emerald-400 flex gap-2 items-center text-sm border border-emerald-500/20">
              <Activity className="w-4 h-4" /> System Online
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Input Nexus */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass-card">
              <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Input Nexus
              </h2>
              <p className="text-slate-400 text-sm mb-6">Drop your study materials, lecture notes, or diagrams here.</p>

              <div 
                className="border-2 border-dashed border-white/10 hover:border-indigo-500/50 transition-colors rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer bg-white/5"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-14 h-14 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                  <UploadCloud className="w-7 h-7 text-indigo-300 animate-float" />
                </div>
                <h3 className="font-medium text-slate-200 mb-1">Click to Upload Documents</h3>
                <p className="text-xs text-slate-400">Supports PDF, PNG, JPG, TXT (Max 10MB)</p>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.png,.jpg,.jpeg,.txt" 
                />
              </div>

              {file && (
                <div className="mt-4 p-3 bg-indigo-500/10 rounded-lg flex items-center justify-between border border-indigo-500/20">
                  <span className="text-sm font-medium text-indigo-200 truncate">{file.name}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              )}

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#0b0f19] text-slate-500">OR DIRECT INPUT</span>
                </div>
              </div>

              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste your raw notes or syllabus topics here..."
                className="mt-6 w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all"
              />

              <div className="mt-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Optional: Ask a specific question about your notes..."
                  className="w-full bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-3 text-sm text-slate-200 placeholder-indigo-300/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-medium text-slate-400 flex items-center justify-between">
                  <span>Synthesis Modules</span>
                  <span className="text-xs font-normal opacity-50">Toggle to save API usage</span>
                </h3>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setGenGraph(!genGraph)}>
                  <span className="text-sm text-slate-200">Knowledge Graph</span>
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors ${genGraph ? "bg-indigo-500" : "bg-slate-700"}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${genGraph ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
                </div>
                <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/10 transition-colors">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setGenSummary(!genSummary)}>
                    <span className="text-sm text-slate-200">Flash Revision Deck</span>
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${genSummary ? "bg-indigo-500" : "bg-slate-700"}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${genSummary ? "translate-x-4" : "translate-x-0"}`} />
                    </div>
                  </div>
                  {genSummary && (
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 border-t border-white/5 pt-2">
                      <span className="w-16">Cards: {numSummary}</span>
                      <input type="range" min="3" max="10" value={numSummary} onChange={(e) => setNumSummary(parseInt(e.target.value))} className="flex-1 accent-indigo-500" />
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/10 transition-colors">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setGenQuiz(!genQuiz)}>
                    <span className="text-sm text-slate-200">Knowledge Probe</span>
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${genQuiz ? "bg-indigo-500" : "bg-slate-700"}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${genQuiz ? "translate-x-4" : "translate-x-0"}`} />
                    </div>
                  </div>
                  {genQuiz && (
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 border-t border-white/5 pt-2">
                      <span className="w-16">Questions: {numQuiz}</span>
                      <input type="range" min="3" max="10" value={numQuiz} onChange={(e) => setNumQuiz(parseInt(e.target.value))} className="flex-1 accent-indigo-500" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/10 transition-colors">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setGenAudio(!genAudio)}>
                    <span className="text-sm text-slate-200">Audio Podcast</span>
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${genAudio ? "bg-indigo-500" : "bg-slate-700"}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${genAudio ? "translate-x-4" : "translate-x-0"}`} />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSynthesize}
                disabled={isSynthesizing || (!textInput && !file)}
                className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSynthesizing ? (
                  <>
                    <RefreshCcw className="w-5 h-5 animate-spin" /> Synthesizing Data...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-5 h-5" /> Ignite Synthesis
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel: Synthesized Canvas */}
          <div className="lg:col-span-7">
            <div className="glass-card min-h-[600px] flex flex-col relative overflow-hidden">
              
              {!isSynthesizing && !synthesisResult && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-24 h-24 mb-6 relative">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-2 bg-indigo-500/40 rounded-full blur-lg"></div>
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Synthetix&colors=indigo" alt="AI Agent" className="w-full h-full relative z-10 rounded-full bg-slate-900 border-2 border-indigo-500/50" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Awaiting Intelligence</h3>
                  <p className="text-slate-400 max-w-md">Feed the Nexus with your academic material to generate a custom-tailored Knowledge Graph, Flash Deck, and Knowledge Probe.</p>
                </div>
              )}

              {isSynthesizing && (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="w-32 h-32 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-8"></div>
                  <motion.h3 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="text-xl font-medium text-indigo-300 text-gradient"
                  >
                    Processing neural pathways...
                  </motion.h3>
                </div>
              )}

              <AnimatePresence>
                {synthesisResult && !isSynthesizing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8"
                  >
                    {/* Query Answer */}
                    {synthesisResult.query_answer && (
                      <section>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-indigo-500/30 pb-2">
                          <span className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm">QA</span>
                          Specific Contextual Answer
                        </h3>
                        <div className="bg-indigo-900/30 border border-indigo-500/30 p-6 rounded-xl text-slate-200 leading-relaxed">
                          {synthesisResult.query_answer}
                        </div>
                      </section>
                    )}

                    {/* Audio Podcast Container */}
                    {genAudio && (
                      <section className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 rounded-2xl border border-amber-500/20 p-6 shadow-xl relative overflow-hidden group">
                         {/* Subtle background glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/20 transition-all duration-700"></div>
                        
                        <div className="relative z-10">
                          <h3 className="text-xl font-bold mb-5 flex items-center gap-3 text-amber-100">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                              <Headphones className="w-5 h-5 text-amber-400" />
                            </div>
                            AI Synthesis Podcast
                          </h3>
                          
                          {synthesisResult.audio_base64 ? (
                            <div className="space-y-6">
                              <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                                <audio 
                                  controls 
                                  className="w-full custom-audio-player h-10"
                                  src={`data:audio/mp3;base64,${synthesisResult.audio_base64}`}
                                />
                              </div>
                              
                              {synthesisResult.podcast_script && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-amber-200/70 uppercase tracking-widest">Transcript Brief</h4>
                                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">ONYX VOICE</span>
                                  </div>
                                  <div className="bg-slate-900/40 rounded-xl p-4 border border-white/5 text-sm text-slate-300 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar italic font-serif">
                                    "{synthesisResult.podcast_script}"
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3 p-4 bg-amber-500/5 rounded-xl border border-dashed border-amber-500/20 text-amber-200/60 text-sm">
                              <div className="flex items-center gap-3">
                                <Activity className="w-4 h-4 animate-pulse" />
                                <span>Podcast is still being neural-drafted or is unavailable.</span>
                              </div>
                              {synthesisResult.podcast_error && (
                                <div className="mt-2 text-[10px] font-mono bg-black/30 p-2 rounded border border-white/5 text-amber-500/50">
                                  Error Trace: {synthesisResult.podcast_error}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </section>
                    )}

                    {/* Knowledge Graph */}
                    {genGraph && (
                      <section>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                          <span className="w-6 h-6 rounded bg-pink-500/20 text-pink-400 flex items-center justify-center text-sm">1</span>
                          Interactive Knowledge Graph
                        </h3>
                        <KnowledgeGraph data={synthesisResult.knowledge_graph} />
                      </section>
                    )}

                    {/* Flash Revision Deck */}
                    {genSummary && synthesisResult.summary && (
                      <section>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                          <span className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">2</span>
                          Flash Revision Deck
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {synthesisResult.summary?.map((point: string, idx: number) => (
                            <div key={idx} className="bg-indigo-900/20 border border-indigo-500/20 p-4 rounded-xl hover:bg-indigo-800/30 transition-colors">
                              <p className="text-sm text-indigo-100 leading-relaxed">{point}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Knowledge Probe */}
                    {genQuiz && synthesisResult.quiz && (
                      <section>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                          <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">3</span>
                          Knowledge Probe
                        </h3>
                        <div className="space-y-4 mb-6">
                          {synthesisResult.quiz?.map((q: any, qIdx: number) => (
                            <div key={qIdx} className="bg-white/5 border border-white/10 p-5 rounded-xl">
                              <h4 className="font-medium text-slate-200 mb-4 flex items-start gap-2">
                                <span className="text-emerald-400">Q{qIdx + 1}:</span> {q.question}
                              </h4>
                              <div className="space-y-2">
                                {q.options?.map((opt: string, optIdx: number) => {
                                  const isSelected = selectedAnswers[qIdx] === opt;
                                  const isCorrect = opt === q.answer;
                                  
                                  let btnClass = "w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between ";
                                  let indicator = null;

                                  if (!quizSubmitted) {
                                    btnClass += isSelected 
                                      ? "bg-indigo-600/30 border-indigo-500 shadow-sm shadow-indigo-500/20 "
                                      : "bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-slate-500 cursor-pointer ";
                                  } else {
                                    if (isCorrect) {
                                      btnClass += "bg-emerald-600/30 border-emerald-500 ";
                                      indicator = <span className="text-xs text-emerald-400 font-medium">{isSelected ? "Correct!" : "Correct Answer"}</span>;
                                    } else if (isSelected && !isCorrect) {
                                      btnClass += "bg-red-600/30 border-red-500/50 ";
                                      indicator = <span className="text-xs text-red-400 font-medium">Your Answer (Incorrect)</span>;
                                    } else {
                                      btnClass += "bg-slate-800/20 border-slate-700/50 opacity-50 cursor-default ";
                                    }
                                  }

                                  return (
                                    <button 
                                      key={optIdx} 
                                      disabled={quizSubmitted}
                                      onClick={() => setSelectedAnswers(prev => ({...prev, [qIdx]: opt}))}
                                      className={btnClass}
                                    >
                                      <span className="text-sm text-slate-300">{opt}</span>
                                      {indicator}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {!quizSubmitted && (
                          <button 
                            onClick={() => setQuizSubmitted(true)}
                            disabled={Object.keys(selectedAnswers).length === 0}
                            className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${Object.keys(selectedAnswers).length > 0 ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-700/50 text-slate-500 cursor-not-allowed hidden'}`}
                          >
                            <CheckCircle2 className="w-5 h-5" /> Submit Quiz
                          </button>
                        )}
                        {quizSubmitted && (
                           <div className="w-full py-3 rounded-xl bg-slate-800 border border-slate-700 text-center text-sm text-slate-300 flex items-center justify-center gap-2">
                             Analysis Complete
                           </div>
                        )}
                      </section>
                    )}

                  </motion.div>
                )}
              </AnimatePresence>
              
            </div>
          </div>

        </div>
      </div>
      
      {/* History Drawer */}
      <HistoryDrawer 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        onSelect={(data) => setSynthesisResult(data)} 
      />
    </main>
  );
}
