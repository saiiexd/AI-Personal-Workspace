"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Trash, Layers, Maximize2, Minimize2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNotes, useNote } from "@/hooks/use-notes";
import { cn } from "@/lib/utils";
import { GradientArt } from "@/components/ui/gradient-art";

export default function NotesPage() {
  const [search, setSearch] = useState("");
  const { notes, isLoading, createNote, updateNote, deleteNote } = useNotes(search);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const { note: currentNote, isLoading: isNoteLoading } = useNote(selectedNoteId);

  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (notes.length > 0 && !selectedNoteId) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId]);

  useEffect(() => {
    if (currentNote) {
      setEditTitle(currentNote.title);
      setEditContent(currentNote.content);
    } else {
      setEditTitle("");
      setEditContent("");
    }
  }, [currentNote]);

  const handleAutosave = (updatedTitle: string, updatedContent: string) => {
    if (!selectedNoteId) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      updateNote.mutate({
        id: selectedNoteId,
        title: updatedTitle,
        content: updatedContent,
      });
    }, 800);
  };

  const handleCreate = async () => {
    const newNote = await createNote.mutateAsync({
      title: "",
      content: "",
    });
    setSelectedNoteId(newNote.id);
  };

  const handleDelete = async () => {
    if (!selectedNoteId) return;
    if (!window.confirm("Purge this note from the database?")) return;
    await deleteNote.mutateAsync(selectedNoteId);
    setSelectedNoteId(null);
  };

  return (
    <div className="flex h-full w-full relative overflow-hidden">
      
      {/* Background Knowledge Waves */}
      <GradientArt type="notes" />

      {/* Cognitive Library Sidebar (Hidden in Focus Mode) */}
      <AnimatePresence>
        {!focusMode && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="h-full flex flex-col relative z-20 shrink-0 border-r border-white/5 bg-[#050505]/40 backdrop-blur-3xl overflow-hidden"
          >
            <div className="p-8 pb-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[10px] font-medium tracking-[0.25em] uppercase text-white/40 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#b8c2d1]" /> Cognitive Storage
                </h2>
                <button 
                  onClick={handleCreate}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input
                  placeholder="Search thoughts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 bg-white/[0.02] border-white/5 h-11 rounded-full text-xs placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/10"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 pb-20 custom-scrollbar space-y-1">
              {isLoading ? (
                <div className="space-y-3 mt-4 px-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-2xl bg-white/[0.02] animate-pulse" />
                  ))}
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center p-8 opacity-50">
                  <p className="text-[10px] uppercase tracking-widest font-mono text-white/30">No entries</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className="group relative cursor-pointer"
                  >
                    <div className={cn(
                      "p-5 rounded-2xl transition-all duration-500 relative z-10 overflow-hidden",
                      selectedNoteId === note.id 
                        ? "bg-white/[0.04] shadow-md border border-white/5" 
                        : "hover:bg-white/[0.02]"
                    )}>
                      {selectedNoteId === note.id && (
                        <motion.div 
                          layoutId="active-note-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#b8c2d1] rounded-r-full"
                        />
                      )}
                      <h3 className={cn(
                        "font-light text-sm mb-1 truncate transition-colors",
                        selectedNoteId === note.id ? "text-white" : "text-white/50 group-hover:text-white/80"
                      )}>
                        {note.title || "Untitled"}
                      </h3>
                      <p className="text-xs text-white/30 line-clamp-1 leading-relaxed">
                        {note.content?.replace(/<[^>]*>/g, "") || "Empty node"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Editorial Writing Canvas */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        {isNoteLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/30 z-10">
            <p className="text-[10px] uppercase tracking-widest font-mono">Accessing Workspace...</p>
          </div>
        ) : currentNote ? (
          <div className="relative z-10 flex flex-col h-full w-full mx-auto">
            
            {/* Minimal Ambient Toolbar */}
            <div className="h-20 flex items-center justify-between px-8 md:px-12 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className="w-9 h-9 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-white/50 hover:text-white transition-all flex items-center justify-center"
                  title={focusMode ? "Show Sidebar" : "Distraction-Free Mode"}
                >
                  {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <div className="flex items-center gap-2 opacity-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c8dad1]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/80">Draft</span>
                </div>
              </div>
              <button 
                onClick={handleDelete}
                className="w-9 h-9 rounded-full bg-white/[0.03] hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all flex items-center justify-center"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
            
            {/* Massive Writing Viewport */}
            <div className="flex-1 overflow-y-auto px-8 md:px-20 lg:px-32 pt-12 pb-40 custom-scrollbar relative">
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-[700px] mx-auto"
              >
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    handleAutosave(e.target.value, editContent);
                  }}
                  placeholder="Draft Title"
                  className="w-full text-4xl md:text-6xl font-light tracking-tight bg-transparent border-none outline-none text-white placeholder:text-white/10 focus:ring-0 leading-tight mb-8"
                />
                
                <textarea
                  value={editContent}
                  onChange={(e) => {
                    setEditContent(e.target.value);
                    handleAutosave(editTitle, e.target.value);
                  }}
                  placeholder="Begin detailing your project objectives or thought streams..."
                  className="w-full min-h-[50vh] bg-transparent border-none outline-none text-white/70 leading-[2] text-base md:text-lg resize-none focus:ring-0 placeholder:text-white/20 selection:bg-[#c8dad1]/20 font-light"
                />
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10 opacity-30">
            <p className="text-[10px] uppercase tracking-widest font-mono text-white/50">Select or initialize a thought</p>
          </div>
        )}
      </div>
    </div>
  );
}
