import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop';
import { X, Check } from 'lucide-react';
import getCroppedImg from '@/utils/cropImage';

interface PhotoCropperProps {
  imageSrc: string;
  onCancel: () => void;
  onSave: (croppedImageUrl: string) => void;
}

export function PhotoCropper({ imageSrc, onCancel, onSave }: PhotoCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        onSave(croppedImage);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      <div className="flex justify-between items-center p-4 text-white z-10 bg-black/50">
        <button onClick={onCancel} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-bold">Sesuaikan Foto (1:1)</h2>
        <button onClick={handleSave} className="p-2 bg-green-600 rounded-full hover:bg-green-500">
          <Check className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onCropComplete={handleCropComplete}
          onZoomChange={setZoom}
          cropShape="round"
          showGrid={false}
        />
      </div>

      <div className="p-6 bg-black/50 text-white flex justify-center z-10">
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full max-w-md accent-indigo-500"
        />
      </div>
    </div>
  );
}
