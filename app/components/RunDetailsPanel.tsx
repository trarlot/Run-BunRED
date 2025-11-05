'use client';

import { Run } from '@/types/run';
import RunStats from './RunStats';
import BadgesGrid from './BadgesGrid';
import TrainerShowcase from './TrainerShowcase';

interface RunDetailsPanelProps {
    run: Run;
}

export default function RunDetailsPanel({ run }: RunDetailsPanelProps) {
    return (
        <div className="w-fit rounded-2xl bg-gray-900 mb-4">
            <div className="flex flex-row items-center h-82 lg:h-40 xl:h-50 p-4 gap-4">
                {/* Colonne gauche: stats */}
                <div className="shrink-0 h-full text-gray-300">
                    <RunStats run={run} />
                </div>

                {/* Colonne droite: Trainer + Showcase et Badges empilés en colonne, puis en ligne à partir de lg */}
                <div className="flex flex-col h-full lg:flex-row gap-4">
                    <TrainerShowcase run={run} />
                    <BadgesGrid run={run} />
                </div>
            </div>
        </div>
    );
}
