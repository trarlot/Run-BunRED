'use client';

import { Run } from '@/types/run';
import { getAltFormSpriteById } from '@/utils/pokemon';
import ImagePkn from '@/app/components/ImagePkn';

interface TrainerShowcaseProps {
    run: Run;
}

function ShowcasePokemon({
    nameOrId,
    spriteUrl,
    idx,
}: {
    nameOrId: string | number | undefined;
    spriteUrl: string;
    idx: number;
}) {
    return (
        <div
            key={`showcase-${idx}`}
            className="w-10 h-10 sm:w-12 sm:h-12 xl:w-16 xl:h-16 rounded bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
            {spriteUrl ? (
                <ImagePkn
                    src={spriteUrl}
                    alt={String(nameOrId || `empty-${idx}`)}
                    width={45}
                    height={45}
                    className="object-contain w-full h-full"
                />
            ) : null}
        </div>
    );
}

export default function TrainerShowcase({ run }: TrainerShowcaseProps) {
    if (
        !run.trainerSprite ||
        !run.showcasePokemon?.length ||
        !run.personalBest
    ) {
        return null;
    }

    return (
        <div className="h-full max-w-full sm:max-w-[290px] lg:max-w-none flex flex-col justify-center bg-white/10 rounded-lg px-2 sm:px-3 py-2 sm:py-3">
            <div className="text-[10px] sm:text-xs text-gray-300 mb-1.5 sm:mb-2 md:mb-0">
                Personal Best :{' '}
                <span className="text-white  truncate">{run.personalBest}</span>
            </div>

            <div className="flex items-center h-full gap-1.5 sm:gap-2">
                {run.trainerSprite && (
                    <div className="h-20 w-20 sm:h-[96px] sm:w-[96px] xl:h-[128px] xl:w-[128px] rounded bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        <ImagePkn
                            src={run.trainerSprite}
                            alt="Trainer"
                            width={100}
                            height={100}
                            className="object-contain w-full h-full"
                        />
                    </div>
                )}
                {run.showcasePokemon && run.showcasePokemon.length > 0 && (
                    <div className="flex flex-col gap-1.5 sm:gap-2">
                        {/* Première ligne: 3 premiers Pokémon */}
                        <div className="flex gap-1.5 sm:gap-2">
                            {[0, 1, 2].map((idx) => {
                                const nameOrId = run.showcasePokemon![idx];
                                let spriteUrl = '';
                                if (
                                    run.showcasePokemonSprites &&
                                    run.showcasePokemonSprites[idx]
                                ) {
                                    spriteUrl =
                                        run.showcasePokemonSprites[idx]!;
                                } else if (nameOrId) {
                                    const asNum = parseInt(
                                        String(nameOrId),
                                        10,
                                    );
                                    if (!Number.isNaN(asNum) && asNum > 905) {
                                        console.log(
                                            `🔍 Showcase idx=${idx}, nameOrId=${nameOrId}, asNum=${asNum}`,
                                        );
                                        const resolved =
                                            getAltFormSpriteById(asNum);
                                        console.log(
                                            `🔍 getAltFormSpriteById(${asNum}) =>`,
                                            resolved,
                                        );
                                        spriteUrl = resolved || '';
                                    }
                                }
                                return (
                                    <ShowcasePokemon
                                        key={`showcase-${idx}`}
                                        nameOrId={nameOrId}
                                        spriteUrl={spriteUrl}
                                        idx={idx}
                                    />
                                );
                            })}
                        </div>
                        {/* Deuxième ligne: 3 derniers Pokémon */}
                        <div className="flex gap-1.5 sm:gap-2">
                            {[3, 4, 5].map((idx) => {
                                const nameOrId = run.showcasePokemon![idx];
                                let spriteUrl = '';
                                if (
                                    run.showcasePokemonSprites &&
                                    run.showcasePokemonSprites[idx]
                                ) {
                                    spriteUrl =
                                        run.showcasePokemonSprites[idx]!;
                                } else if (nameOrId) {
                                    const asNum = parseInt(
                                        String(nameOrId),
                                        10,
                                    );
                                    if (!Number.isNaN(asNum) && asNum > 905) {
                                        console.log(
                                            `🔍 Showcase idx=${idx}, nameOrId=${nameOrId}, asNum=${asNum}`,
                                        );
                                        const resolved =
                                            getAltFormSpriteById(asNum);
                                        console.log(
                                            `🔍 getAltFormSpriteById(${asNum}) =>`,
                                            resolved,
                                        );
                                        spriteUrl = resolved || '';
                                    }
                                }
                                return (
                                    <ShowcasePokemon
                                        key={`showcase-${idx}`}
                                        nameOrId={nameOrId}
                                        spriteUrl={spriteUrl}
                                        idx={idx}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
