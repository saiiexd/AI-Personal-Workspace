"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Search, MoreHorizontal, FileText, Calendar, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNotes, useNote } from "@/hooks/use-notes";
import { useWorkspaceStore } from "@/store/workspace-store";

export default function NotesPage() {
  const [search, setSearch] = useState("");
  const { currentWorkspace } = useWorkspaceStore();
  const { notes, isLoading, createNote, updateNote, deleteNote } = useNotes(search);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const { note: currentNote, isLoading: isNoteLoading } = useNote(selectedNoteId);

  // Local state for editing to prevent cursor issues while typing
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update selectedNoteId when notes list loaded
  useEffect(() => {
    if (notes.length > 0 && !selectedNoteId) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId]);

  // Sync editor fields when current note changes
  useEffect(() => {
    if (currentNote) {
      setEditTitle(currentNote.title);
      setEditContent(currentNote.content);
    } else {
      setEditTitle("");
      setEditContent("");
    }
  }, [currentNote]);

  // Debounced Autosave handler
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
      title: "Untitled Note",
      content: "Start writing here...",
    });
    setSelectedNoteId(newNote.id);
  };

  const handleDelete = async () => {
    if (!selectedNoteId) return;
    const confirm = window.confirm("Are you sure you want to delete this note?");
    if (!confirm) return;
    await deleteNote.mutateAsync(selectedNoteId);
    setSelectedNoteId(null);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar List */}
      <div className="w-80 border-r border-white/5 bg-background flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Notes</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCreate}
              className="h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notes..."
              className="pl-8 bg-white/5 border-white/10 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-zinc-500 text-sm">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="p-4 text-zinc-500 text-sm">No notes found.</div>
          ) : (
            notes.map((note) => (
              <motion.div
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${
                  selectedNoteId === note.id ? "bg-white/5" : ""
                }`}
              >
                <h3 className="font-medium text-sm mb-1 truncate text-zinc-100">{note.title}</h3>
                <p className="text-xs text-zinc-500 line-clamp-2 mb-2">
                  {note.content?.replace(/<[^>]*>/g, "") || "Empty note"}
                </p>
                <div className="flex items-center text-[10px] text-zinc-600 font-medium">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(note.updated_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
      
      {/* Editor Area */}
      <div className="flex-1 bg-zinc-950 flex flex-col overflow-hidden">
        {isNoteLoading ? (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            Loading note content...
          </div>
        ) : currentNote ? (
          <>
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
              <div className="text-sm text-zinc-500 font-medium">
                Last updated {new Date(currentNote.updated_at).toLocaleTimeString()}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDelete}
                className="text-zinc-400 hover:text-rose-400 transition-colors"
                title="Delete note"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 lg:px-24">
              <div className="max-w-3xl mx-auto space-y-8">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    handleAutosave(e.target.value, editContent);
                  }}
                  placeholder="Note Title"
                  className="w-full text-4xl font-bold bg-transparent border-none outline-none text-zinc-100 focus:ring-0"
                />
                
                <textarea
                  value={editContent}
                  onChange={(e) => {
                    setEditContent(e.target.value);
                    handleAutosave(editTitle, e.target.value);
                  }}
                  placeholder="Start writing here..."
                  className="w-full h-[60vh] bg-transparent border-none outline-none text-zinc-300 leading-relaxed resize-none focus:ring-0"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            Select or create a note to begin.
          </div>
        )}
      </div>
    </div>
  );
}
