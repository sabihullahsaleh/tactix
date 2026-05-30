'use client';

import { useRef, useState } from 'react';
import { useLineupStore } from '@/lib/store/lineupStore';
import { supabase } from '@/lib/supabase/client';
import { Camera, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  playerId: string;
  currentImageUrl: string;
  className?: string;
};

export default function PlayerPhotoUpload({ playerId, currentImageUrl, className }: Props) {
  const { updatePlayerImageUrl } = useLineupStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }

    setError('');
    setUploading(true);

    // Immediate local preview regardless of upload path
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      if (supabase) {
        // Upload via server route to keep service key server-side
        const fd = new FormData();
        fd.append('file', file);
        fd.append('playerId', playerId);
        const res = await fetch('/api/upload-photo', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Upload failed');
          setPreview(currentImageUrl);
          return;
        }
        updatePlayerImageUrl(playerId, data.url);
        setPreview(data.url);
      } else {
        // No Supabase — use blob URL for in-session preview
        updatePlayerImageUrl(playerId, localUrl);
      }
    } catch {
      setError('Upload failed. Using local preview.');
      updatePlayerImageUrl(playerId, localUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn('relative group', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center"
        title="Upload player photo"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Player photo" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5 border-2 border-dashed border-white/20 rounded-2xl">
            <Camera size={16} className="text-white/30" />
          </div>
        )}

        {/* Always-visible camera badge + hover overlay */}
        {!uploading && (
          <>
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={14} className="text-white" />
            </div>
            <div className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 border border-white/20 flex items-center justify-center group-hover:opacity-0 transition-opacity">
              <Camera size={9} className="text-white/60" />
            </div>
          </>
        )}

        {/* Uploading spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
            <Loader2 size={14} className="text-cyan-400 animate-spin" />
          </div>
        )}
      </button>

      {error && (
        <p className="text-[9px] text-red-400 mt-1 text-center leading-tight">{error}</p>
      )}
    </div>
  );
}
