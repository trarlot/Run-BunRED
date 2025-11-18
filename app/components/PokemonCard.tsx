'use client';

import { Pokemon } from '@/types/run';
import { getNatureEffect, getPokemonSprite } from '@/utils/pokemon';
import ImagePkn from '@/app/components/ImagePkn';
import { useEffect, useState, useRef } from 'react';

type SVGTextAnchor = 'start' | 'middle' | 'end';

function RadarChart({
    values,
    maxValue = 31,
    size = 180,
}: {
    values: { label: string; value: number; colorClass?: string }[];
    maxValue?: number;
    size?: number;
}) {
    const numAxes = values.length;
    const center = size / 2;
    const radius = size / 2 - 12;
    const angleStep = (Math.PI * 2) / numAxes;
    const viewPadding = 16;
    const viewPaddingTop = 24; // Plus de padding en haut pour le label HP

    // Morph animation state
    const prevValuesRef = useRef<number[]>(values.map((v) => v.value));
    const [animatedValues, setAnimatedValues] = useState<number[]>(
        values.map((v) => v.value),
    );
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const from = prevValuesRef.current;
        const to = values.map((v) => v.value);
        const duration = 350;
        const start = performance.now();
        const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic

        const step = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const e = ease(t);
            const current = to.map(
                (target, i) => from[i] + (target - from[i]) * e,
            );
            setAnimatedValues(current);
            if (t < 1) {
                rafRef.current = requestAnimationFrame(step);
            } else {
                prevValuesRef.current = to;
                rafRef.current = null;
            }
        };

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(step);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [values]);

    const toPoint = (val: number, axisIndex: number) => {
        const ratio = Math.max(0, Math.min(1, val / maxValue));
        const r = radius * ratio;
        const angle = -Math.PI / 2 + axisIndex * angleStep;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
    };

    const gridLevels = 4;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`-${viewPadding} -${viewPaddingTop} ${
                size + viewPadding * 2
            } ${size + viewPadding + viewPaddingTop}`}>
            <defs>
                <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.2" />
                </linearGradient>
            </defs>

            {/* rings */}
            {[...Array(gridLevels)].map((_, i) => {
                const levelRatio = (i + 1) / gridLevels;
                const r = radius * levelRatio;
                const points = values
                    .map((_, idx) => {
                        const angle = -Math.PI / 2 + idx * angleStep;
                        const x = center + r * Math.cos(angle);
                        const y = center + r * Math.sin(angle);
                        return `${x},${y}`;
                    })
                    .join(' ');
                return (
                    <polygon
                        key={`ring-${i}`}
                        points={points}
                        fill="none"
                        stroke="#ffffff22"
                        strokeWidth={1}
                    />
                );
            })}

            {/* axes */}
            {values.map((_, idx) => {
                const angle = -Math.PI / 2 + idx * angleStep;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                return (
                    <line
                        key={`axis-${idx}`}
                        x1={center}
                        y1={center}
                        x2={x}
                        y2={y}
                        stroke="#ffffff22"
                        strokeWidth={1}
                    />
                );
            })}

            {/* data polygon (morph) */}
            <polygon
                points={animatedValues
                    .map((v, idx) => toPoint(v, idx))
                    .join(' ')}
                fill="url(#radarFill)"
                stroke="#22c55e"
                strokeWidth={2}
            />

            {/* axis dots (morph) */}
            {animatedValues.map((v, idx) => {
                const [x, y] = toPoint(v, idx).split(',').map(Number);
                return (
                    <circle
                        key={`dot-${idx}`}
                        cx={x}
                        cy={y}
                        r={3}
                        fill="#86efac"
                        stroke="#22c55e"
                        strokeWidth={1}
                    />
                );
            })}

            {/* labels avec valeurs */}
            {values.map((v, idx) => {
                const angle = -Math.PI / 2 + idx * angleStep;
                const labelRadius = radius + 10;
                const lx = center + labelRadius * Math.cos(angle);
                const ly = center + labelRadius * Math.sin(angle);
                const anchor =
                    Math.abs(Math.cos(angle)) < 0.2
                        ? 'middle'
                        : Math.cos(angle) > 0
                        ? 'start'
                        : 'end';
                // Position du label (HP, ATK, etc.)
                // HP est en haut (idx 0)
                const labelDy =
                    idx === 0 ? -12 : Math.sin(angle) > 0.2 ? 4 : -14;
                // Position de la valeur (sous le label avec plus d'espace)
                const valueDy = idx === 0 ? 2 : Math.sin(angle) > 0.2 ? 18 : 0;
                return (
                    <g key={`label-${idx}`}>
                        {/* Label (HP, ATK, etc.) */}
                        <text
                            x={lx}
                            y={ly}
                            textAnchor={anchor as SVGTextAnchor}
                            dy={labelDy}
                            fill="currentColor"
                            className={`text-[12px] font-semibold ${
                                v.colorClass || 'text-gray-300'
                            }`}>
                            {v.label}
                        </text>
                        {/* Valeur (le nombre) */}
                        <text
                            x={lx}
                            y={ly}
                            textAnchor={anchor as SVGTextAnchor}
                            dy={valueDy}
                            fill="currentColor"
                            className={`text-xs font-bold ${
                                v.colorClass || 'text-white'
                            }`}>
                            {Math.round(animatedValues[idx])}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

export default function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
    // Effet de la nature
    const natureEffect = pokemon.nature ? getNatureEffect(pokemon.nature) : {};

    // État pour le sprite avec fallback
    const [spriteUrl, setSpriteUrl] = useState<string | null>(pokemon.sprite || null);
    const fetchedPokemonRef = useRef<string | null>(null);

    // Fonction pour obtenir la couleur d'une stat selon la nature
    const getStatColor = (stat: string) => {
        if (natureEffect.increased === stat) return 'text-red-400'; // +10%
        if (natureEffect.decreased === stat) return 'text-red-300'; // -10%
        return 'text-white'; // Neutre
    };

    // Fallback: construit l'URL du sprite directement depuis le nom (sans appeler l'API)
    useEffect(() => {
        // Si le sprite est déjà défini, l'utiliser
        if (pokemon.sprite) {
            setSpriteUrl(pokemon.sprite);
            fetchedPokemonRef.current = pokemon.nameEn; // Marquer comme traité
            return;
        }

        // Si on a déjà traité ce Pokémon, ne pas refaire
        if (fetchedPokemonRef.current === pokemon.nameEn) return;

        fetchedPokemonRef.current = pokemon.nameEn;

        // Construit l'URL directement depuis le nom, sans appeler l'API
        // Cela évite les dépendances à Cloudflare/PokéAPI
        const sprite = getPokemonSprite(pokemon.nameEn);
        setSpriteUrl(sprite);
    }, [pokemon.nameEn, pokemon.sprite]);

    return (
        <div className="relative min-w-[140px] sm:min-w-[170px] lg:min-w-[280px] flex flex-col items-center">
            {/* Carte Pokémon */}

            <div
                className={`relative w-full overflow-hidden rounded-2xl pb-3 sm:pb-4 bg-gray-900 shadow-xl`}>
                <div
                    className={`text-[10px] sm:text-xs lg:text-sm ${
                        pokemon.isDead ? 'bg-red-600' : 'bg-green-700'
                    } mb-2 sm:mb-4 py-1.5 sm:py-2 font-semibold text-white text-center`}>
                    {pokemon.location}
                </div>

                {/* Image et Infos principales côte à côte */}
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 px-3 sm:px-4">
                    {/* Image */}
                    <div
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 ${
                            pokemon.isDead ? 'grayscale' : ''
                        }`}>
                        {spriteUrl ? (
                            <ImagePkn
                                src={spriteUrl}
                                alt={pokemon.nameEn}
                                width={96}
                                height={96}
                                className="pixelated"
                            />
                        ) : (
                            <span className="text-3xl sm:text-4xl">❓</span>
                        )}
                    </div>

                    {/* Infos à droite */}
                    <div className="flex-1 text-left">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <h4 className="text-sm sm:text-base lg:text-lg font-bold text-white leading-tight">
                                {pokemon.nameFr}
                            </h4>
                            {pokemon.isDead && (
                                <span className="text-[10px] sm:text-xs lg:text-sm font-bold text-red-400 bg-red-500/20 px-1.5 sm:px-2 py-0.5 rounded-full">
                                    K.O
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] sm:text-xs lg:text-sm text-gray-300 italic">
                            {pokemon.nameEn}
                        </p>
                        <div className="mt-0.5 sm:mt-1 flex items-center gap-2">
                            <div className="inline-block bg-white/10 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">
                                <span className="text-[10px] sm:text-xs text-gray-300">
                                    Lvl.
                                </span>
                                <span className="text-[10px] sm:text-xs lg:text-sm font-bold text-green-300 ml-1">
                                    {pokemon.level}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Moves en grille 2x2 - toujours 4 slots */}
                <div className="bg-gray-800 mx-3 sm:mx-4 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                    <div className="hidden lg:block text-xs text-gray-300 text-center mb-2">
                        Moves
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                        {Array.from({ length: 4 }).map((_, idx) => {
                            const move =
                                (pokemon.moves && pokemon.moves[idx]) || '';
                            return (
                                <div
                                    key={idx}
                                    className={`rounded px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs text-center ${
                                        move ? 'bg-white/5' : 'bg-white/5/0.5'
                                    }`}>
                                    {move ? (
                                        <span className="font-semibold text-blue-300">
                                            {move}
                                        </span>
                                    ) : (
                                        <span className="text-gray-500">—</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Talent et Nature côte à côte */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mx-3 sm:mx-4 mb-2 sm:mb-3">
                    {/* Talent */}
                    <div className="bg-gray-800 rounded-lg p-1.5 sm:p-2">
                        <div className="text-xs hidden lg:block text-gray-300 text-center">
                            Ability
                        </div>
                        <div className="text-[10px] sm:text-xs font-semibold text-green-100 text-center">
                            {pokemon.ability}
                        </div>
                    </div>

                    {/* Nature */}
                    {pokemon.nature && (
                        <div className="bg-gray-800 rounded-lg p-1.5 sm:p-2">
                            <div className="text-xs hidden lg:block text-gray-300 text-center">
                                Nature
                            </div>
                            <div className="text-[10px] sm:text-xs font-semibold text-green-300 text-center">
                                {pokemon.nature}
                            </div>
                        </div>
                    )}
                </div>

                {/* IVs */}
                {pokemon.ivs && (
                    <div className="bg-gray-800 mx-3 sm:mx-4 rounded-lg p-2 sm:p-3 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs hidden lg:block font-semibold text-white">
                                IVs
                            </span>
                        </div>

                        <div className="flex flex-col items-center scale-90 sm:scale-100">
                            <RadarChart
                                size={120}
                                maxValue={31}
                                values={[
                                    { label: 'HP', value: pokemon.ivs.hp },
                                    {
                                        label: 'ATK',
                                        value: pokemon.ivs.attack,
                                        colorClass: getStatColor('attack'),
                                    },
                                    {
                                        label: 'DEF',
                                        value: pokemon.ivs.defense,
                                        colorClass: getStatColor('defense'),
                                    },
                                    {
                                        label: 'SPE',
                                        value: pokemon.ivs.speed,
                                        colorClass: getStatColor('speed'),
                                    },
                                    {
                                        label: 'SpD',
                                        value: pokemon.ivs.spDefense,
                                        colorClass: getStatColor('spDefense'),
                                    },
                                    {
                                        label: 'SpA',
                                        value: pokemon.ivs.spAttack,
                                        colorClass: getStatColor('spAttack'),
                                    },
                                ]}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
