import { useState } from 'react';
import ImageCropper from '../components/ImageCropper';

const ProfileImageUpload = () => {
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleCropComplete = (croppedBlob: Blob) => {
    const url = URL.createObjectURL(croppedBlob);
    setCroppedImage(url);
    // Here you could upload the cropped image to your server or Supabase storage
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Profile Image Upload</h1>
      
      <div className="mb-4">
        <label htmlFor="image-upload" className="block text-gray-700 mb-2">Select an image</label>
        <input 
          id="image-upload"
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="border p-2 w-full"
          aria-label="Select profile image"
          placeholder="Choose file"
        />
      </div>
      
      {image && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Crop your image</h2>
          <ImageCropper 
            imageSrc={image} 
            onCropComplete={handleCropComplete} 
            aspectRatio={1} // 1:1 aspect ratio for profile images
          />
        </div>
      )}
      
      {croppedImage && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Cropped Result</h2>
          <div className="w-32 h-32 rounded-full overflow-hidden">
            <img 
              src={croppedImage} 
              alt="Cropped profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;