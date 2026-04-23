import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { X, Clock, BrainCircuit, FileText } from "lucide-react";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (synthesisResult: any) => void;
}

export default function HistoryDrawer({ isOpen, onClose, onSelect }: HistoryDrawerProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    // Fetch syntheses along with their parent document title
    const { data, error } = await supabase
      .from("syntheses")
      .select(`
        *,
        documents (
          title
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setHistory(data);
    }
    setLoading(false);
  };

  const handleSelect = (record: any) => {
    // Reconstruct the synthesisResult format expected by the frontend
    const reconstructed = {
      query_answer: record.query_answer,
      summary: record.summary,
      quiz: record.quiz,
      knowledge_graph: record.knowledge_graph
    };
    onSelect(reconstructed);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 border-l border-white/10 z-50 p-6 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Clock className="w-5 h-5 text-indigo-400" />
                Session History
              </h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-2">
              {loading ? (
                <div className="text-center py-10 text-slate-500">Loading history...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                  <BrainCircuit className="w-12 h-12 mb-4 opacity-20" />
                  <p>No past sessions found.</p>
                  <p className="text-sm mt-2">Generate something to see it here!</p>
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 cursor-pointer transition-all flex flex-col gap-2 group"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-slate-200 flex items-center gap-2 line-clamp-1">
                        <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        {item.documents?.title || "Direct Input"}
                      </h3>
                      <span className="text-xs text-slate-500 flex-shrink-0">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {item.query && (
                      <p className="text-sm text-slate-400 line-clamp-2 italic">
                        Q: "{item.query}"
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {item.knowledge_graph && <span className="text-xs px-2 py-1 rounded bg-pink-500/10 text-pink-400">Graph</span>}
                      {item.summary && <span className="text-xs px-2 py-1 rounded bg-purple-500/10 text-purple-400">Flashcards</span>}
                      {item.quiz && <span className="text-xs px-2 py-1 rounded bg-indigo-500/10 text-indigo-400">Quiz</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
