'use client';

import { Run } from '@/types/run';
import { useState } from 'react';
import HorizontalScrollContainer from '@/app/components/HorizontalScrollContainer';

interface RunHeaderProps {
    runs: Run[];
    selectedRun: Run;
    onSelectRun: (run: Run) => void;
}

// Helper pour calculer les top 3 runs
function getTopRuns(runs: Run[]) {
    const getWins = (r: Run) => {
        if (!r.wonBattles) return 0;
        const parts = r.wonBattles.split('/') as string[];
        const wins = parseInt(parts[0] || '0', 10);
        return Number.isNaN(wins) ? 0 : wins;
    };

    const ranked = [...runs].sort((a, b) => getWins(b) - getWins(a));
    const topIds = new Map<string, number>();
    ranked.slice(0, 3).forEach((r, idx) => topIds.set(r.id, idx));
    return topIds;
}

export default function RunHeader({
    runs,
    selectedRun,
    onSelectRun,
}: RunHeaderProps) {
    const topIds = getTopRuns(runs);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const sortedRuns = [...runs].sort((a, b) => b.runNumber - a.runNumber);

    const handleRunSelect = (run: Run) => {
        onSelectRun(run);
        setIsMenuOpen(false);
    };

    // Navigation entre les runs
    // sortedRuns est trié par numéro décroissant (14, 13, ..., 2, 1)
    // La première run est la 14 (index 0), la dernière est la 1 (index length-1)
    const currentIndex = sortedRuns.findIndex((r) => r.id === selectedRun.id);

    // Run avec numéro plus petit (suivante dans la liste, index + 1)
    // Si on est sur la dernière run (index length-1), il n'y en a pas
    const runWithSmallerNumber =
        currentIndex < sortedRuns.length - 1
            ? sortedRuns[currentIndex + 1]
            : null;

    // Run avec numéro plus grand (précédente dans la liste, index - 1)
    // Si on est sur la première run (index 0), il n'y en a pas
    const runWithLargerNumber =
        currentIndex > 0 ? sortedRuns[currentIndex - 1] : null;

    // Flèche gauche : aller vers la run précédente dans la liste (numéro plus grand)
    // Désactivée si on est sur la première run (14, index 0)
    const handlePrevious = () => {
        if (runWithLargerNumber) {
            onSelectRun(runWithLargerNumber);
        }
    };

    // Flèche droite : aller vers la run suivante dans la liste (numéro plus petit)
    // Désactivée si on est sur la dernière run (1, index length-1)
    const handleNext = () => {
        if (runWithSmallerNumber) {
            onSelectRun(runWithSmallerNumber);
        }
    };

    return (
        <header className="flex justify-between items-center py-4 lg:py-0 sticky top-0 px-4 sm:px-6 lg:px-8 border-b border-white/10 bg-black/20 backdrop-blur-sm z-50">
            <h1 className="text-lg lg:text-2xl xl:text-4xl font-bold text-white">
                Run<span className="text-green-400">&</span>Bun
                <span className="text-red-600">RED</span>
            </h1>

            {/* Bouton menu pour mobile (en dessous de lg) */}
            <div className="relative lg:hidden flex items-center gap-2">
                {/* Flèche gauche : vers la run précédente (numéro plus grand) */}
                <button
                    onClick={handlePrevious}
                    disabled={!runWithLargerNumber}
                    className={`p-2 rounded-lg transition-all ${
                        runWithLargerNumber
                            ? 'bg-gray-900 text-white hover:bg-gray-800'
                            : 'bg-gray-900/50 text-gray-600 cursor-not-allowed'
                    }`}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>

                {/* Bouton run avec border gold/silver/bronze si dans le top 3 */}
                {(() => {
                    const rank = topIds.has(selectedRun.id)
                        ? topIds.get(selectedRun.id)!
                        : -1;
                    const gradient =
                        rank === 0
                            ? 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-300'
                            : rank === 1
                            ? 'bg-gradient-to-br from-gray-200 via-gray-400 to-gray-200'
                            : rank === 2
                            ? 'bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950'
                            : '';
                    const wrapperClass = gradient
                        ? `rounded-lg p-[2px] ${gradient}`
                        : 'p-[2px] ';
                    return (
                        <div className={wrapperClass}>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all">
                                <span className="text-base">
                                    Run #{selectedRun.runNumber}
                                </span>
                                {selectedRun.wonBattles && (
                                    <span className="ml-2 text-base opacity-75 font-normal">
                                        {selectedRun.wonBattles}
                                    </span>
                                )}
                            </button>
                        </div>
                    );
                })()}

                {/* Flèche droite : vers la run suivante (numéro plus petit) */}
                <button
                    onClick={handleNext}
                    disabled={!runWithSmallerNumber}
                    className={`p-2 rounded-lg transition-all ${
                        runWithSmallerNumber
                            ? 'bg-gray-900 text-white hover:bg-gray-800'
                            : 'bg-gray-900/50 text-gray-600 cursor-not-allowed'
                    }`}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>

                {/* Menu dropdown */}
                {isMenuOpen && (
                    <>
                        {/* Overlay pour fermer le menu */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        {/* Menu */}
                        <div className="absolute top-12 right-0 mt-2 w-64 max-h-[80vh] overflow-y-auto bg-gray-900 rounded-lg border border-white/10 shadow-xl z-50">
                            <div className="p-2">
                                <div className="text-xs text-gray-400 px-2 py-1 mb-1">
                                    Sélectionner une run
                                </div>
                                {sortedRuns.map((run) => {
                                    const rank = topIds.has(run.id)
                                        ? topIds.get(run.id)!
                                        : -1;
                                    const gradient =
                                        rank === 0
                                            ? 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-300'
                                            : rank === 1
                                            ? 'bg-gradient-to-br from-gray-200 via-gray-400 to-gray-200'
                                            : rank === 2
                                            ? 'bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950'
                                            : '';
                                    const wrapperClass = gradient
                                        ? `rounded-lg p-[2px] ${gradient} mb-1`
                                        : 'mb-1';
                                    const isSelected =
                                        selectedRun.id === run.id;
                                    const btnBase = isSelected
                                        ? 'bg-gray-500 text-white'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700';
                                    return (
                                        <div
                                            key={run.id}
                                            className={wrapperClass}>
                                            <button
                                                onClick={() =>
                                                    handleRunSelect(run)
                                                }
                                                className={`w-full px-3 py-2 rounded-lg transition-all text-left ${btnBase}`}>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-base">
                                                        Run #{run.runNumber}
                                                    </span>
                                                    {run.wonBattles && (
                                                        <span className="ml-2 text-base opacity-75 font-normal">
                                                            {run.wonBattles}
                                                        </span>
                                                    )}
                                                </div>
                                                {run.personalBest && (
                                                    <div className="text-xs opacity-75 mt-1">
                                                        PB: {run.personalBest}
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Scroll horizontal pour desktop (à partir de lg) */}
            <div className="hidden lg:flex justify-center items-center max-w-[70%]">
                <h2 className="text-xl xl:text-2xl font-bold text-white shrink-0">
                    Runs:&nbsp;
                </h2>
                <HorizontalScrollContainer className="flex-1">
                    <div className="flex p-2 m-2 gap-2 flex-nowrap">
                        {sortedRuns.map((run) => {
                            const rank = topIds.has(run.id)
                                ? topIds.get(run.id)!
                                : -1;
                            const gradient =
                                rank === 0
                                    ? 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-300'
                                    : rank === 1
                                    ? 'bg-gradient-to-br from-gray-200 via-gray-400 to-gray-200'
                                    : rank === 2
                                    ? 'bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950'
                                    : '';
                            const wrapperClass = gradient
                                ? `rounded-lg p-[2px] ${gradient} shrink-0`
                                : 'shrink-0';
                            const isSelected = selectedRun.id === run.id;
                            const btnBase = isSelected
                                ? 'bg-green-700 text-white scale-105'
                                : 'bg-gray-900 text-gray-300 hover:bg-gray-800';
                            return (
                                <div key={run.id} className={wrapperClass}>
                                    <button
                                        onClick={() => onSelectRun(run)}
                                        className={`min-w-10 min-h-10 text-amber rounded-lg font-semibold transition-all ${btnBase}`}>
                                        {run.runNumber}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </HorizontalScrollContainer>
            </div>
        </header>
    );
}
