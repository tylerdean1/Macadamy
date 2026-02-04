import { Area } from '../lib/types';

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
    image.crossOrigin = 'anonymous'; // important for blob conversion
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(new Error(err instanceof Error ? err.message : 'Image failed to load'));
    image.src = url;
  });