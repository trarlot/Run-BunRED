'use client';

import { runs } from '@/data/runs';
import { Run } from '@/types/run';
import PokemonCard from '@/app/components/PokemonCard';
import RunHeader from '@/app/components/RunHeader';
import RunDetailsPanel from '@/app/components/RunDetailsPanel';
import { useEffect, useState } from 'react';

export default function Home() {
    const [selectedRun, setSelectedRun] = useState<Run>(runs[0]);

    useEffect(() => {}, [selectedRun]);

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
