"use client";

import { useState } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { Typography } from "@/components/ui/typography";
import { useNotes } from "@/hooks/use-notes";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotesPage() {
  const { notes, isLoading, createNote, deleteNote } = useNotes();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      await createNote.mutateAsync({
        title: newTitle,
        content: newContent,
      });
      setNewTitle("");
      setNewContent("");
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to create note", error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      await deleteNote.mutateAsync(id);
    }
  };

  return (
    <PageTransition className="pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Typography variant="h1" className="mb-2">Notes</Typography>
            <Typography variant="muted">Capture ideas, draft documents, and build knowledge.</Typography>
          </div>
          <Button onClick={() => setIsAdding(true)} className="rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Note Form */}
        {isAdding && (
          <form onSubmit={handleCreateNote} className="mb-8 p-6 border border-border rounded-xl bg-card shadow-sm">
            <input
              type="text"
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Note Title"
              className="w-full bg-transparent border-b border-border/50 text-foreground focus:outline-none focus:border-primary text-2xl font-medium mb-4 pb-2 transition-colors"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Start writing..."
              rows={4}
              className="w-full bg-transparent border-none text-foreground/80 focus:outline-none focus:ring-0 text-base mb-6 resize-y"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" disabled={!newTitle.trim() || !newContent.trim() || createNote.isPending}>
                {createNote.isPending ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground animate-pulse">Loading notes...</div>
        ) : notes.length === 0 && !isAdding ? (
          <div className="text-center py-24 border border-dashed border-border rounded-xl">
            <Typography variant="muted" className="mb-4">Your workspace is empty.</Typography>
            <Button variant="outline" onClick={() => setIsAdding(true)}>Write your first note</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className="group flex flex-col p-6 rounded-xl border border-border bg-card hover:border-foreground/20 hover:shadow-sm transition-all duration-200 cursor-pointer h-48"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-medium text-foreground line-clamp-1">{note.title}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-4 flex-1">
                  {note.content}
                </p>
                <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
                  <span>{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
