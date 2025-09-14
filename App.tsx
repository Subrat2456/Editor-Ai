import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { ToolPanel } from './components/ToolPanel';
import { CollageMaker } from './components/CollageMaker';
import Spinner from './components/Spinner';
import { useImageHistory } from './hooks/useImageHistory';
import { editImageWithAI } from './services/geminiService';
import type { Tool, ImageState } from './types';

const App: React.FC = () => {
  const { currentImage, setImage, undo, redo, resetHistory, canUndo, canRedo } = useImageHistory(null);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const dataUrl = loadEvent.target?.result as string;
        const img = new Image();
        img.onload = () => {
            const initialState: ImageState = {
                dataUrl,
                mimeType: file.type,
                width: img.width,
                height: img.height,
            };
            resetHistory(initialState);
            setActiveTool(null);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  }, [resetHistory]);
  
  const handleCollageCreated = (imageState: ImageState) => {
    resetHistory(imageState);
    setActiveTool(null); // Exit collage mode
  };

  const handleDownload = useCallback(() => {
    if (currentImage) {
      const link = document.createElement('a');
      link.href = currentImage.dataUrl;
      link.download = `edited-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [currentImage]);

  const handleApplyAI = useCallback(async (prompt: string) => {
    if (!currentImage) return;

    setIsLoading(true);
    setError(null);
    // On mobile, hide the tool panel after applying
    if (window.innerWidth < 768) {
        setActiveTool(null);
    }

    try {
      const base64Data = currentImage.dataUrl.split(',')[1];
      const result = await editImageWithAI(base64Data, currentImage.mimeType, prompt);
      
      if (result) {
         const img = new Image();
         img.onload = () => {
            const newState: ImageState = {
                ...result,
                width: img.width,
                height: img.height,
            };
            setImage(newState);
         };
         img.src = result.dataUrl;
      } else {
        throw new Error("The AI did not return an image. It might not have understood the request.");
      }
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [currentImage, setImage]);
  
  const handleSelectTool = (tool: Tool) => {
      // Allow selecting client-side tools even if no image is loaded
      if (!currentImage && !tool.isClientSide) return;
      setActiveTool(prevTool => prevTool?.id === tool.id ? null : tool);
  };
  
  const handleUploadClick = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = "image/png, image/jpeg, image/webp";
      input.onchange = (e) => handleImageUpload(e as unknown as React.ChangeEvent<HTMLInputElement>);
      input.click();
  }
  
  const isCollageMode = activeTool?.id === 'collage';

  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-gray-900">
      <Header
        onUpload={handleImageUpload}
        onDownload={handleDownload}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo && !isCollageMode}
        canRedo={canRedo && !isCollageMode}
        hasImage={!!currentImage && !isCollageMode}
      />
      {error && (
        <div className="bg-red-500 text-white p-3 text-center z-30 relative">
          <p>Error: {error} <button onClick={() => setError(null)} className="font-bold ml-4 underline">Dismiss</button></p>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for Desktop */}
        <div className="hidden md:flex">
            <Sidebar 
                activeToolId={activeTool?.id || null} 
                onSelectTool={handleSelectTool} 
                hasImage={!!currentImage}
            />
        </div>
        
        <div className="flex-1 flex flex-col relative">
            {isCollageMode ? (
                <CollageMaker onCollageCreated={handleCollageCreated} onCancel={() => setActiveTool(null)} />
            ) : (
                <div className="flex-1 flex relative">
                    <Canvas image={currentImage} onUploadClick={handleUploadClick} />
                    {isLoading && <Spinner />}
                </div>
            )}
        </div>
        
        {/* ToolPanel (one component, internally responsive) */}
        {currentImage && activeTool && !isCollageMode && (
            <ToolPanel 
                activeTool={activeTool} 
                onApply={handleApplyAI} 
                onPresetApply={handleApplyAI} 
                onClose={() => setActiveTool(null)}
            />
        )}
      </div>
      
      {/* Sidebar for Mobile (Bottom Nav) */}
      <div className="flex md:hidden">
          <Sidebar 
              activeToolId={activeTool?.id || null} 
              onSelectTool={handleSelectTool}
              hasImage={!!currentImage}
          />
      </div>
    </div>
  );
};

export default App;
