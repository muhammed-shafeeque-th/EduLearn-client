import React, { useRef, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  placeholder?: string;
}

export function MessageInput({
  value,
  onChange,
  onSend,
  isSending,
  placeholder = 'Type your message...',
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSend();
        textareaRef.current?.focus();
      }
    },
    [onSend]
  );

  return (
    <div className="border-t border-border/50 bg-muted/20 p-4">
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[44px] max-h-[120px] resize-none bg-background border-border/50 focus-visible:ring-primary/30"
          rows={1}
        />
        <Button
          size="icon"
          onClick={onSend}
          disabled={!value.trim() || isSending}
          className="shrink-0 h-[44px] w-[44px]"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">
        Press Enter to send · Shift + Enter for new line
      </p>
    </div>
  );
}
