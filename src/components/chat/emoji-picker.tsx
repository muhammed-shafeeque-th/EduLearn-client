'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = {
  Smileys: [
    '😀',
    '😃',
    '😄',
    '😁',
    '😆',
    '😅',
    '😂',
    '🤣',
    '😊',
    '😇',
    '🙂',
    '🙃',
    '😉',
    '😌',
    '😍',
    '🥰',
    '😘',
    '😗',
    '😙',
    '😚',
    '😋',
    '😛',
    '😝',
    '😜',
    '🤪',
    '🤨',
    '🧐',
    '🤓',
    '😎',
    '🤩',
    '🥳',
  ],
  Hearts: [
    '❤️',
    '🧡',
    '💛',
    '💚',
    '💙',
    '💜',
    '🖤',
    '🤍',
    '🤎',
    '💔',
    '❣️',
    '💕',
    '💞',
    '💓',
    '💗',
    '💖',
    '💘',
    '💝',
  ],
  Gestures: [
    '👍',
    '👎',
    '👌',
    '🤌',
    '🤏',
    '✌️',
    '🤞',
    '🤟',
    '🤘',
    '🤙',
    '👈',
    '👉',
    '👆',
    '🖕',
    '👇',
    '☝️',
    '👏',
    '🙌',
    '👐',
    '🤲',
    '🤝',
    '🙏',
  ],
  Objects: [
    '🎉',
    '🎊',
    '🎈',
    '🎁',
    '🏆',
    '🥇',
    '🎯',
    '⚡',
    '💥',
    '🔥',
    '✨',
    '⭐',
    '🌟',
    '💫',
    '💯',
    '✅',
    '❌',
    '❗',
    '❓',
    '💡',
  ],
};

export function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 w-64 max-h-64 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Emojis</h4>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
          <span className="text-gray-500">×</span>
        </Button>
      </div>

      {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
        <div key={category} className="mb-3">
          <h5 className="text-xs text-gray-500 dark:text-gray-400 mb-1">{category}</h5>
          <div className="grid grid-cols-8 gap-1">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onEmojiSelect(emoji)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
