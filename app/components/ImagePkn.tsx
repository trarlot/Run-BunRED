'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export function FadeImage({
    src,
    alt,
    width,
    height,
    className,
}: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
}) {
    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className || ''}
            unoptimized
        />
    );
}

export default function ImagePkn({
    src,
    alt,
    width,
    height,
    className,
}: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
}) {
    return (
        <FadeImage
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
        />
    );
}
