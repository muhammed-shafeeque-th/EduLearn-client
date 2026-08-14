'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Upload, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImageUpload } from '../hooks/use-file-upload';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (avatar: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

export function AvatarUpload({
  currentAvatar,
  onAvatarChange,
  size = 'lg',
  className,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { preview, isUploading, error, handleFileSelect, resetUpload } = useImageUpload({
    onUpload: (file, preview) => onAvatarChange(preview),
  });

  const displayAvatar = preview || currentAvatar;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveAvatar = () => {
    resetUpload();
    onAvatarChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      <div
        className={cn(
          'relative rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700',
          sizes[size]
        )}
      >
        {displayAvatar ? (
          <>
            <Image
              src={displayAvatar}
              alt="Profile avatar"
              fill
              className="object-cover"
              sizes="(max-width: 128px) 100vw, 128px"
            />
            {!isUploading && (
              <button
                onClick={handleRemoveAvatar}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                aria-label="Remove avatar"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Upload avatar"
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {displayAvatar ? 'Change Image' : 'Upload Image'}
        </Button>

        {error && <p className="text-xs text-red-600 dark:text-red-400 text-center">{error}</p>}
      </div>
    </div>
  );
}
