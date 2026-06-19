"use client";

import { useRef, useState } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { Typography } from "@/components/ui/typography";
import { useDocuments } from "@/hooks/use-documents";
import { UploadCloud, File, Trash2, FileText, FileImage, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const getFileIcon = (type: string) => {
  if (type.includes("pdf")) return <FileText className="w-6 h-6 text-red-400" />;
  if (type.includes("image")) return <FileImage className="w-6 h-6 text-green-400" />;
  return <File className="w-6 h-6 text-blue-400" />;
};

export default function DocumentsPage() {
  const { documents, isLoading, uploadDocument, deleteDocument } = useDocuments();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (file: File) => {
    try {
      await uploadDocument.mutateAsync({ file });
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleUpload(file);
    }
  };

  return (
    <PageTransition className="pb-24">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Typography variant="h1" className="mb-2">Documents</Typography>
            <Typography variant="muted">Upload and manage your knowledge base sources.</Typography>
          </div>
          <Button onClick={() => fileInputRef.current?.click()} className="rounded-full">
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload File
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.txt,.md,.csv,.doc,.docx"
          />
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors mb-8 ${
            isDragging ? "border-primary bg-primary/5" : "border-border bg-card/50"
          } ${uploadDocument.isPending ? "opacity-50 pointer-events-none" : ""}`}
        >
          {uploadDocument.isPending ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <Typography variant="large">Uploading document...</Typography>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8 text-primary" />
              </div>
              <Typography variant="large" className="mb-2">Drag and drop your files here</Typography>
              <Typography variant="muted" className="mb-6">Supports PDF, TXT, MD, CSV, DOCX (Max 20MB)</Typography>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Browse Files</Button>
            </div>
          )}
        </div>

        {/* Documents List */}
        <div>
          <Typography variant="h3" className="mb-4">Your Files</Typography>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground animate-pulse">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 border border-border rounded-xl bg-card">
              <Typography variant="muted">No documents uploaded yet.</Typography>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="group relative p-5 rounded-xl border border-border bg-card hover:border-foreground/20 transition-all flex flex-col justify-between h-40">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-lg bg-background">
                      {getFileIcon(doc.file_type)}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteDocument.mutateAsync(doc.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive h-8 w-8 -mr-2 -mt-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-medium truncate text-foreground mb-1" title={doc.title}>{doc.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatBytes(doc.size_bytes)}</span>
                      {doc.processing_status === "completed" && <span className="text-green-500">Ready</span>}
                      {doc.processing_status === "failed" && <span className="text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Error</span>}
                      {(doc.processing_status === "pending" || doc.processing_status === "processing") && (
                        <span className="text-primary flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Processing</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
