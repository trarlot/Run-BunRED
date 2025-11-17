'use client';

import { useRef, useState, useEffect } from 'react';

interface HorizontalScrollContainerProps {
    children: React.ReactNode;
    className?: string;
}

export default function HorizontalScrollContainer({
    children,
    className = '',
}: HorizontalScrollContainerProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);

    // Gestion du scroll à la roulette
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (scrollContainerRef.current) {
            // Si Shift est pressé ou si on scroll horizontalement, on scroll horizontalement
            // Sinon, on convertit le scroll vertical en scroll horizontal
            const isHorizontalScroll = e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);
            
            if (isHorizontalScroll) {
                // Scroll horizontal direct
                scrollContainerRef.current.scrollLeft += e.deltaX || e.deltaY;
                e.preventDefault();
            } else {
                // Convertit le scroll vertical en scroll horizontal
                // Seulement si on est au-dessus du conteneur et qu'il y a du contenu à scroller
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                const canScrollLeft = scrollLeft > 0;
                const canScrollRight = scrollLeft < scrollWidth - clientWidth;
                
                if (canScrollLeft || canScrollRight) {
                    scrollContainerRef.current.scrollLeft += e.deltaY;
                    e.preventDefault();
                }
            }
        }
    };

    // Gestion du drag-to-scroll
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        // Ne pas activer le drag si on clique sur un élément interactif
        const target = e.target as HTMLElement;
        if (
            target.tagName === 'BUTTON' ||
            target.tagName === 'A' ||
            target.closest('button') ||
            target.closest('a')
        ) {
            return;
        }

        if (scrollContainerRef.current) {
            setIsDragging(true);
            const rect = scrollContainerRef.current.getBoundingClientRect();
            startXRef.current = e.pageX - rect.left;
            scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
            // Change le curseur pour indiquer qu'on peut drag
            scrollContainerRef.current.style.cursor = 'grabbing';
            scrollContainerRef.current.style.userSelect = 'none';
        }
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.style.cursor = 'grab';
            scrollContainerRef.current.style.userSelect = 'auto';
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.style.cursor = 'grab';
            scrollContainerRef.current.style.userSelect = 'auto';
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const rect = scrollContainerRef.current.getBoundingClientRect();
        const x = e.pageX - rect.left;
        const walk = (x - startXRef.current) * 2; // Multiplié par 2 pour un scroll plus rapide
        scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
    };

    // Gestion des événements globaux pour le drag
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            setIsDragging(false);
            if (scrollContainerRef.current) {
                scrollContainerRef.current.style.cursor = 'grab';
                scrollContainerRef.current.style.userSelect = 'auto';
            }
        };

        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!isDragging || !scrollContainerRef.current) return;
            e.preventDefault();
            const rect = scrollContainerRef.current.getBoundingClientRect();
            const x = e.pageX - rect.left;
            const walk = (x - startXRef.current) * 2;
            scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
        };

        if (isDragging) {
            document.addEventListener('mouseup', handleGlobalMouseUp);
            document.addEventListener('mousemove', handleGlobalMouseMove);
        }

        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
            document.removeEventListener('mousemove', handleGlobalMouseMove);
        };
    }, [isDragging]);

    return (
        <div
            ref={scrollContainerRef}
            className={`w-full overflow-x-auto pb-4 ${className}`}
            style={{ cursor: 'grab' }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
        >
            {children}
        </div>
    );
}

