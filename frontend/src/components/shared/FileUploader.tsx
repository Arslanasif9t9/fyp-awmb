import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, X, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface FileUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  isUploading: boolean;
}

export const FileUploader = ({ onUpload, isUploading }: FileUploaderProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 25 * 1024 * 1024, // 25MB
  });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    await onUpload(selectedFiles);
    setSelectedFiles([]); // Clear after upload
  };

  return (
    <div className="space-y-6">
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200",
          isDragActive 
            ? "border-primary bg-primary/5 scale-[0.99]" 
            : "border-border hover:border-primary/50 hover:bg-card"
        )}
      >
        <input {...getInputProps()} />
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <UploadCloud className={cn("h-8 w-8 text-primary", isDragActive && "animate-bounce")} />
        </div>
        <h3 className="text-lg font-bold mb-2">
          {isDragActive ? "Drop files here..." : "Click or drag files to upload"}
        </h3>
        <p className="text-sm text-foreground/60 max-w-sm mx-auto">
          Support for PDF, Images, and Text files. Max size: 25MB per file.
        </p>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
            <File className="h-4 w-4 text-primary" />
            Files Ready to Upload ({selectedFiles.length})
          </h4>
          
          {selectedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between bg-background p-3 rounded-lg border border-border/50">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-primary/10 p-2 rounded-md shrink-0">
                  <File className="h-4 w-4 text-primary" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-foreground/50">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(idx)}
                className="p-1.5 hover:bg-red-500/10 text-foreground/50 hover:text-red-500 rounded-md transition-colors"
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          <div className="pt-2">
            <Button 
              onClick={handleUpload} 
              className="w-full gap-2" 
              isLoading={isUploading}
            >
              {!isUploading && <CheckCircle2 className="h-4 w-4" />}
              {isUploading ? 'Uploading...' : 'Upload Files to World'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};