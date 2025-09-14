import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ImageState } from '../types';
import { UploadIcon } from './icons';

interface CollageMakerProps {
  onCollageCreated: (imageState: ImageState) => void;
  onCancel: () => void;
}

const ASPECT_RATIOS: { [key: string]: number } = {
  '1:1': 1 / 1,
  '16:9': 16 / 9,
  '9:16': 9 / 16,
  '4:3': 4 / 3,
  '3:4': 3 / 4,
};

const LAYOUTS: { [key: string]: (count: number) => { x: number, y: number, w: number, h: number }[] } = {
  '2xN': (count) => {
    const rows = Math.ceil(count / 2);
    return Array.from({ length: count }).map((_, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      return { x: col * 0.5, y: row * (1 / rows), w: 0.5, h: 1 / rows };
    });
  },
  '1+2': (count) => {
    if (count < 1) return [];
    if (count === 1) return [{ x: 0, y: 0, w: 1, h: 1 }];
    if (count === 2) return [{ x: 0, y: 0, w: 1, h: 0.5 }, { x: 0, y: 0.5, w: 1, h: 0.5 }];
    return [
      { x: 0, y: 0, w: 1, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }
    ].slice(0, count);
  },
};

const OptionButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
      isActive ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
    }`}
  >
    {children}
  </button>
);

export const CollageMaker: React.FC<CollageMakerProps> = ({ onCollageCreated, onCancel }) => {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [layout, setLayout] = useState('2xN');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imagePromises = Array.from(files).map(file => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        });
      });
      Promise.all(imagePromises).then(loadedImages => {
        setImages(prev => [...prev, ...loadedImages]);
      });
    }
  };
  
  const drawCollage = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || images.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    let canvasWidth = containerWidth;
    let canvasHeight = canvasWidth / ASPECT_RATIOS[aspectRatio];

    if (canvasHeight > containerHeight) {
        canvasHeight = containerHeight;
        canvasWidth = canvasHeight * ASPECT_RATIOS[aspectRatio];
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rects = LAYOUTS[layout](images.length);

    images.forEach((img, i) => {
      if (!rects[i]) return;
      const rect = rects[i];
      const dWidth = rect.w * canvas.width;
      const dHeight = rect.h * canvas.height;
      const dX = rect.x * canvas.width;
      const dY = rect.y * canvas.height;
      
      const imgRatio = img.width / img.height;
      const rectRatio = dWidth / dHeight;

      let sWidth = img.width;
      let sHeight = img.height;
      let sX = 0;
      let sY = 0;

      if (imgRatio > rectRatio) { // image is wider than rect
        sWidth = img.height * rectRatio;
        sX = (img.width - sWidth) / 2;
      } else { // image is taller than rect
        sHeight = img.width / rectRatio;
        sY = (img.height - sHeight) / 2;
      }
      
      ctx.drawImage(img, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);
    });
  }, [images, aspectRatio, layout]);

  useEffect(() => {
      const handleResize = () => drawCollage();
      window.addEventListener('resize', handleResize);
      drawCollage();
      return () => window.removeEventListener('resize', handleResize);
  }, [drawCollage]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;
    
    // For saving, render at a higher resolution
    const saveCanvas = document.createElement('canvas');
    const saveCtx = saveCanvas.getContext('2d');
    const baseWidth = 1920;
    saveCanvas.width = baseWidth;
    saveCanvas.height = baseWidth / ASPECT_RATIOS[aspectRatio];
    
    // Redraw on the high-res canvas (logic copied from drawCollage)
    if (!saveCtx) return;
    saveCtx.fillStyle = '#111827';
    saveCtx.fillRect(0, 0, saveCanvas.width, saveCanvas.height);
    const rects = LAYOUTS[layout](images.length);
    images.forEach((img, i) => {
      if (!rects[i]) return;
      const rect = rects[i];
      const dWidth = rect.w * saveCanvas.width;
      const dHeight = rect.h * saveCanvas.height;
      const dX = rect.x * saveCanvas.width;
      const dY = rect.y * saveCanvas.height;
      const imgRatio = img.width / img.height;
      const rectRatio = dWidth / dHeight;
      let sWidth = img.width, sHeight = img.height, sX = 0, sY = 0;
      if (imgRatio > rectRatio) { sWidth = img.height * rectRatio; sX = (img.width - sWidth) / 2; } 
      else { sHeight = img.width / rectRatio; sY = (img.height - sHeight) / 2; }
      saveCtx.drawImage(img, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);
    });

    const dataUrl = saveCanvas.toDataURL('image/png');
    onCollageCreated({
      dataUrl,
      mimeType: 'image/png',
      width: saveCanvas.width,
      height: saveCanvas.height,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
      <div className="p-3 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-indigo-400">Collage Maker</h2>
            <div className="flex gap-2">
                <button onClick={onCancel} className="px-4 py-2 text-sm bg-gray-600 rounded-md hover:bg-gray-500">Cancel</button>
                <button onClick={handleSave} disabled={images.length === 0} className="px-4 py-2 text-sm bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed">Save Collage</button>
            </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3 items-center">
            <div>
                <span className="text-sm font-medium text-gray-400 mr-2">Aspect Ratio:</span>
                <div className="inline-flex gap-2">
                    {Object.keys(ASPECT_RATIOS).map(ar => <OptionButton key={ar} onClick={() => setAspectRatio(ar)} isActive={aspectRatio === ar}>{ar}</OptionButton>)}
                </div>
            </div>
            <div>
                <span className="text-sm font-medium text-gray-400 mr-2">Layout:</span>
                <div className="inline-flex gap-2">
                    {Object.keys(LAYOUTS).map(l => <OptionButton key={l} onClick={() => setLayout(l)} isActive={layout === l}>{l}</OptionButton>)}
                </div>
            </div>
        </div>
      </div>
      <div className="flex-1 flex p-4 gap-4 overflow-hidden">
        <div className="w-64 bg-gray-800 rounded-lg p-3 flex flex-col flex-shrink-0">
            <h3 className="text-md font-semibold mb-3">Images ({images.length})</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {images.map((img, index) => (
                    <img key={index} src={img.src} className="w-full h-auto object-cover rounded" />
                ))}
            </div>
            <div className="mt-3">
                <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-600 rounded-lg hover:border-indigo-500 hover:bg-gray-700 transition-colors">
                    <UploadIcon className="w-6 h-6" /> Add Images
                </button>
            </div>
        </div>
        <div ref={containerRef} className="flex-1 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
             {images.length > 0 ? (
                <canvas ref={canvasRef} className="max-w-full max-h-full block object-contain shadow-2xl" />
            ) : (
                <div className="text-center text-gray-500">
                    <p>Add some images to get started</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
