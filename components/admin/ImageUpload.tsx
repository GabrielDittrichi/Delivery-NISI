'use client';
import { useState } from 'react';
import { Copy, Check, Image as ImageIcon } from 'lucide-react';

export default function ImageUpload({
  onUploadComplete,
  accept = 'image/*',
  title = 'Upload de Imagem do Produto',
}: {
  onUploadComplete?: (url: string) => void;
  accept?: string;
  title?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const inputId = `upload-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage('');
      if (!onUploadComplete) setUploadedUrl('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || 'Erro ao fazer upload');
      } else {
        const url = data.url;
        setUploadedUrl(url);
        setMessage('Upload realizado com sucesso!');
        setFile(null);
        if (onUploadComplete) {
            onUploadComplete(url);
        }
      }
    } catch {
      setMessage('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uploadedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={onUploadComplete ? "bg-gray-50 p-4 rounded-lg border" : "bg-white p-6 rounded-lg shadow-sm"}>
      <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
        <ImageIcon size={18} />
        {onUploadComplete ? title : "Upload de Imagens (R2)"}
      </h2>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <input 
                id={inputId}
                type="file" 
                accept={accept}
                onChange={handleFileChange}
                className="sr-only"
            />
            <label
                htmlFor={inputId}
                className="flex min-h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-emerald-50 sm:w-72"
            >
                <span className="truncate">{file ? file.name : 'Escolher arquivo'}</span>
                <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                    Procurar
                </span>
            </label>
            <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !file}
                className="w-full sm:w-auto bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-800 disabled:opacity-50 transition-colors"
            >
                {uploading ? '...' : 'Enviar'}
            </button>
        </div>

        {message && (
            <p className={`text-xs font-medium ${message.includes('sucesso') ? 'text-green-600' : 'text-emerald-700'}`}>
                {message}
            </p>
        )}

        {!onUploadComplete && uploadedUrl && (
            <div className="mt-4 p-3 bg-white rounded border space-y-2">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        readOnly 
                        value={uploadedUrl}
                        className="flex-1 border rounded p-1 text-xs text-gray-600"
                    />
                    <button 
                        onClick={copyToClipboard}
                        className="p-1 border rounded hover:bg-gray-100 text-gray-600"
                        title="Copiar URL"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
