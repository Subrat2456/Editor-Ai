import React, { useMemo } from 'react';
import type { Tool } from '../types';
import { ToolCategory } from '../types';
import {
  MagicWandIcon, EraseIcon, ColorSwatchIcon, FaceSmileIcon, TextIcon, CropIcon, SparklesIcon, RotateIcon, ResizeIcon, DrawToolIcon, CollageIcon,
  ReplaceBgIcon, MakeupIcon, FaceSwapIcon, UpscalerIcon, CartoonifyIcon, ManualAdjustIcon, SharpenIcon, LensCorrectionIcon, HdrIcon, BlurIcon, VignetteIcon, NoiseReductionIcon, RedEyeIcon, StyleTransferIcon, AddFrameIcon, AddStickerIcon, WatermarkIcon,
  CustomPromptIcon
} from './icons';

const ALL_TOOLS: Tool[] = [
  // AI Powered
  { id: 'remove-bg', name: 'Remove BG', icon: MagicWandIcon, category: ToolCategory.AI_POWERED, prompt: 'Remove the background, making it transparent.' },
  { id: 'replace-bg', name: 'Replace BG', icon: ReplaceBgIcon, category: ToolCategory.AI_POWERED, prompt: 'Replace the background of the image with:', needsUserInput: true },
  { id: 'erase-object', name: 'Erase', icon: EraseIcon, category: ToolCategory.AI_POWERED, prompt: 'Realistically erase the following object:', needsUserInput: true },
  { id: 'retouch', name: 'Retouch', icon: FaceSmileIcon, category: ToolCategory.AI_POWERED, prompt: 'Perform professional skin retouching. Remove blemishes, smooth skin texture naturally, whiten teeth and eyes, and subtly enhance facial features.' },
  { id: 'makeup', name: 'Makeup', icon: MakeupIcon, category: ToolCategory.AI_POWERED, prompt: 'Apply the following makeup style:', needsUserInput: true },
  { id: 'face-swap', name: 'Face Swap', icon: FaceSwapIcon, category: ToolCategory.AI_POWERED, prompt: 'Swap the main face with a face described as:', needsUserInput: true },
  { id: 'upscaler', name: 'Upscaler', icon: UpscalerIcon, category: ToolCategory.AI_POWERED, prompt: 'Upscale the image, enhancing its resolution and clarity while preserving details.'},
  { id: 'custom-prompt', name: 'Custom Prompt', icon: CustomPromptIcon, category: ToolCategory.AI_POWERED, prompt: '', needsUserInput: true },
  
  // Adjustments
  { id: 'color-correct', name: 'Auto Correct', icon: ColorSwatchIcon, category: ToolCategory.ADJUSTMENTS, prompt: 'Perform automatic color, brightness, and contrast correction to enhance the photo.' },
  { id: 'manual-adjust', name: 'Manual Adjust', icon: ManualAdjustIcon, category: ToolCategory.ADJUSTMENTS, prompt: 'Apply the following manual photo adjustments:', needsUserInput: true },
  { id: 'rotate', name: 'Rotate 90°', icon: RotateIcon, category: ToolCategory.ADJUSTMENTS, prompt: 'Rotate the image 90 degrees clockwise.' },
  { id: 'crop', name: 'Auto Crop', icon: CropIcon, category: ToolCategory.ADJUSTMENTS, prompt: 'Crop the image to focus on the main subject. Automatically determine the best composition.' },
  { id: 'resize', name: 'Resize', icon: ResizeIcon, category: ToolCategory.ADJUSTMENTS, prompt: 'Resize the image to the following dimensions:', needsUserInput: true },
  { id: 'sharpen', name: 'Sharpen', icon: SharpenIcon, category: ToolCategory.ADJUSTMENTS, prompt: 'Apply a sharpening filter to the image to enhance details.'},
  { id: 'lens-correction', name: 'Lens Correct', icon: LensCorrectionIcon, category: ToolCategory.ADJUSTMENTS, prompt: 'Correct any lens distortion in the image.'},

  // Effects & Filters
  { id: 'hdr', name: 'HDR', icon: HdrIcon, category: ToolCategory.EFFECTS, prompt: 'Apply a High Dynamic Range (HDR) effect, balancing light and dark areas to reveal more detail.'},
  { id: 'blur', name: 'Blur', icon: BlurIcon, category: ToolCategory.EFFECTS, prompt: 'Apply the following blur effect:', needsUserInput: true},
  { id: 'vignette', name: 'Vignette', icon: VignetteIcon, category: ToolCategory.EFFECTS, prompt: 'Add a subtle vignette effect to the image.'},
  { id: 'noise-reduction', name: 'Noise Reduce', icon: NoiseReductionIcon, category: ToolCategory.EFFECTS, prompt: 'Apply noise reduction to clean up grain, especially from low-light photos.'},
  { id: 'red-eye', name: 'Red-Eye', icon: RedEyeIcon, category: ToolCategory.EFFECTS, prompt: 'Remove red-eye from the photo.'},
  { id: 'ai-effects', name: 'AI Effects', icon: SparklesIcon, category: ToolCategory.EFFECTS, prompt: 'Add the following creative effect:', needsUserInput: true },
  
  // Creative
  { id: 'collage', name: 'Collage', icon: CollageIcon, category: ToolCategory.CREATIVE, prompt: '', isClientSide: true },
  { id: 'style-transfer', name: 'Style Transfer', icon: StyleTransferIcon, category: ToolCategory.CREATIVE, prompt: 'Recreate this image in the style of:', needsUserInput: true },
  { id: 'cartoonify', name: 'Cartoonify', icon: CartoonifyIcon, category: ToolCategory.CREATIVE, prompt: 'Transform this photo into a vibrant cartoon or anime style.'},
  { id: 'add-text', name: 'Add Text', icon: TextIcon, category: ToolCategory.CREATIVE, prompt: 'Add the following text to the image, choosing a suitable style and placement:', needsUserInput: true },
  { id: 'add-frame', name: 'Add Frame', icon: AddFrameIcon, category: ToolCategory.CREATIVE, prompt: 'Add a frame to the image with the following description:', needsUserInput: true},
  { id: 'add-sticker', name: 'Add Sticker', icon: AddStickerIcon, category: ToolCategory.CREATIVE, prompt: 'Add a sticker to the image based on this description:', needsUserInput: true},
  { id: 'watermark', name: 'Watermark', icon: WatermarkIcon, category: ToolCategory.CREATIVE, prompt: 'Add or remove a watermark based on the following instructions:', needsUserInput: true},
  { id: 'draw', name: 'Draw', icon: DrawToolIcon, category: ToolCategory.CREATIVE, prompt: 'Draw the following on the image in a visually appealing way:', needsUserInput: true },
];


