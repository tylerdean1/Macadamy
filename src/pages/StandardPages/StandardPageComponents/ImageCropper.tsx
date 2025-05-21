import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/utils/cropImage';
import { Area } from '@/lib/types';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';

interface ImageCropperProps {
  imageSrc: string; // Source URL of the image to be cropped
  onCropComplete: (croppedImage: Blob) => void; // Callback for when cropping is complete
  aspectRatio?: number; // Optional aspect ratio for cropping (default is 1:1)
}

/**
 * ImageCropper component allows users to crop an image using react-easy-crop
 * 
 * @param imageSrc - Source URL of the image to be cropped
 * @param onCropComplete - Callback executed when cropping is finished
 * @param aspectRatio - Aspect ratio for the crop (default is 1:1)
 */
const ImageCropper = ({ imageSrc, onCropComplete, aspectRatio = 1 }: ImageCropperProps) => {
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
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels); // Get cropped image blob
      onCropComplete(croppedImage); // Call the callback with cropped image
    } catch (e) {
      console.error('Error cropping image:', e); // Handle any errors
    }
  }, [croppedAreaPixels, imageSrc, onCropComplete]);

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
            cropShape="round" // Crop shape (round or rectangular)
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
            onChange={() => { void handleCropComplete(); }}
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
