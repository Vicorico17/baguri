import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

type FileUploaderProps = {
  bucket: 'logos' | 'product-images';
  userId: string;
  onUpload: (url: string) => void;
  label?: string;
};

export default function FileUploader({ bucket, userId, onUpload, label }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${userId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) {
      alert('Upload failed: ' + error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    if (data?.publicUrl) {
      onUpload(data.publicUrl);
    }
    setUploading(false);
  };

  return (
    <div className="flex items-center gap-2">
      {label && <label>{label}</label>}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && (
        <svg className="animate-spin h-4 w-4 text-pink-500 ml-2" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
    </div>
  );
} 