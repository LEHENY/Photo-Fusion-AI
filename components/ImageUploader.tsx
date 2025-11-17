
import React, { useState, useCallback, useRef } from 'react';
import type { ImageFile } from '../types';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  id: string;
  title: string;
  onImageUpload: (image: ImageFile | null) => void;
  imageFile: ImageFile | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, onImageUpload, imageFile }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
          alert("File size exceeds 4MB. Please choose a smaller file.");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload({ file, preview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
       if (file.size > 4 * 1024 * 1024) {
          alert("File size exceeds 4MB. Please choose a smaller file.");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload({ file, preview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onImageUpload(null);
      if(inputRef.current) {
          inputRef.current.value = "";
      }
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium text-gray-300 mb-2">{title}</h3>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative w-full aspect-square bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-indigo-500 hover:text-indigo-400 transition-all duration-300 cursor-pointer overflow-hidden group"
      >
        <input
          type="file"
          id={id}
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        {imageFile ? (
          <>
            <img src={imageFile.preview} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
              aria-label="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <div className="text-center">
            <UploadIcon className="mx-auto h-12 w-12" />
            <p className="mt-2 text-sm">Drag & drop or click to upload</p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 4MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
