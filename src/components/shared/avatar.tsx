import { TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import React, { useMemo } from 'react';
import { Tooltip, TooltipContent } from '../ui/tooltip';
import { Avatar as AvatarContainer } from '../ui/avatar';
import { AvatarFallback } from '@radix-ui/react-avatar';
import Image from 'next/image';

// Helper to get initials from name
function getInitials(name?: string) {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0]?.toUpperCase())
    .join('');
}

type AvatarProps = {
  size?: 'sm' | 'default' | 'lg' | 'md';
  src: string;
  name?: string;
  email?: string;
  tooltip?: boolean;
};

const sizeMap = {
  sm: { className: 'my-auto h-8 w-8', width: 32, height: 32, text: 'text-base' },
  md: { className: 'my-auto h-16 w-16 border text-3xl', width: 64, height: 64, text: 'text-3xl' },
  lg: { className: 'my-auto h-36 w-36 border text-5xl', width: 144, height: 144, text: 'text-5xl' },
  default: {
    className: 'my-auto h-10 w-10 border text-lg',
    width: 40,
    height: 40,
    text: 'text-lg',
  },
};

const Avatar: React.FC<AvatarProps> = ({ src, email, name, size = 'default', tooltip = false }) => {
  const { className, width, height, text } = sizeMap[size] || sizeMap['default'];
  const initials = useMemo(() => getInitials(name), [name]);
  const altText = name ? `${name}'s profile picture` : 'Profile picture';

  const avatarContent = (
    <AvatarContainer className={className + ' ' + text}>
      <Image
        src={src}
        className="z-10 object-cover aspect-square size-full"
        width={width}
        height={height}
        alt={altText}
      />
      <AvatarFallback className="z-10 -ml-8">{initials}</AvatarFallback>
    </AvatarContainer>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{avatarContent}</TooltipTrigger>
          <TooltipContent>
            <p>{name}</p>
            {email && <small className="text-secondary">{email}</small>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return avatarContent;
};

export default React.memo(Avatar);
