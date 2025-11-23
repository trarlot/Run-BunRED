'use client';

import { Run } from '@/types/run';
import PokemonCard from '@/app/components/PokemonCard';
import RunHeader from '@/app/components/RunHeader';
import RunDetailsPanel from '@/app/components/RunDetailsPanel';
import LoadingSkeleton from '@/app/components/LoadingSkeleton';
import HorizontalScrollContainer from '@/app/components/HorizontalScrollContainer';
import { useEffect, useState } from 'react';

// Import des runs statiques en fallback (pour le premier render)
import { runs as staticRuns } from '@/data/runs';

const SELECTED_RUN_STORAGE_KEY = 'runbun-selected-run-id';

export default function Home() {
    // ⚡ FIX : Ne pas initialiser avec staticRuns pour éviter le flash
    // On affiche le skeleton immédiatement jusqu'à ce que les données soient chargées
    const [runs, setRuns] = useState<Run[]>([]);
    const [selectedRun, setSelectedRun] = useState<Run | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Lien vers le Google Doc de référence
    const GOOGLE_SHEET_ID = '1OrFcuxg5DE-TvhK9_dGrqWScT4PyjLJ3uObTP3Sclkk';
    const googleDocUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}`;

    // Lien vers le site web du développeur
    const developerWebsiteUrl = 'https://www.tristan-arlot.com'; // Modifiez cette URL avec votre site

    // Sauvegarde la run sélectionnée dans localStorage
    const handleSelectRun = (run: Run) => {
        setSelectedRun(run);
        if (typeof window !== 'undefined') {
            localStorage.setItem(SELECTED_RUN_STORAGE_KEY, run.id);
        }
    };

    // Charge toutes les runs depuis l'API au montage du composant
    useEffect(() => {
        async function loadRuns() {
            setIsLoading(true);
            try {
                const response = await fetch('/api/runs');
                if (response.ok) {
                    const data = await response.json();
                    if (data.runs && data.runs.length > 0) {
                        // ⚡ FILTRAGE : Exclut la run originale #6 du sheet
                        const filteredRuns = data.runs.filter((r: Run) => {
                            const originalNum =
                                r.originalRunNumber ?? r.runNumber;
                            return originalNum !== 6;
                        });
                        setRuns(filteredRuns);

                        // ⚡ RESTAURATION : Essaie de restaurer la run sauvegardée
                        if (typeof window !== 'undefined') {
                            const savedRunId = localStorage.getItem(
                                SELECTED_RUN_STORAGE_KEY,
                            );
                            if (savedRunId) {
                                const savedRun = filteredRuns.find(
                                    (r: Run) => r.id === savedRunId,
                                );
                                if (savedRun) {
                                    setSelectedRun(savedRun);
                                    setIsLoading(false);
                                    return;
                                }
                            }
                        }
                        setSelectedRun(filteredRuns[0]);
                    } else {
                        // Fallback vers les runs statiques si l'API ne retourne rien
                        // ⚡ FILTRAGE : Exclut aussi la run originale #6 du sheet dans le fallback
                        const filteredStaticRuns = staticRuns.filter(
                            (r: Run) => {
                                const originalNum =
                                    r.originalRunNumber ?? r.runNumber;
                                return originalNum !== 6;
                            },
                        );
                        setRuns(filteredStaticRuns);

                        // ⚡ RESTAURATION : Essaie de restaurer la run sauvegardée
                        if (typeof window !== 'undefined') {
                            const savedRunId = localStorage.getItem(
                                SELECTED_RUN_STORAGE_KEY,
                            );
                            if (savedRunId) {
                                const savedRun = filteredStaticRuns.find(
                                    (r) => r.id === savedRunId,
                                );
                                if (savedRun) {
                                    setSelectedRun(savedRun);
                                    setIsLoading(false);
                                    return;
                                }
                            }
                        }
                        setSelectedRun(filteredStaticRuns[0]);
                    }
                } else {
                    // Fallback vers les runs statiques en cas d'erreur HTTP
                    // ⚡ FILTRAGE : Exclut aussi la run originale #6 du sheet dans le fallback
                    const filteredStaticRuns = staticRuns.filter((r: Run) => {
                        const originalNum = r.originalRunNumber ?? r.runNumber;
                        return originalNum !== 6;
                    });
                    setRuns(filteredStaticRuns);

                    // ⚡ RESTAURATION : Essaie de restaurer la run sauvegardée
                    if (typeof window !== 'undefined') {
                        const savedRunId = localStorage.getItem(
                            SELECTED_RUN_STORAGE_KEY,
                        );
                        if (savedRunId) {
                            const savedRun = filteredStaticRuns.find(
                                (r) => r.id === savedRunId,
                            );
                            if (savedRun) {
                                setSelectedRun(savedRun);
                                setIsLoading(false);
                                return;
                            }
                        }
                    }
                    setSelectedRun(filteredStaticRuns[0]);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des runs:', error);
                // Fallback vers les runs statiques en cas d'erreur
                // ⚡ FILTRAGE : Exclut aussi la run originale #6 du sheet dans le fallback
                const filteredStaticRuns = staticRuns.filter((r: Run) => {
                    const originalNum = r.originalRunNumber ?? r.runNumber;
                    return originalNum !== 6;
                });
                setRuns(filteredStaticRuns);

                // ⚡ RESTAURATION : Essaie de restaurer la run sauvegardée
                if (typeof window !== 'undefined') {
                    const savedRunId = localStorage.getItem(
                        SELECTED_RUN_STORAGE_KEY,
                    );
                    if (savedRunId) {
                        const savedRun = filteredStaticRuns.find(
                            (r) => r.id === savedRunId,
                        );
                        if (savedRun) {
                            setSelectedRun(savedRun);
                            setIsLoading(false);
                            return;
                        }
                    }
                }
                setSelectedRun(filteredStaticRuns[0]);
            } finally {
                setIsLoading(false);
            }
        }

        loadRuns();
    }, []);

    // Met à jour selectedRun quand runs change (si la run actuelle n'existe plus)
    useEffect(() => {
        if (
            runs.length > 0 &&
            (!selectedRun || !runs.find((r) => r.id === selectedRun.id))
        ) {
            // Essaie de restaurer la run sauvegardée, sinon prend la première
            if (typeof window !== 'undefined') {
                const savedRunId = localStorage.getItem(
                    SELECTED_RUN_STORAGE_KEY,
                );
                if (savedRunId) {
                    const savedRun = runs.find((r) => r.id === savedRunId);
                    if (savedRun) {
                        setSelectedRun(savedRun);
                        return;
                    }
                }
            }
            setSelectedRun(runs[0]);
        }
    }, [runs, selectedRun]);

    // Affiche le skeleton pendant le chargement
    if (isLoading || !selectedRun || runs.length === 0) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="relative min-h-screen bg-gray-700 bg-[url('/assets/bg2.jpg')] bg-cover bg-center bg-no-repeat bg-fixed flex flex-col">
            {/* Overlay semi-transparent pour assombrir l'image de fond */}
            <div className="absolute inset-0 bg-gray-900/70 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col flex-1">
                <RunHeader
                    runs={runs}
                    selectedRun={selectedRun}
                    onSelectRun={handleSelectRun}
                />

                <div className="flex-1 flex flex-col justify-center max-w-full px-4 py-2">
                    <div className="w-full flex flex-col justify-center ">
                        {/* Bloc mention du doc */}
                        <div className="mb-4 w-fit px-4 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-lg shadow-lg">
                            <p className="text-center text-md text-gray-300">
                                D&apos;après le{' '}
                                <a
                                    href={googleDocUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600 hover:text-green-400 font-medium  transition-colors">
                                    Google doc
                                </a>{' '}
                                de Sykless
                            </p>
                        </div>
                        <RunDetailsPanel run={selectedRun} />

                        {/* Rencontres - scroll horizontal */}
                        <HorizontalScrollContainer>
                            <div className="inline-flex gap-4 pb-4 sm:gap-7 min-w-max">
                                {selectedRun.team
                                    .sort(
                                        (a, b) =>
                                            (a.encounterOrder || 0) -
                                            (b.encounterOrder || 0),
                                    )
                                    .map((pokemon, index) => (
                                        <PokemonCard
                                            key={index}
                                            pokemon={pokemon}
                                        />
                                    ))}
                            </div>
                        </HorizontalScrollContainer>
                    </div>
                </div>

                {/* Crédit en bas à droite */}
                <footer className="relative z-10 mt-auto py-4 px-4">
                    <div className="flex justify-end">
                        <div className="px-4 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-lg shadow-lg">
                            <p className="text-[10px] text-gray-300">
                                Développé par{' '}
                                <a
                                    href={developerWebsiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600 hover:text-green-400 font-medium  transition-colors">
                                    Tristan Arlot
                                </a>
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
