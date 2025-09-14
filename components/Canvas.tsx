
import React from 'react';
import type { ImageState } from '../types';
import { UploadIcon } from './icons';

interface CanvasProps {
  image: ImageState | null;
  onUploadClick: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({ image, onUploadClick }) => {
  return (
    <main className="flex-1 bg-gray-900 p-4 md:p-8 flex justify-center items-center overflow-auto relative">
      {image ? (
        <div className="relative shadow-2xl">
          <img
            src={image.dataUrl}
            alt="Editable"
            className="max-w-full max-h-full block object-contain"
          />
        </div>
      ) : (
        <div className="text-center">
            <button
                onClick={onUploadClick} 
                className="group flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-xl hover:border-indigo-500 hover:bg-gray-800 transition-colors"
            >
                <UploadIcon className="w-16 h-16 text-gray-500 group-hover:text-indigo-400 transition-colors mb-4" />
                <h2 className="text-2xl font-bold text-gray-300">Upload an Image</h2>
                <p className="text-gray-500 mt-2">Click here to start editing with AI</p>
            </button>
        </div>
      )}
    </main>
  );
};
