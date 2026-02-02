'use client';
import { useState } from 'react';
import { Upload, Copy, Check, Image as ImageIcon } from 'lucide-react';

export default function ImageUpload({ onUploadComplete }: { onUploadComplete?: (url: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

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
    } catch (error) {
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
        {onUploadComplete ? "Upload de Imagem do Produto" : "Upload de Imagens (R2)"}
      </h2>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="w-full sm:w-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="w-full sm:w-auto bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {uploading ? '...' : 'Enviar'}
            </button>
        </div>

        {message && (
            <p className={`text-xs font-medium ${message.includes('sucesso') ? 'text-green-600' : 'text-red-500'}`}>
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
