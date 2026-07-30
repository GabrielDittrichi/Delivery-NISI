'use client';

import Image, { type ImageProps } from 'next/image';
import { Leaf } from 'lucide-react';
import { useState } from 'react';

type SafeImageProps = ImageProps & {
  fallbackClassName?: string;
  fallbackIconSize?: number;
};

export default function SafeImage({
  alt,
  fallbackClassName = 'flex h-full w-full items-center justify-center text-emerald-700',
  fallbackIconSize = 28,
  onError,
  ...props
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={fallbackClassName}>
        <Leaf size={fallbackIconSize} />
      </div>
    );
  }

  return (
    <Image
      {...props}
      alt={alt}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}
