export enum ToolCategory {
  AI_POWERED = 'AI Powered',
  ADJUSTMENTS = 'Adjustments',
  EFFECTS = 'Effects & Filters',
  CREATIVE = 'Creative',
}

export interface Tool {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category: ToolCategory;
  prompt: string;
  needsUserInput?: boolean;
  isClientSide?: boolean; // True for tools that run in the browser without AI, like Collage
}

export interface ImageState {
  dataUrl: string;
  mimeType: string;
  width: number;
  height: number;
}
