import { useRef, useState } from 'react';
import { validateFile, MAX_IMAGES, ALLOWED_TYPES } from '../utils/storageUtils';

interface ImageUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  existingImageUrls?: string[];
}

export default function ImageUploader({ files, onChange, existingImageUrls = [] }: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalCount = files.length + existingImageUrls.length;

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    setError(null);

    const newFiles: File[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }
      newFiles.push(file);
    }

    const combined = [...files, ...newFiles];
    if (combined.length + existingImageUrls.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    onChange(combined);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
    setError(null);
  };

  return (
    <div className="image-uploader">
      <p>Upload images (JPEG, PNG, WebP — max 5MB each, up to {MAX_IMAGES} total)</p>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        style={{ marginTop: 8 }}
      />
      {error && <div className="form-error" style={{ marginTop: 8 }}>{error}</div>}
      <p style={{ fontSize: '0.8rem', color: '#888', marginTop: 4 }}>
        {totalCount} / {MAX_IMAGES} images selected
      </p>
      <div className="image-uploader-previews">
        {existingImageUrls.map((url, i) => (
          <div key={`existing-${i}`} className="image-uploader-preview">
            <img src={url} alt={`Existing ${i + 1}`} />
          </div>
        ))}
        {files.map((file, i) => (
          <div key={`new-${i}`} className="image-uploader-preview">
            <img src={URL.createObjectURL(file)} alt={`Preview ${i + 1}`} />
            <button type="button" onClick={() => removeFile(i)} aria-label="Remove image">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
