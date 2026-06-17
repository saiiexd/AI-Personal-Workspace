"use client";

import { motion } from "framer-motion";
import { UploadCloud, FileText, Trash, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDocuments } from "@/hooks/use-documents";
import { useRef, useState } from "react";

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

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this document? This will remove its embedded semantic search chunks.")) {
      await deleteDocument.mutateAsync(id);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-1">Your knowledge base, fully indexed for semantic search.</p>
        </div>
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <Button onClick={handleUploadClick} className="gap-2" disabled={uploadDocument.isPending}>
            {uploadDocument.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" /> Upload Document
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search documents..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-white/5 border-white/10" 
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-zinc-500 py-12">Loading documents...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center text-zinc-500 py-12">No documents uploaded yet. Try uploading a PDF, TXT or DOCX file!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all cursor-pointer"
            >
              <div className="absolute top-4 right-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(doc.id)}
                  className="w-8 h-8 text-zinc-400 hover:text-rose-400 transition-colors"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              
              <h3 className="font-semibold text-zinc-100 truncate mb-1 pr-6" title={doc.title}>{doc.title}</h3>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                  <span>{doc.file_type.toUpperCase()}</span>
                  <span>•</span>
                  <span>{(doc.size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${
                  doc.processing_status === 'completed' 
                    ? 'text-emerald-500' 
                    : doc.processing_status === 'failed' 
                    ? 'text-rose-500' 
                    : 'text-amber-500 animate-pulse'
                }`}>
                  {doc.processing_status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
