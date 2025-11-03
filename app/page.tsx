'use client';

import { Run } from '@/types/run';
import PokemonCard from '@/app/components/PokemonCard';
import RunHeader from '@/app/components/RunHeader';
import RunDetailsPanel from '@/app/components/RunDetailsPanel';
import { useEffect, useState } from 'react';

// Import des runs statiques en fallback (pour le premier render)
import { runs as staticRuns } from '@/data/runs';

export default function Home() {
    const [runs, setRuns] = useState<Run[]>(staticRuns);
    const [selectedRun, setSelectedRun] = useState<Run>(staticRuns[0]);
    const [isLoading, setIsLoading] = useState(false);

    // Charge les données depuis l'API au montage du composant
    useEffect(() => {
        async function loadRuns() {
            setIsLoading(true);
            try {
                const response = await fetch('/api/runs');
                if (response.ok) {
                    const data = await response.json();
                    if (data.runs && data.runs.length > 0) {
                        setRuns(data.runs);
                        setSelectedRun(data.runs[0]);
                    }
                }
            } catch (error) {
                console.error('Erreur lors du chargement des runs:', error);
                // On garde les runs statiques en cas d'erreur
            } finally {
                setIsLoading(false);
            }
        }

        loadRuns();
    }, []);

    // Met à jour selectedRun quand runs change
    useEffect(() => {
        if (
            runs.length > 0 &&
            (!selectedRun || !runs.find((r) => r.id === selectedRun.id))
        ) {
            setSelectedRun(runs[0]);
        }
    }, [runs, selectedRun]);

    if (isLoading && runs === staticRuns) {
        return (
            <div className="relative min-h-screen bg-gray-700 flex items-center justify-center">
                <div className="text-white text-xl">
                    Chargement des données...
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gray-700">
            <RunHeader
                runs={runs}
                selectedRun={selectedRun}
                onSelectRun={setSelectedRun}
            />

            <div className="mx-auto max-w-full px-4 py-2">
                <RunDetailsPanel run={selectedRun} />

                {/* Rencontres - scroll horizontal */}
                <div className="overflow-x-auto pb-4">
                    <div className="inline-flex gap-4 min-w-max">
                        {selectedRun.team
                            .sort(
                                (a, b) =>
                                    (a.encounterOrder || 0) -
                                    (b.encounterOrder || 0),
                            )
                            .map((pokemon, index) => (
                                <PokemonCard key={index} pokemon={pokemon} />
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
