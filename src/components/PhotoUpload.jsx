import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const PhotoUpload = ({ photos, setPhotos, error }) => {
  const [previews, setPreviews] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 3 photos
    if (photos.length + files.length > 3) {
      return;
    }

    // Validate and create previews
    const validFiles = [];
    const newPreviews = [];

    files.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        return;
      }

      validFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === validFiles.length) {
          setPreviews([...previews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setPhotos([...photos, ...validFiles]);
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPreviews(newPreviews);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-200">
        Upload Photos (Optional, 1-3 photos)
      </Label>
      
      <div className="grid grid-cols-3 gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative group aspect-square">
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover rounded-lg border-2 border-gray-700"
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {photos.length < 3 && (
          <label
            htmlFor="photo-upload"
            className="aspect-square border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-gray-900/50 transition-all duration-200"
          >
            <Upload className="w-8 h-8 text-gray-500 mb-2" />
            <span className="text-xs text-gray-500">Add Photo</span>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <p className="text-xs text-gray-500">
        Max 3 photos, 5MB each. Accepted formats: JPG, PNG, WebP
      </p>
    </div>
  );
};

export default PhotoUpload;