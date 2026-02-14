'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Code,
  Quote,
  Eye,
  Edit3,
  Heading,
  Image,
  Strikethrough,
  Undo,
  Redo,
  Save,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/use-debounce';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  height?: number;
  maxLength?: number;
  showWordCount?: boolean;
  autoSave?: boolean;
  onSave?: () => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter your course description...',
  error,
  className = '',
  height = 300,
  maxLength = 5000,
  showWordCount = true,
  autoSave = false,
  onSave,
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [debouncedValue] = useDebounce(value, 2000);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && onSave) {
      const timer = setTimeout(() => {
        onSave();
        setLastSaved(new Date());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [debouncedValue, autoSave, onSave]);

  // History management
  const addToHistory = useCallback(
    (newValue: string) => {
      if (newValue !== history[historyIndex]) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newValue);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    },
    [history, historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  }, [history, historyIndex, onChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  }, [history, historyIndex, onChange]);

  const insertMarkdown = useCallback(
    (before: string, after: string = '', placeholder?: string) => {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const textToInsert = selectedText || placeholder || '';
      const newText =
        value.substring(0, start) + before + textToInsert + after + value.substring(end);

      addToHistory(value);
      onChange(newText);

      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + before.length + textToInsert.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [value, onChange, addToHistory]
  );

  // Paste handler to insert pasted content as markdown
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (!textareaRef.current) return;
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text');
      // You can process pastedText here if you want to auto-format as markdown
      // For now, just insert as plain text at the cursor
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = value.substring(0, start) + pastedText + value.substring(end);
      addToHistory(value);
      onChange(newText);
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + pastedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [value, onChange, addToHistory]
  );

  const toolbarGroups: {
    name: string;
    buttons: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      icon: React.ForwardRefExoticComponent<any>;
      action: () => void;
      tooltip: string;
      disabled?: boolean;
    }[];
  }[] = [
    {
      name: 'history',
      buttons: [
        { icon: Undo, action: undo, tooltip: 'Undo (Ctrl+Z)', disabled: historyIndex <= 0 },
        {
          icon: Redo,
          action: redo,
          tooltip: 'Redo (Ctrl+Y)',
          disabled: historyIndex >= history.length - 1,
        },
      ],
    },
    {
      name: 'formatting',
      buttons: [
        {
          icon: Bold,
          action: () => insertMarkdown('**', '**', 'bold text'),
          tooltip: 'Bold (Ctrl+B)',
        },
        {
          icon: Italic,
          action: () => insertMarkdown('*', '*', 'italic text'),
          tooltip: 'Italic (Ctrl+I)',
        },
        {
          icon: Strikethrough,
          action: () => insertMarkdown('~~', '~~', 'strikethrough'),
          tooltip: 'Strikethrough',
        },
        {
          icon: Underline,
          action: () => insertMarkdown('<u>', '</u>', 'underlined'),
          tooltip: 'Underline',
        },
      ],
    },
    {
      name: 'structure',
      buttons: [
        { icon: Heading, action: () => insertMarkdown('## ', '', 'Heading'), tooltip: 'Heading 2' },
        { icon: Quote, action: () => insertMarkdown('> ', '', 'Quote'), tooltip: 'Quote' },
        { icon: Code, action: () => insertMarkdown('`', '`', 'code'), tooltip: 'Inline Code' },
      ],
    },
    {
      name: 'lists',
      buttons: [
        { icon: List, action: () => insertMarkdown('- ', '', 'List item'), tooltip: 'Bullet List' },
        {
          icon: ListOrdered,
          action: () => insertMarkdown('1. ', '', 'List item'),
          tooltip: 'Numbered List',
        },
      ],
    },
    {
      name: 'media',
      buttons: [
        {
          icon: Link,
          action: () => insertMarkdown('[', '](https://)', 'link text'),
          tooltip: 'Link (Ctrl+K)',
        },
        {
          icon: Image,
          action: () => insertMarkdown('![', '](https://)', 'alt text'),
          tooltip: 'Image',
        },
      ],
    },
  ];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            insertMarkdown('**', '**', 'bold text');
            break;
          case 'i':
            e.preventDefault();
            insertMarkdown('*', '*', 'italic text');
            break;
          case 'k':
            e.preventDefault();
            insertMarkdown('[', '](https://)', 'link text');
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 's':
            e.preventDefault();
            if (onSave) {
              onSave();
              setLastSaved(new Date());
            }
            break;
        }
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        insertMarkdown('  ');
      }
    },
    [insertMarkdown, undo, redo, onSave]
  );

  const renderMarkdown = useCallback((text: string) => {
    return text
      .replace(
        /^### (.*$)/gm,
        '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-white">$1</h3>'
      )
      .replace(
        /^## (.*$)/gm,
        '<h2 class="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">$1</h2>'
      )
      .replace(
        /^# (.*$)/gm,
        '<h1 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">$1</h1>'
      )
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>'
      )
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/~~(.*?)~~/g, '<del class="line-through text-gray-600 dark:text-gray-400">$1</del>')
      .replace(/<u>(.*?)<\/u>/g, '<u class="underline">$1</u>')
      .replace(
        /`(.*?)`/g,
        '<code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono text-gray-900 dark:text-gray-100">$1</code>'
      )
      .replace(
        /^> (.*$)/gm,
        '<blockquote class="border-l-4 border-primary/90 pl-4 italic text-gray-600 dark:text-gray-400 my-2 bg-orange-50 dark:bg-orange-900/20 py-2 rounded-r">$1</blockquote>'
      )
      .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc text-gray-700 dark:text-gray-300">$1</li>')
      .replace(
        /^\d+\. (.*$)/gm,
        '<li class="ml-4 list-decimal text-gray-700 dark:text-gray-300">$1</li>'
      )
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-primary/90 hover:text-primary underline" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      .replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-2 shadow-sm" />'
      )
      .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 dark:text-gray-300">')
      .replace(/\n/g, '<br>')
      .replace(/^(?!<[h|u|b|l|i])/gm, '<p class="mb-4 text-gray-700 dark:text-gray-300">');
  }, []);

  const wordCount = value
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const characterCount = value.length;

  return (
    <div
      className={`border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-800 ${className}`}
    >
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-300 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {toolbarGroups.map((group, groupIndex) => (
              <React.Fragment key={group.name}>
                {groupIndex > 0 && <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />}
                <div className="flex items-center space-x-1">
                  {group.buttons.map((button, index) => {
                    const Icon = button.icon;
                    return (
                      <motion.button
                        key={index}
                        type="button"
                        onClick={button.action}
                        disabled={button?.disabled || isPreview}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 rounded transition-colors group ${
                          button.disabled
                            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                        title={button.tooltip}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.button>
                    );
                  })}
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Auto-save indicator */}
            {autoSave && lastSaved && (
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                <Save className="w-3 h-3 mr-1" />
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}

            {/* Stats */}
            {showWordCount && (
              <div className="text-xs text-gray-500 dark:text-gray-400 space-x-3 hidden sm:flex">
                <span>{wordCount} words</span>
                <span>
                  {characterCount}/{maxLength} characters
                </span>
              </div>
            )}

            {/* Preview Toggle */}
            <motion.button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors text-sm font-medium ${
                isPreview
                  ? 'bg-primary/10 text-primary dark:bg-orange-900/20 dark:text-primary/70'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {isPreview ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Editor/Preview */}
      <div style={{ height }} className="relative">
        <AnimatePresence mode="wait">
          {isPreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto p-6 custom-scrollbar"
            >
              {value.trim() ? (
                <div
                  className="prose dark:prose-invert max-w-none prose-primary leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 italic">
                  Nothing to preview yet. Start typing in the editor!
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                  if (e.target.value.length <= maxLength) {
                    onChange(e.target.value);
                  }
                }}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onBlur={() => addToHistory(value)}
                placeholder={placeholder}
                className="w-full h-full px-6 py-4 border-0 focus:ring-0 dark:bg-gray-800 dark:text-white resize-none font-mono text-sm leading-relaxed placeholder-gray-400 dark:placeholder-gray-500 custom-scrollbar"
                style={{ minHeight: height }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-t border-gray-300 dark:border-gray-600 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
          <span>Markdown supported</span>
          <span>•</span>
          <span>Ctrl+B for bold, Ctrl+I for italic, Ctrl+S to save</span>
        </div>

        <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
          {showWordCount && (
            <>
              <span className="sm:hidden">{wordCount}w</span>
              <span className="hidden sm:inline">{wordCount} words</span>
              <span>•</span>
            </>
          )}
          <span
            className={characterCount > maxLength * 0.9 ? 'text-amber-600 dark:text-amber-400' : ''}
          >
            {characterCount}/{maxLength}
          </span>
          <span>•</span>
          <span>{isPreview ? 'Preview mode' : 'Edit mode'}</span>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800"
          >
            <p className="text-red-600 dark:text-red-400 text-sm flex items-center">
              <X className="w-4 h-4 mr-2" />
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarkdownEditor;