interface SidebarProps {
  activeToolId: string | null;
  onSelectTool: (tool: Tool) => void;
  hasImage: boolean;
}

const ToolButton: React.FC<{
  tool: Tool;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}> = ({ tool, isActive, onClick, disabled }) => (
    <button
      onClick={onClick}
      title={tool.name}
      disabled={disabled}
      className={`flex flex-col items-center justify-center p-2 rounded-lg w-20 md:w-full transition-colors flex-shrink-0 ${
        isActive ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-300'
      } ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <tool.icon className="w-7 h-7 mb-1" />
      <span className="text-xs text-center">{tool.name}</span>
    </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeToolId, onSelectTool, hasImage }) => {
    const toolsByCategory = useMemo(() => {
        return ALL_TOOLS.reduce((acc, tool) => {
            if (!acc[tool.category]) {
                acc[tool.category] = [];
            }
            acc[tool.category].push(tool);
            return acc;
        }, {} as Record<ToolCategory, Tool[]>);
    }, []);

    const categoryOrder: ToolCategory[] = [
        ToolCategory.AI_POWERED,
        ToolCategory.ADJUSTMENTS,
        ToolCategory.EFFECTS,
        ToolCategory.CREATIVE,
    ];

    return (
        <nav className="w-full bg-gray-800 border-t border-gray-700 md:w-28 md:border-t-0 md:border-r md:h-full">
            {/* Mobile View: Horizontal Scroll */}
            <div className="flex p-1 gap-1 overflow-x-auto md:hidden">
                {ALL_TOOLS.map(tool => (
                    <ToolButton 
                        key={tool.id}
                        tool={tool}
                        isActive={activeToolId === tool.id}
                        onClick={() => onSelectTool(tool)}
                        disabled={!tool.isClientSide && !hasImage}
                    />
                ))}
            </div>

            {/* Desktop View: Categories */}
            <div className="hidden md:flex flex-col gap-4 p-2">
                {categoryOrder.map(category => {
                    const tools = toolsByCategory[category];
                    if (!tools) return null;
                    return (
                        <div key={category}>
                            <h3 className="text-xs font-bold uppercase text-gray-500 mb-2 px-2">{category}</h3>
                            <div className="space-y-2">
                                {tools.map(tool => (
                                    <ToolButton 
                                        key={tool.id}
                                        tool={tool}
                                        isActive={activeToolId === tool.id}
                                        onClick={() => onSelectTool(tool)}
                                        disabled={!tool.isClientSide && !hasImage}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </nav>
    );
};