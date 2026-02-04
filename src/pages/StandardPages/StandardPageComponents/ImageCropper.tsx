import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from '@/lib/types';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';

interface ImageCropperProps {
  imageSrc: string; // Source URL of the image to be cropped
  onCropComplete: (croppedImage: Blob) => void; // Callback for when cropping is complete
  aspectRatio?: number; // Optional aspect ratio for cropping (default is 1:1)
  cropShape?: 'round' | 'rect';
  compressionOptions?: {
    mimeType?: string;
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
  };
}

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  options?: {
    mimeType?: string;
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
  }
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('No canvas context');

  const maxWidth = options?.maxWidth ?? pixelCrop.width;
  const maxHeight = options?.maxHeight ?? pixelCrop.height;
  const scale = Math.min(maxWidth / pixelCrop.width, maxHeight / pixelCrop.height, 1);
  const targetWidth = Math.max(1, Math.round(pixelCrop.width * scale));
  const targetHeight = Math.max(1, Math.round(pixelCrop.height * scale));

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas is empty'));
      },
      options?.mimeType ?? 'image/png',
      options?.quality
    );
  });
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(new Error(err instanceof Error ? err.message : 'Image failed to load'));
    image.src = url;
  });

/**
 * ImageCropper component allows users to crop an image using react-easy-crop
 * 
 * @param imageSrc - Source URL of the image to be cropped
 * @param onCropComplete - Callback executed when cropping is finished
 * @param aspectRatio - Aspect ratio for the crop (default is 1:1)
 */
const ImageCropper = ({
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
  cropShape = 'round',
  compressionOptions,
}: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 }); // Crop coordinates
  const [zoom, setZoom] = useState(1); // Zoom level for cropping
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null); // Pixels area for cropping

  const onCropChange = useCallback((newCrop: { x: number; y: number }) => {
    setCrop(newCrop); // Update crop coordinates
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom); // Update zoom level
  }, []);

  const onCropAreaChange = useCallback(
    (_: unknown, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels); // Store the cropped area size
    },
    []
  );

  // Handle the crop completion and pass the resulting image back
  const handleCropComplete = useCallback(async () => {
    if (!croppedAreaPixels) return; // Ensure the cropped area is set

    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, {
        mimeType: compressionOptions?.mimeType ?? 'image/jpeg',
        quality: compressionOptions?.quality ?? 0.8,
        maxWidth: compressionOptions?.maxWidth ?? 512,
        maxHeight: compressionOptions?.maxHeight ?? 512,
      }); // Get cropped image blob
      onCropComplete(croppedImage); // Call the callback with cropped image
    } catch (e) {
      console.error('Error cropping image:', e); // Handle any errors
    }
  }, [compressionOptions?.maxHeight, compressionOptions?.maxWidth, compressionOptions?.mimeType, compressionOptions?.quality, croppedAreaPixels, imageSrc, onCropComplete]);

  return (
    <div className="relative h-80 w-full"> {/* Container for the cropper */}
      {/* Removed duplicate aria-label from this outer div */}
      <div className="relative h-full w-full">
        <div className="relative h-64 w-full rounded-lg overflow-hidden bg-gray-800" aria-label="Image Cropper Area">
          <Cropper
            image={imageSrc} // Source image for cropping
            crop={crop} // Current crop state
            zoom={zoom} // Current zoom level
            aspect={aspectRatio} // Aspect ratio for cropping
            onCropChange={onCropChange} // Update crop coordinates
            onZoomChange={onZoomChange} // Update zoom level
            onCropComplete={onCropAreaChange} // Handle crop area change
            cropShape={cropShape} // Crop shape (round or rectangular)
            showGrid={false} // Option to show grid overlay
          />
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="zoom-slider" className="text-sm text-gray-600">Zoom</label>
          <input
            id="zoom-slider"
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full accent-primary"
            aria-label="Zoom Level"
          />

        </div>
      </div>
      <Button
        type="button"
        onClick={() => { void handleCropComplete(); }} // Trigger the crop and upload
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        aria-label="Complete Crop"
      >
        Crop & Save
      </Button>
    </div>
  );
};

export default ImageCropper;
