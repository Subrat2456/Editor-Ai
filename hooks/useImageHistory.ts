
import { useState, useCallback } from 'react';
import type { ImageState } from '../types';

export const useImageHistory = (initialState: ImageState | null) => {
  const [history, setHistory] = useState<ImageState[]>(initialState ? [initialState] : []);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const currentImage = history[currentIndex] || null;

  const setImage = useCallback((newImageState: ImageState) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newImageState);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  }, [currentIndex, history.length]);

  const resetHistory = useCallback((newInitialState: ImageState) => {
    setHistory([newInitialState]);
    setCurrentIndex(0);
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    currentImage,
    setImage,
    undo,
    redo,
    resetHistory,
    canUndo,
    canRedo,
  };
};
