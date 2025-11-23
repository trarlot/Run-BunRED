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
            // Si c'est un scroll horizontal natif (deltaX significatif), on laisse le comportement natif
            // On ne convertit que le scroll vertical en scroll horizontal
            const isHorizontalScroll =
                Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;

            if (isHorizontalScroll && !e.shiftKey) {
                // Scroll horizontal natif du trackpad - on laisse le navigateur gérer
                // Ne pas appeler preventDefault() pour permettre le comportement natif
                return;
            }

            // Convertit le scroll vertical en scroll horizontal
            // Seulement si on est au-dessus du conteneur et qu'il y a du contenu à scroller
            const { scrollLeft, scrollWidth, clientWidth } =
                scrollContainerRef.current;
            const canScrollLeft = scrollLeft > 0;
            const canScrollRight = scrollLeft < scrollWidth - clientWidth;

            if (canScrollLeft || canScrollRight) {
                if (e.shiftKey && e.deltaY !== 0) {
                    // Shift + scroll vertical = scroll horizontal
                    scrollContainerRef.current.scrollLeft += e.deltaY;
                    e.preventDefault();
                } else if (!isHorizontalScroll && e.deltaY !== 0) {
                    // Scroll vertical simple = scroll horizontal
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
            // Utiliser clientX au lieu de pageX pour une meilleure compatibilité trackpad/souris
            startXRef.current = e.clientX;
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
        // Utiliser clientX pour une meilleure compatibilité trackpad/souris
        const deltaX = (e.clientX - startXRef.current) * 2; // Multiplié par 2 pour un scroll plus rapide
        scrollContainerRef.current.scrollLeft = scrollLeftRef.current - deltaX;
        // Mettre à jour startXRef pour le prochain mouvement (évite l'accumulation d'erreurs)
        startXRef.current = e.clientX;
        scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
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
            // Utiliser clientX pour une meilleure compatibilité trackpad/souris
            const deltaX = (e.clientX - startXRef.current) * 2;
            scrollContainerRef.current.scrollLeft =
                scrollLeftRef.current - deltaX;
            // Mettre à jour startXRef pour le prochain mouvement (évite l'accumulation d'erreurs)
            startXRef.current = e.clientX;
            scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
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
            className={`w-full overflow-x-auto  ${className}`}
            style={{ cursor: 'grab' }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}>
            {children}
        </div>
    );
}
