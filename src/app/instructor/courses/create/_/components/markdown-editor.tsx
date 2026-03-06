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
  CheckCircle2,
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
    <div className={`border border-border rounded-xl overflow-hidden bg-card ${className}`}>
      {/* Toolbar */}
      <div className="bg-muted/30 px-3 py-2 border-b border-border">
        <div className="flex flex-wrap items-center justify-between gap-y-2">
          <div className="flex items-center flex-wrap gap-1">
            {toolbarGroups.map((group, groupIndex) => (
              <React.Fragment key={group.name}>
                {groupIndex > 0 && <div className="w-px h-4 bg-border mx-1" />}
                <div className="flex items-center gap-0.5">
                  {group.buttons.map((button, index) => {
                    const Icon = button.icon;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={button.action}
                        disabled={button?.disabled || isPreview}
                        className={`p-1.5 rounded-md transition-all ${
                          button.disabled
                            ? 'text-muted-foreground/30 cursor-not-allowed'
                            : 'text-muted-foreground hover:bg-background hover:text-foreground'
                        }`}
                        title={button.tooltip}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Stats - Hidden on mobile */}
            {showWordCount && (
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 hidden sm:flex gap-3">
                <span>{wordCount} words</span>
                <span>
                  {characterCount}/{maxLength}
                </span>
              </div>
            )}

            {/* Preview Toggle */}
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all text-xs font-semibold ${
                isPreview
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background border border-border text-muted-foreground hover:text-foreground shadow-sm'
              }`}
            >
              {isPreview ? (
                <>
                  <Edit3 className="w-3 h-3" />
                  <span>Editor</span>
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Editor/Preview */}
      <div style={{ height }} className="relative bg-background">
        <AnimatePresence mode="wait" initial={false}>
          {isPreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full overflow-y-auto p-6 custom-scrollbar"
            >
              {value.trim() ? (
                <div
                  className="prose dark:prose-invert max-w-none prose-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm italic">
                  Nothing to preview yet...
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
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
                className="w-full h-full px-6 py-4 border-0 focus:ring-0 bg-transparent text-foreground resize-none font-mono text-xs leading-relaxed placeholder-muted-foreground/40 custom-scrollbar"
                style={{ minHeight: height }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="bg-muted/10 px-4 py-1.5 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground/60">
          <span className="flex items-center gap-1">
            <Code className="w-3 h-3" />
            Markdown
          </span>
          <span className="hidden sm:inline opacity-30">•</span>
          <span className="hidden sm:inline">Ctrl+B (Bold)</span>
          <span className="hidden sm:inline opacity-30">•</span>
          <span className="hidden sm:inline">Ctrl+K (Link)</span>
        </div>

        <div className="flex items-center gap-3">
          {autoSave && lastSaved && (
            <div className="text-[10px] font-semibold text-green-600/70 flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Auto-saved
            </div>
          )}
          <span
            className={`text-[10px] font-bold ${characterCount > maxLength * 0.9 ? 'text-destructive' : 'text-muted-foreground/40'}`}
          >
            {characterCount} chars
          </span>
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
