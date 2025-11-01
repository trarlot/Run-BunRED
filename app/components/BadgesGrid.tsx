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

    return (
        <div className="w-[265px] xl:w-[344px] h-full">
            <div className="flex flex-wrap gap-2">
                {ALL_EMERALD_BADGES.map((imgName) => {
                    const obtained = badges.some(
                        (b) => b.imageName === imgName,
                    );
                    return (
                        <div
                            key={imgName}
                            className="w-15 h-15 xl:w-20 xl:h-20 rounded flex items-center justify-center overflow-hidden bg-white/10">
                            <Image
                                src={`/assets/${imgName}`}
                                alt={imgName}
                                width={40}
                                height={40}
                                className="object-contain"
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
