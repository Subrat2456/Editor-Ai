import React, { useState, useEffect } from 'react';
import type { Tool } from '../types';
import { XIcon } from './icons';

interface ToolPanelProps {
  activeTool: Tool | null;
  onApply: (prompt: string) => void;
  onPresetApply: (prompt: string) => void;
  onClose?: () => void;
}

const presetFilters = [
    { name: 'Vintage', prompt: 'Apply a warm, faded vintage film filter.' },
    { name: 'Noir', prompt: 'Convert the image to a high-contrast black and white noir style.' },
    { name: 'Cyberpunk', prompt: 'Give the image a futuristic cyberpunk look with neon blues and purples.' },
    { name: 'Cartoonify', prompt: 'Transform this photo into a vibrant cartoon style.' },
];

export const ToolPanel: React.FC<ToolPanelProps> = ({ activeTool, onApply, onPresetApply, onClose }) => {
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    setUserInput('');
  }, [activeTool]);

  if (!activeTool) {
    return null;
  }
  
  const handleApplyClick = () => {
    if (activeTool.needsUserInput) {
      // If prompt is empty, user input is the whole prompt. Otherwise, append.
      const finalPrompt = activeTool.prompt ? `${activeTool.prompt} ${userInput}` : userInput;
      onApply(finalPrompt);
    } else {
      onApply(activeTool.prompt);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-800 p-4 border-t border-gray-700 
                   md:relative md:w-80 md:border-l md:z-auto md:border-t-0 md:flex md:flex-col">
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-indigo-400 flex items-center gap-2">
            <activeTool.icon className="w-6 h-6" />
            {activeTool.name}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
              <XIcon className="w-6 h-6" />
          </button>
      </div>
      
      {/* Desktop Header */}
      <h2 className="hidden md:flex text-lg font-semibold mb-4 text-indigo-400 items-center gap-2">
        <activeTool.icon className="w-6 h-6" />
        {activeTool.name}
      </h2>

      <div className="flex-grow overflow-y-auto pr-2" style={{maxHeight: 'calc(40vh)'}}>
        {activeTool.id === 'ai-filters' ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-400 mb-2">Apply a one-click AI filter.</p>
            {presetFilters.map(filter => (
              <button
                key={filter.name}
                onClick={() => onPresetApply(filter.prompt)}
                className="w-full text-left px-3 py-2 text-sm bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
              >
                {filter.name}
              </button>
            ))}
          </div>
        ) : activeTool.needsUserInput ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              {activeTool.id === 'custom-prompt'
                ? 'Describe any edit you can imagine. The AI will do its best to interpret your request.'
                : activeTool.id === 'resize' 
                ? 'Describe the new dimensions. For example, "1024x1024" or "twice as wide".' 
                : 'Describe the change you want to make. For example, "the red car" or "a hat on the main person".'
              }
            </p>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={
                activeTool.id === 'custom-prompt'
                ? "e.g., 'make the sky a dramatic sunset'"
                : activeTool.id === 'resize' ? "e.g., '1080p'" : "e.g., 'the bird in the sky'"
              }
              className="w-full h-24 p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-400">Click "Apply" to perform this action.</p>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <button
          onClick={handleApplyClick}
          disabled={activeTool.needsUserInput && !userInput}
          className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>
    </div>
  );
};