'use client';

import { Run } from '@/types/run';
import Image from 'next/image';

const ALL_EMERALD_BADGES = [
    'knuckle-badge.png',
    'stone-badge.png',
    'dynamo-badge.png',
    'balance-badge.png',
    'heat-badge.png',
    'feather-badge.png',
    'mind-badge.png',
    'rain-badge.png',
];

interface BadgesGridProps {
    run: Run;
}

export default function BadgesGrid({ run }: BadgesGridProps) {
    const badges = run.badges ?? [];

    // Debug: afficher les badges obtenus
    if (badges.length > 0) {
        console.log('🏅 Badges obtenus pour la run:', run.runNumber);
        badges.forEach((b) => {
            console.log(`  - ${b.name} → ${b.imageName}`);
        });
        console.log('🏅 Badges attendus:', ALL_EMERALD_BADGES);
    }

    return (
        <div className="w-[100px] sm:w-[268px]  xl:w-[344px]">
            {/* Grille 2x3 sur très petits écrans, flex-wrap sur sm, 3x2 à partir de md */}
            <div className="grid grid-cols-2 gap-1 sm:grid sm:grid-cols-4 sm:gap-1.5  md:gap-1.5 xl:gap-2">
                {ALL_EMERALD_BADGES.map((imgName) => {
                    // Comparaison plus robuste : normalise les noms (trim, lowercase)
                    const obtained = badges.some((b) => {
                        const badgeImageName = (b.imageName || '')
                            .trim()
                            .toLowerCase();
                        const expectedImageName = imgName.trim().toLowerCase();
                        return badgeImageName === expectedImageName;
                    });
                    // Debug pour le dernier badge
                    if (imgName === 'rain-badge.png' && !obtained) {
                        console.log(
                            `⚠️ Rain Badge non trouvé. Badges disponibles:`,
                            badges.map((b) => b.imageName),
                        );
                    }
                    return (
                        <div
                            key={imgName}
                            className="w-12 h-12 sm:w-[64px] sm:h-[64px] xl:w-20 xl:h-20 rounded flex items-center justify-center overflow-hidden bg-white/10">
                            <Image
                                src={`/assets/${imgName}`}
                                alt={imgName}
                                width={50}
                                height={50}
                                className="object-contain max-w-[80%] "
                                style={
                                    obtained
                                        ? { opacity: 1 }
                                        : {
                                              opacity: 0.1,
                                              filter: 'grayscale(1)',
                                          }
                                }
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
