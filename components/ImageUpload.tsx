'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Loader2, Check } from 'lucide-react';
import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label: string;
  enableCrop?: boolean;
  aspect?: number;
}

export default function ImageUpload({ value, onChange, label, enableCrop = false, aspect = 1 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const uploadFile = async (file: File | Blob) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file as Blob);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onChange(data.url);
      setImageSrc(null); // Reset crop mode
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (enableCrop) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
      });
      reader.readAsDataURL(file);
    } else {
      await uploadFile(file);
    }
  };

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setUploading(true);
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImageBlob) {
        await uploadFile(croppedImageBlob);
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao cortar imagem');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    setImageSrc(null);
  };

  if (imageSrc) {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label} - Ajustar Imagem</label>
        <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Zoom:</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setImageSrc(null)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={uploading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCropSave}
              disabled={uploading}
              className="px-4 py-2 text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors flex items-center gap-2"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Salvar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      {value ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
          <div className="absolute top-2 right-2 z-10">
            <button
              type="button"
              onClick={handleRemove}
              className="bg-emerald-700 text-white p-1 rounded-full hover:bg-emerald-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <Image
            src={value}
            alt={label}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <Loader2 className="w-8 h-8 mb-4 text-gray-500 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
              )}
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Clique para upload</span> ou arraste
              </p>
              <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        </div>
      )}
    </div>
  );
}
