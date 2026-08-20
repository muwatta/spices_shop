"use client";

import { useEffect, useRef, useState } from "react";

export default function VisualSearchButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
  }

  function clearPhoto() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="visual-search">
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} hidden />
      <button className="visual-search__trigger" type="button" onClick={() => inputRef.current?.click()} aria-label="Search products with a photo" title="Search with a photo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
        <span>Photo search</span>
      </button>
      {preview && (
        <div className="visual-search__preview" role="status">
          <img src={preview} alt="Captured product" />
          <div>
            <strong>Photo ready</strong>
            <span>{fileName}</span>
          </div>
          <button type="button" onClick={clearPhoto} aria-label="Remove captured photo">×</button>
        </div>
      )}
    </div>
  );
}
