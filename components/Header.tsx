
import React from 'react';
import { UploadIcon, DownloadIcon, UndoIcon, RedoIcon } from './icons';

interface HeaderProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownload: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasImage: boolean;
}

const HeaderButton: React.FC<{
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}> = ({ onClick, disabled, children, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);

export const Header: React.FC<HeaderProps> = ({
  onUpload,
  onDownload,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  hasImage,
}) => {
  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="bg-gray-800 p-2 sm:p-3 shadow-md z-20 flex justify-between items-center border-b border-gray-700">
      <div className="flex items-center gap-2">
        <h1 className="text-lg sm:text-xl font-bold text-indigo-400 mr-2 sm:mr-4">Nano Banana</h1>
        <input
          type="file"
          ref={uploadInputRef}
          onChange={onUpload}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        <HeaderButton onClick={() => uploadInputRef.current?.click()} title="Upload Image">
          <UploadIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Upload</span>
        </HeaderButton>
        <HeaderButton onClick={onDownload} disabled={!hasImage} title="Download Image">
          <DownloadIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Download</span>
        </HeaderButton>
      </div>
      <div className="flex items-center gap-2">
        <HeaderButton onClick={onUndo} disabled={!canUndo} title="Undo">
          <UndoIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Undo</span>
        </HeaderButton>
        <HeaderButton onClick={onRedo} disabled={!canRedo} title="Redo">
          <RedoIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Redo</span>
        </HeaderButton>
      </div>
    </header>
  );
};
