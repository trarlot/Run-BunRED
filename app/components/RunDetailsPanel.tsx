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
            <div className="flex flex-col sm:flex-row items-start sm:items-center h-92 sm:h-82 lg:h-40 xl:h-50 px-4 py-3 gap-4">
                {/* Ligne du haut sur très petits écrans: Stats + Badges */}
                <div className="flex flex-row items-start w-full sm:w-auto gap-3 h-full sm:gap-4">
                    {/* Colonne gauche: stats */}
                    <div className="shrink-0 h-full text-gray-300">
                        <RunStats run={run} />
                    </div>

                    {/* Badges à droite sur très petits écrans, puis en dessous sur sm+ */}
                    <div className="sm:hidden">
                        <BadgesGrid run={run} />
                    </div>
                </div>

                {/* Colonne droite sur sm+: Trainer + Showcase et Badges empilés en colonne, puis en ligne à partir de lg */}
                <div className="hidden sm:flex flex-col h-full lg:flex-row gap-4">
                    <TrainerShowcase run={run} />
                    <BadgesGrid run={run} />
                </div>

                {/* TrainerShowcase en dessous sur très petits écrans */}
                <div className="w-full sm:hidden">
                    <TrainerShowcase run={run} />
                </div>
            </div>
        </div>
    );
}
