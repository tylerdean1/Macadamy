import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import { Area } from '../lib/types';
import { Area } from '@/lib/types';
import { Button } from './ui/button';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
  aspectRatio?: number;
}

/**
 * A component that allows users to crop an image using react-easy-crop
 * 
 * @param imageSrc - The source URL of the image to be cropped
 * @param onCropComplete - Callback function that receives the cropped image blob
 * @param aspectRatio - Optional aspect ratio for the crop (defaults to 1:1)
 */
const ImageCropper = ({ imageSrc, onCropComplete, aspectRatio = 1 }: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = useCallback((newCrop: { x: number; y: number }) => {
    setCrop(newCrop);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropAreaChange = useCallback(
    (croppedArea: unknown, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCropComplete = useCallback(async () => {
    if (!croppedAreaPixels) return;
    
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  }, [croppedAreaPixels, imageSrc, onCropComplete]);

  return (
    <div className="relative h-80 w-full">
      <div className="relative h-full w-full" aria-label="Image Cropper Area">
    <div className="space-y-4">
      <div className="relative h-64 w-full rounded-lg overflow-hidden bg-gray-800" aria-label="Image Cropper Area">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaChange}
          cropShape="round"
          showGrid={false}
        />
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="zoom-slider" className="text-sm text-gray-600">Zoom</label>
          <input
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="zoom-slider" className="text-sm text-gray-400">Zoom</label>
          <span className="text-sm text-gray-400">{zoom.toFixed(1)}x</span>
        </div>
        <input
            id="zoom-slider"
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full mx-2"
          className="w-full accent-primary"
            aria-label="Zoom Level"
            aria-valuemin={1}
            aria-valuemax={3}
            aria-valuenow={zoom}
          />
        </div>
        <button
          type="button"
        <Button
          type="button"
          onClick={handleCropComplete}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          className="w-full"
          aria-label="Complete Crop"
        >
          Crop Image
        </button>
          Crop & Save
        </Button>
      </div>
    </div>
  );
};

export default ImageCropper;