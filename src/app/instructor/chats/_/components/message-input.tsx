'use client';

import React, { useState, useRef, useCallback, KeyboardEvent, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  X,
  Image as ImageIcon,
  File,
  Video,
  Camera,
  Pause,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  placeholder?: string;
  className?: string;
  replyingTo?: any;
  onCancelReply?: () => void;
  disabled?: boolean;
}

// Emoji categories
const EMOJI_CATEGORIES = {
  'Frequently Used': ['😊', '👍', '❤️', '😂', '🎉', '🙏', '👏', '🔥'],
  Smileys: [
    '😀',
    '😃',
    '😄',
    '😁',
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
  ],
  Gestures: [
    '👍',
    '👎',
    '👌',
    '✌️',
    '🤞',
    '🤟',
    '🤘',
    '🤙',
    '👈',
    '👉',
    '👆',
    '👇',
    '☝️',
    '👏',
    '🙌',
    '👐',
    '🤝',
    '🙏',
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
  Objects: [
    '🎉',
    '🎊',
    '🎈',
    '🎁',
    '🏆',
    '🥇',
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
  ],
};

export function MessageInput({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  placeholder = 'Type a message...',
  className,
  replyingTo,
  onCancelReply,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const handleTyping = useCallback(() => {
    onStartTyping();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping();
    }, 3000);
  }, [onStartTyping, onStopTyping]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
      handleTyping();

      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
        textareaRef.current.style.height = `${newHeight}px`;
      }
    },
    [handleTyping]
  );

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed && selectedFiles.length === 0) return;

    if (selectedFiles.length > 0) {
      toast.success(`Sending ${selectedFiles.length} file(s)...`);
      // TODO: Handle file upload
      setSelectedFiles([]);
    }

    if (trimmed) {
      onSendMessage(trimmed);
      setMessage('');
    }

    onStopTyping();

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Focus back on input
    textareaRef.current?.focus();
  }, [message, selectedFiles, onSendMessage, onStopTyping]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }

      // Ctrl/Cmd + B for bold (future feature)
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        // TODO: Add bold formatting
      }

      // Ctrl/Cmd + I for italic (future feature)
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        // TODO: Add italic formatting
      }
    },
    [handleSend]
  );

  const handleVoiceRecord = useCallback(async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          // TODO: Send audio blob
          toast.success('Voice message recorded');
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
      } catch (error) {
        console.error('Error starting recording:', error);
        toast.error('Failed to access microphone');
      }
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setIsPaused(false);
      }
    }
  }, [isRecording]);

  const handlePauseRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
      } else {
        mediaRecorderRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  }, [isPaused]);

  const handleCancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      audioChunksRef.current = [];
      toast.info('Recording cancelled');
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
      toast.success(`${files.length} file(s) selected`);
    }
    e.target.value = '';
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const insertEmoji = useCallback(
    (emoji: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.slice(0, start) + emoji + message.slice(end);

      setMessage(newMessage);

      // Set cursor position after emoji
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    },
    [message]
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('border-t border-border bg-card/95 backdrop-blur-md', className)}>
      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 pt-3 pb-2 border-b border-border/50">
          <div className="flex items-start gap-3 bg-muted/50 rounded-lg p-2">
            <div className="w-1 h-full bg-blue-500 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-0.5">
                Replying to {replyingTo.sender}
              </p>
              <p className="text-sm text-muted-foreground truncate">{replyingTo.content}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancelReply} className="h-6 w-6">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* File Preview */}
      {selectedFiles.length > 0 && (
        <div className="px-4 pt-3 pb-2 border-b border-border/50">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="relative flex items-center gap-2 bg-muted rounded-lg px-3 py-2 min-w-[200px]"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-5 h-5 text-blue-500" />
                ) : (
                  <File className="w-5 h-5 text-gray-500" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-3 space-y-3">
        {/* Recording UI */}
        {isRecording ? (
          <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
              <div className="flex-1 flex items-center gap-1 px-2">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-500 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 24 + 8}px`,
                      animationDelay: `${i * 50}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={handlePauseRecording}
                className="h-9 w-9"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCancelRecording}
                className="h-9 w-9 hover:bg-destructive/20"
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                onClick={handleVoiceRecord}
                className="h-9 w-9 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Main Input Area */}
            <div className="flex items-end gap-2">
              {/* Attachment Menu */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 flex-shrink-0 hover:bg-blue-500/10 hover:text-blue-600"
                    disabled={disabled}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-48 p-2">
                  <div className="grid gap-1">
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <ImageIcon className="w-4 h-4 mr-2 text-blue-500" />
                      Photos
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <File className="w-4 h-4 mr-2 text-gray-500" />
                      Documents
                    </Button>
                    <Button variant="ghost" className="justify-start">
                      <Camera className="w-4 h-4 mr-2 text-green-500" />
                      Camera
                    </Button>
                    <Button variant="ghost" className="justify-start">
                      <Video className="w-4 h-4 mr-2 text-red-500" />
                      Video
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Hidden File Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                multiple
                accept="*/*"
              />
              <input
                ref={imageInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                multiple
                accept="image/*"
              />

              {/* Text Input Container */}
              <div className="flex-1 relative bg-muted/50 rounded-2xl border border-border focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  disabled={disabled}
                  rows={1}
                  className="min-h-[44px] max-h-[150px] resize-none border-0 bg-transparent pr-12 py-3 focus-visible:ring-0 focus-visible:ring-offset-0"
                />

                {/* Emoji Picker Button */}
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 bottom-2 h-8 w-8 hover:bg-accent"
                      disabled={disabled}
                    >
                      <Smile className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="end" className="w-[320px] p-0">
                    <div className="p-3 border-b">
                      <h4 className="font-semibold text-sm">Emoji</h4>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-3 space-y-3">
                      {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
                        <div key={category}>
                          <h5 className="text-xs font-medium text-muted-foreground mb-2">
                            {category}
                          </h5>
                          <div className="grid grid-cols-8 gap-1">
                            {emojis.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => insertEmoji(emoji)}
                                className="p-2 hover:bg-accent rounded text-xl transition-all hover:scale-125"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Send/Voice Button */}
              {message.trim() || selectedFiles.length > 0 ? (
                <Button
                  onClick={handleSend}
                  disabled={disabled}
                  size="icon"
                  className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleVoiceRecord}
                  disabled={disabled}
                  className="h-11 w-11 rounded-full hover:bg-blue-500/10 hover:text-blue-600 flex-shrink-0"
                >
                  <Mic className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Input Helper Text */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
              <span>
                Press <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> to send,{' '}
                <kbd className="px-1 py-0.5 bg-muted rounded">Shift</kbd> +{' '}
                <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> for new line
              </span>
              {message.length > 0 && (
                <span className={cn(message.length > 1000 && 'text-destructive')}>
                  {message.length}/2000
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
