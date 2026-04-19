import React, { useState, useCallback } from 'react';
import { Upload, FileVideo, AlertCircle } from 'lucide-react';
import { useVisionStore } from '../../store/visionStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

export const VideoUploader: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { uploadVideo, startLocalAnalysis } = useVisionStore();

  const validateAndUpload = useCallback((file: File) => {
    setLocalError(null);

    if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith('.mp4')) {
      setLocalError('対応していないファイル形式です（mp4, mov, avi のみ対応）。');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setLocalError('ファイルサイズが大きすぎます（上限 500MB）。');
      return;
    }

    uploadVideo(file);
  }, [uploadVideo]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndUpload(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "relative group cursor-pointer transition-all duration-300",
          "mhw-panel border-2 border-dashed flex flex-col items-center justify-center p-12 min-h-[300px]",
          isDragging ? "border-mhw-accent bg-mhw-accent/10" : "border-mhw-accent/30 hover:border-mhw-accent/60"
        )}
      >
        <input
          type="file"
          accept=".mp4,.mov,.avi"
          onChange={onFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={cn(
            "p-6 rounded-full bg-mhw-panel border border-mhw-accent/20 transition-transform duration-500",
            isDragging ? "scale-110 rotate-12 bg-mhw-accent/20" : "group-hover:scale-105"
          )}>
            <Upload className="w-12 h-12 text-mhw-accent" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-mhw-accent tracking-widest uppercase mb-2">
              Select Video Scan Data
            </h3>
            <p className="text-sm opacity-60">
              Drag and drop video files or click to browse
            </p>
          </div>

          <div className="flex gap-4 mt-6">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-mhw-panel/50 border border-mhw-accent/10 rounded-full text-[10px] uppercase tracking-tighter opacity-70">
              <FileVideo className="w-3 h-3" />
              mp4 / mov / avi
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-mhw-panel/50 border border-mhw-accent/10 rounded-full text-[10px] uppercase tracking-tighter opacity-70">
              Max 500MB
            </div>
          </div>
        </div>

        {/* Decorative corner lines */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-mhw-accent/40" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-mhw-accent/40" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-mhw-accent/40" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-mhw-accent/40" />
      </div>

      {localError && (
        <div className="mt-4 p-4 bg-mhw-danger/10 border border-mhw-danger/30 rounded flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-mhw-danger shrink-0 mt-0.5" />
          <p className="text-sm text-mhw-danger">{localError}</p>
        </div>
      )}

      {/* Debug/Verification: Local Path Input */}
      <div className="mt-12 pt-8 border-t border-mhw-accent/20">
        <div className="text-center mb-4">
          <p className="text-[10px] uppercase tracking-widest text-mhw-accent/40 font-bold">Debug / Dev Override</p>
        </div>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const path = formData.get('localPath') as string;
            if (path) startLocalAnalysis(path);
          }}
          className="flex gap-2"
        >
          <input
            name="localPath"
            type="text"
            placeholder="サーバー上の絶対パスを入力 (e.g. C:\Users\...)"
            className="flex-1 bg-mhw-panel border border-mhw-accent/20 px-4 py-2 text-sm focus:border-mhw-accent/60 outline-none transition-colors"
          />
          <button
            type="submit"
            className="mhw-button px-4 py-2 whitespace-nowrap text-xs"
          >
            解析開始 (Path)
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoUploader;
