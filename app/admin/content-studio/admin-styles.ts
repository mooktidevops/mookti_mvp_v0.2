// app/admin/content-studio/admin-styles.ts

import { metadata } from "@/app/layout";

// A soft rainbow palette of background colors.
// Adjust these Tailwind classes to achieve a soft, pastel rainbow effect.
export const rainbowColors = [
    'bg-red-100',
    'bg-orange-100',
    'bg-yellow-100',
    'bg-green-100',
    'bg-blue-100',
    'bg-purple-100',
  ];
  
  // Assign chunk types to specific classes or color schemes.
  // Adjust as necessary to match your types and design.
  export const chunkTypeStyles: Record<string, string> = {
    lesson: 'bg-blue-50 border-l-4 border-blue-400',
    metalesson: 'bg-yellow-100 border-l-4 border-yellow-400',
    assessment: 'bg-green-100 border-l-4 border-green-400',
    introduction: 'bg-purple-100 border-l-4 border-purple-400',
    conclusion: 'bg-purple-100 border-l-4 border-purple-400',
    example: 'bg-orange-100 border-l-4 border-orange-400',
    application: 'bg-orange-100 border-l-4 border-orange-400',
    image: 'bg-red-100 border-l-4 border-red-400',
    video: 'bg-red-100 border-l-4 border-red-400',
    // fallback
    default: 'bg-gray-50 border-l-4 border-gray-300',
  };