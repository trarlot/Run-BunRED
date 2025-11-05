'use client';

import { Run } from '@/types/run';

interface RunStatsProps {
    run: Run;
}

export default function RunStats({ run }: RunStatsProps) {
    if (!run.runStart && !run.runEnd && !run.wonBattles && !run.personalBest) {
        return null;
    }

    return (
        <div className="flex flex-col justify-between lg:justify-center gap-2 h-full">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-2 items-stretch h-full">
                <div className="flex items-center gap-2 bg-green-700 rounded-lg px-3 py-2 h-full">
                    <span className="text-white font-semibold text-sm xl:text-xl">
                        Run #{run.runNumber}
                    </span>
                </div>
                <div className="bg-blue-500/20 rounded-lg p-3 w-full text-center flex flex-col justify-center h-full">
                    <div className="font-bold w-full text-white text-sm xl:text-xl">
                        {run.team.filter((p) => !p.isDead).length}/
                        {run.team.length}
                    </div>
                    <div className="text-xs w-full text-gray-300">Alive</div>
                </div>
                <div className="bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2 h-full">
                    <div>
                        <div className="text-gray-300 text-xs md:text-sm">
                            Battles
                        </div>
                        <div className="text-white font-semibold text-sm xl:text-xl leading-tight">
                            {run.wonBattles ?? '--'}
                        </div>
                    </div>
                </div>
                <div
                    className={`${
                        run.deadPokemon > 0
                            ? 'bg-red-500/30'
                            : 'bg-green-500/20'
                    } rounded-lg p-3 text-center flex flex-col justify-center h-full`}>
                    <div className="font-bold text-white text-sm xl:text-xl">
                        {run.deadPokemon}
                    </div>
                    <div className="text-xs text-gray-300">Deaths</div>
                </div>
            </div>

            {/* Ligne 2 : 2 colonnes - Start, End */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-2 lg:gap-x-2 items-stretch h-full">
                <div className="bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2 h-full">
                    <div>
                        <div className="text-gray-300 text-xs md:text-sm">
                            Start
                        </div>
                        <div className="text-white font-semibold text-sm xl:text-xl leading-tight">
                            {run.runStart ?? '--'}
                        </div>
                    </div>
                </div>
                <div className="bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2 h-full">
                    <div>
                        <div className="text-gray-300 text-xs md:text-sm">
                            End
                        </div>
                        <div className="text-white font-semibold text-sm xl:text-xl leading-tight">
                            {run.runEnd ?? '--'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
