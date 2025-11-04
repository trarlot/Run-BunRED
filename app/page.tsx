'use client';

import { Run } from '@/types/run';
import PokemonCard from '@/app/components/PokemonCard';
import RunHeader from '@/app/components/RunHeader';
import RunDetailsPanel from '@/app/components/RunDetailsPanel';
import LoadingSkeleton from '@/app/components/LoadingSkeleton';
import { useEffect, useState } from 'react';

// Import des runs statiques en fallback (pour le premier render)
import { runs as staticRuns } from '@/data/runs';

export default function Home() {
    // ⚡ FIX : Ne pas initialiser avec staticRuns pour éviter le flash
    // On affiche le skeleton immédiatement jusqu'à ce que les données soient chargées
    const [runs, setRuns] = useState<Run[]>([]);
    const [selectedRun, setSelectedRun] = useState<Run | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Charge toutes les runs depuis l'API au montage du composant
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
                    } else {
                        // Fallback vers les runs statiques si l'API ne retourne rien
                        setRuns(staticRuns);
                        setSelectedRun(staticRuns[0]);
                    }
                } else {
                    // Fallback vers les runs statiques en cas d'erreur HTTP
                    setRuns(staticRuns);
                    setSelectedRun(staticRuns[0]);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des runs:', error);
                // Fallback vers les runs statiques en cas d'erreur
                setRuns(staticRuns);
                setSelectedRun(staticRuns[0]);
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

    // Affiche le skeleton pendant le chargement
    if (isLoading || !selectedRun || runs.length === 0) {
        return <LoadingSkeleton />;
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
