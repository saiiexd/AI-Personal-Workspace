"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, Trash, Search, RefreshCw, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDocuments } from "@/hooks/use-documents";
import { useRef, useState } from "react";
import { GradientArt } from "@/components/ui/gradient-art";

export default function DocumentsPage() {
  const { documents, isLoading, uploadDocument, deleteDocument } = useDocuments();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    await uploadDocument.mutateAsync({ file });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Purge this library item?")) {
      await deleteDocument.mutateAsync(id);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-[85vh] w-full flex flex-col justify-between px-8 md:px-20 py-12 z-10 overflow-hidden">
      
      {/* Information Flows Artwork */}
      <GradientArt type="documents" />

      {/* Editorial Header */}
      <div className="max-w-4xl mt-12 md:mt-20 relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs uppercase tracking-[0.3em] text-[#ebd7c8] mb-6 font-medium"
        >
          Knowledge Repository
        </motion.p>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-8xl font-light tracking-tight text-white mb-6 leading-none"
        >
          Knowledge <span className="italic font-serif text-[#ebd7c8]">Library</span>
        </motion.h1>

        <p className="text-lg text-white/40 font-light leading-relaxed max-w-2xl mb-12">
          Your semantic memory base. Upload publications, papers, or logs. Antigravity segments, vectorizes, and indexes the content for instant contextual intelligence.
        </p>

        {/* Action Dock (Search + Upload) */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input 
              placeholder="Search library documents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/[0.02] border-white/5 h-12 rounded-full text-sm placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/10" 
            />
          </div>

          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.txt,.docx"
            />
            <button
              onClick={handleUploadClick}
              disabled={uploadDocument.isPending}
              className="h-12 px-6 rounded-full bg-white/5 border border-white/10 hover:bg-white hover:text-black hover:border-white transition-all text-xs font-medium tracking-wider text-[#ebd7c8] flex items-center justify-center gap-2"
            >
              {uploadDocument.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-current" />
                  <span>Ingesting File...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-current" />
                  <span>Add Publication</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Publications Workspace - Book Cover / Editorial Cards */}
      <div className="relative z-10 mt-20 pb-32">
        {isLoading ? (
          <div className="flex items-center gap-2 text-white/30 py-20">
            <p className="text-xs uppercase tracking-widest font-mono">Syncing Library Grid...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex flex-col items-start py-20 text-white/30 max-w-sm"
          >
            <p className="text-[10px] uppercase tracking-widest font-mono">No publications found. Add documents to build your semantic network.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <AnimatePresence>
              {filteredDocs.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, delay: i * 0.04 }}
                  className="group relative flex flex-col justify-between aspect-[3/4] p-6 bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all duration-700 rounded-2xl cursor-default"
                >
                  {/* Subtle hover gradient reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#ebd7c8]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl pointer-events-none" />

                  {/* Header of the "book" */}
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-white/30">
                      {doc.file_type || "PDF"}
                    </span>
                    <button 
                      onClick={(e) => handleDelete(doc.id, e)}
                      className="w-7 h-7 rounded-full bg-white/5 hover:bg-red-500/10 text-white/30 hover:text-red-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title and details */}
                  <div className="mt-8 flex-1 flex flex-col justify-end">
                    <h3 className="font-light text-xl text-white group-hover:text-[#ebd7c8] transition-colors duration-500 line-clamp-4 leading-tight mb-4">
                      {doc.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-[10px] font-mono text-white/40 tracking-wider">
                      <span>{(doc.size_bytes / 1024 / 1024).toFixed(1)} MB</span>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{
                          backgroundColor: doc.processing_status === 'completed' ? '#c8dad1' : doc.processing_status === 'failed' ? '#e6cabc' : '#ebd7c8'
                        }} />
                        <span className="uppercase tracking-widest text-[9px]">{doc.processing_status}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
