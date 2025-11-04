import { NextResponse } from 'next/server';
import {
    getRunsList,
    getRunByNumber,
    fetchMultipleRunsRange,
    getGoogleSheetsClient,
} from '@/scripts/fetch-from-sheets';
import { runs as staticRuns } from '@/data/runs';

import { Run } from '@/types/run';

// Type helper for getRunByNumber to accept number | null | undefined for startLine
type GetRunByNumber = (
    runNumber: number,
    startLine?: number | null,
    rows?: unknown,
    formulas?: unknown,
) => Promise<Run | null>;

// Cache en mémoire (persiste entre les requêtes sur le même instance)
// ⚠️ NOTE: Sur Vercel Serverless, le cache peut être perdu si une nouvelle instance est créée
// Pour un cache persistant, considérer l'utilisation de Vercel KV ou Redis
let cachedRuns: Run[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60000; // 1 minute en millisecondes

// Cache persistant des runs terminées (accumule les runs terminées au fil du temps)
// Ce cache sera initialisé avec les runs statiques et augmentera automatiquement
// quand une première run obtient un runEnd
let persistentCache: Run[] | null = null;

// Rate limiting simple (basique - pour production, utiliser un middleware dédié)
const requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 60; // Limite de 60 requêtes par minute

/**
 * API Route pour servir toutes les runs avec leurs détails complets
 * ⚡ OPTIMISATION : Détecte et parse automatiquement les nouvelles runs terminées
 *
 * Workflow :
 * - data/runs.ts est le cache par défaut (généré au build avec toutes les runs terminées)
 * - À chaque requête, on récupère la liste des runs (métadonnées rapides)
 * - On identifie les nouvelles runs terminées (avec runEnd) qui ne sont pas dans le cache
 * - On parse uniquement ces nouvelles runs terminées et on les ajoute au cache
 * - La première run (sans runEnd) est toujours chargée en live
 * - Le cache en mémoire persiste entre les requêtes (sur la même instance)
 * - Pas d'écriture de fichiers (compatible Vercel read-only filesystem)
 */
export async function GET() {
    const startTime = Date.now();
    const timings: Record<string, number> = {};

    try {
        const now = Date.now();

        // Étape 1: Rate limiting
        const stepStart = Date.now();
        const oneMinuteAgo = now - 60000;
        const recentRequests = requestTimestamps.filter(
            (ts) => ts > oneMinuteAgo,
        );

        if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
            if (cachedRuns) {
                return NextResponse.json({
                    runs: cachedRuns,
                    cached: true,
                    warning: 'Rate limit atteint, utilisation du cache',
                    timestamp: new Date(cacheTimestamp).toISOString(),
                });
            }
            return NextResponse.json(
                { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
                { status: 429 },
            );
        }

        requestTimestamps.push(now);
        if (requestTimestamps.length > MAX_REQUESTS_PER_MINUTE * 5) {
            requestTimestamps.splice(
                0,
                requestTimestamps.length - MAX_REQUESTS_PER_MINUTE,
            );
        }
        timings.rateLimit = Date.now() - stepStart;

        // Étape 2: Vérification du cache
        const cacheCheckStart = Date.now();
        if (cachedRuns && now - cacheTimestamp < CACHE_DURATION) {
            return NextResponse.json({
                runs: cachedRuns,
                cached: true,
                timestamp: new Date(cacheTimestamp).toISOString(),
            });
        }
        timings.cacheCheck = Date.now() - cacheCheckStart;

        // Étape 3: Récupération de la liste des runs
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
                () =>
                    reject(
                        new Error(
                            'Timeout: Google Sheets API trop lente (>20s)',
                        ),
                    ),
                20000,
            ),
        );

        let runsList: Array<{
            id: string;
            runNumber: number;
            runEnd?: string;
        }> = [];
        let firstRun: Run | null = null;

        try {
            const getListStart = Date.now();
            runsList = (await Promise.race([
                getRunsList(),
                timeoutPromise,
            ])) as Array<{ id: string; runNumber: number; runEnd?: string }>;
            timings.getRunsList = Date.now() - getListStart;

            // Étape 4: Récupération de la première run
            const getFirstStart = Date.now();
            const firstRunData = runsList.sort(
                (a, b) => b.runNumber - a.runNumber,
            )[0];
            if (firstRunData && !firstRunData.runEnd) {
                // ⚡ OPTIMISATION : Utilise getRunByNumber avec startLine au lieu de getFirstRun
                // Cela évite de charger toutes les colonnes (A1:ZZ1000)
                const startLineValue =
                    'startLine' in firstRunData &&
                    typeof firstRunData.startLine === 'number'
                        ? firstRunData.startLine
                        : undefined;
                // getRunByNumber accepts number | null | undefined in JavaScript, but TypeScript types it as null | undefined
                const rawFirstRun = await (getRunByNumber as GetRunByNumber)(
                    firstRunData.runNumber,
                    startLineValue,
                );
                if (rawFirstRun) {
                    firstRun = {
                        ...rawFirstRun,
                        team: rawFirstRun.team.map((pokemon) => ({
                            ...pokemon,
                            sprite:
                                pokemon.sprite === null
                                    ? undefined
                                    : pokemon.sprite,
                        })),
                    };
                }
            }
            timings.getFirstRun = Date.now() - getFirstStart;
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : 'Erreur inconnue';

            if (errorMessage.includes('Timeout') && cachedRuns) {
                return NextResponse.json({
                    runs: cachedRuns,
                    cached: true,
                    warning:
                        'API Google Sheets trop lente, utilisation du cache',
                    timestamp: new Date(cacheTimestamp).toISOString(),
                });
            }

            runsList = [];
            firstRun = null;
        }

        // Étape 5: Initialisation du cache persistant
        // ⚡ FIX : Réinitialise toujours avec staticRuns pour s'assurer qu'on a les dernières runs du build
        // Ensuite, les nouvelles runs parsées seront ajoutées dans l'étape suivante
        const initCacheStart = Date.now();
        if (persistentCache === null) {
            // Première initialisation : utilise les runs statiques
            persistentCache = [...staticRuns].sort(
                (a, b) => b.runNumber - a.runNumber,
            );
        } else {
            // Cache existant : s'assure qu'on a toutes les runs statiques (au cas où elles ont été mises à jour)
            // On merge les runs statiques avec le cache existant pour éviter de perdre les nouvelles runs parsées
            const cachedRunNumbers = new Set(
                persistentCache.map((r) => r.runNumber),
            );

            // Ajoute les nouvelles runs statiques qui ne sont pas dans le cache
            const missingStaticRuns = staticRuns.filter(
                (r) => !cachedRunNumbers.has(r.runNumber),
            );

            if (missingStaticRuns.length > 0) {
                // Fusionne les runs statiques manquantes avec le cache existant
                const allRuns = [...persistentCache, ...missingStaticRuns];
                persistentCache = allRuns.sort(
                    (a, b) => b.runNumber - a.runNumber,
                );
            }
        }
        timings.initCache = Date.now() - initCacheStart;

        // Étape 6: Détection des nouvelles runs terminées
        const detectStart = Date.now();
        const cachedRunNumbers = new Set(
            persistentCache.map((r) => r.runNumber),
        );
        const newFinishedRuns = runsList.filter(
            (r) => r.runEnd && !cachedRunNumbers.has(r.runNumber),
        );
        timings.detectNewRuns = Date.now() - detectStart;

        if (newFinishedRuns.length > 0) {
            console.log(
                `[🔍 Détection] ${
                    newFinishedRuns.length
                } nouvelle(s) run(s) terminée(s) détectée(s): ${newFinishedRuns
                    .map((r) => `#${r.runNumber}`)
                    .join(', ')}`,
            );
        }

        // Étape 7: Parsing des nouvelles runs terminées (seulement si nécessaire)
        timings.parseNewRuns = 0;
        if (newFinishedRuns.length > 0) {
            const parseStart = Date.now();
            const newRunsToAdd: Run[] = [];

            // ⚡ OPTIMISATION : Si plusieurs runs, on peut les parser depuis une seule plage
            // Si une seule run, on utilise getRunByNumber (plus simple)
            if (newFinishedRuns.length === 1) {
                // Cas simple : une seule run
                try {
                    const runMeta = newFinishedRuns[0];
                    const startLine =
                        'startLine' in runMeta &&
                        typeof runMeta.startLine === 'number'
                            ? runMeta.startLine
                            : undefined;
                    const parsedRun = await (getRunByNumber as GetRunByNumber)(
                        runMeta.runNumber,
                        startLine,
                    );
                    if (parsedRun) {
                        const normalizedRun: Run = {
                            ...parsedRun,
                            team: parsedRun.team.map((pokemon) => ({
                                ...pokemon,
                                sprite:
                                    pokemon.sprite === null
                                        ? undefined
                                        : pokemon.sprite,
                            })),
                        };
                        newRunsToAdd.push(normalizedRun);
                    }
                } catch {
                    // Erreur silencieuse
                }
            } else {
                // Cas multiple : charge toutes les runs en une seule plage
                try {
                    const runsWithStartLines = newFinishedRuns
                        .filter((r) => 'startLine' in r)
                        .map((r) => ({
                            runNumber: r.runNumber,
                            startLine: r.startLine as number,
                        }));

                    if (runsWithStartLines.length > 0) {
                        // Charge toutes les runs en une seule plage (optimisé pour plusieurs runs)
                        const sheets = await getGoogleSheetsClient();
                        const {
                            rows,
                            formulas,
                            runs: adjustedRuns,
                        } = await fetchMultipleRunsRange(
                            runsWithStartLines,
                            sheets,
                        );

                        // Parse toutes les runs depuis cette plage unique
                        for (const adjustedRun of adjustedRuns) {
                            try {
                                const parsedRun = await (
                                    getRunByNumber as GetRunByNumber
                                )(
                                    adjustedRun.runNumber,
                                    typeof adjustedRun.adjustedStartLine ===
                                        'number'
                                        ? adjustedRun.adjustedStartLine
                                        : undefined,
                                    rows,
                                    formulas,
                                );
                                if (parsedRun) {
                                    const normalizedRun: Run = {
                                        ...parsedRun,
                                        team: parsedRun.team.map((pokemon) => ({
                                            ...pokemon,
                                            sprite:
                                                pokemon.sprite === null
                                                    ? undefined
                                                    : pokemon.sprite,
                                        })),
                                    };
                                    newRunsToAdd.push(normalizedRun);
                                }
                            } catch {
                                // Erreur silencieuse pour cette run
                            }
                        }
                    } else {
                        // Fallback : parse une par une si pas de startLine
                        for (const runMeta of newFinishedRuns) {
                            try {
                                const parsedRun = await (
                                    getRunByNumber as GetRunByNumber
                                )(runMeta.runNumber, undefined);
                                if (parsedRun) {
                                    const normalizedRun: Run = {
                                        ...parsedRun,
                                        team: parsedRun.team.map((pokemon) => ({
                                            ...pokemon,
                                            sprite:
                                                pokemon.sprite === null
                                                    ? undefined
                                                    : pokemon.sprite,
                                        })),
                                    };
                                    newRunsToAdd.push(normalizedRun);
                                }
                            } catch {
                                // Erreur silencieuse
                            }
                        }
                    }
                } catch {
                    // En cas d'erreur, fallback sur le parsing une par une
                    for (const runMeta of newFinishedRuns) {
                        try {
                            const startLine =
                                'startLine' in runMeta
                                    ? runMeta.startLine
                                    : null;
                            const parsedRun = await (
                                getRunByNumber as GetRunByNumber
                            )(
                                runMeta.runNumber,
                                typeof startLine === 'number'
                                    ? startLine
                                    : undefined,
                            );
                            if (parsedRun) {
                                const normalizedRun: Run = {
                                    ...parsedRun,
                                    team: parsedRun.team.map((pokemon) => ({
                                        ...pokemon,
                                        sprite:
                                            pokemon.sprite === null
                                                ? undefined
                                                : pokemon.sprite,
                                    })),
                                };
                                newRunsToAdd.push(normalizedRun);
                            }
                        } catch {
                            // Erreur silencieuse
                        }
                    }
                }
            }

            if (newRunsToAdd.length > 0) {
                console.log(
                    `[✅ Parsing] ${newRunsToAdd.length}/${newFinishedRuns.length} nouvelle(s) run(s) parsée(s) avec succès`,
                );
                const allRuns = [...newRunsToAdd, ...persistentCache];
                persistentCache = allRuns.sort(
                    (a, b) => b.runNumber - a.runNumber,
                );
                console.log(
                    `[💾 Cache] Cache persistant mis à jour: ${persistentCache.length} runs (${staticRuns.length} statiques + ${newRunsToAdd.length} nouvelles)`,
                );
            } else if (newFinishedRuns.length > 0) {
                console.warn(
                    `[⚠️  Parsing] Aucune run n'a pu être parsée sur ${newFinishedRuns.length} détectée(s)`,
                );
            }
            timings.parseNewRuns = Date.now() - parseStart;
        }

        // Étape 8: Combinaison des runs
        const combineStart = Date.now();
        let runs: Run[];
        if (firstRun) {
            const filteredCache = persistentCache.filter(
                (r) => r.runNumber !== firstRun!.runNumber,
            );
            runs = [firstRun, ...filteredCache];
            console.log(
                `[📦 Combinaison] ${runs.length} runs au total: 1 première run (en cours) + ${filteredCache.length} runs terminées`,
            );
        } else {
            runs = persistentCache;
            console.log(
                `[📦 Combinaison] ${runs.length} runs au total: toutes terminées`,
            );
        }
        timings.combineRuns = Date.now() - combineStart;

        // Met à jour le cache
        cachedRuns = runs;
        cacheTimestamp = now;

        const totalTime = Date.now() - startTime;
        const timingsStr = Object.entries(timings)
            .map(([key, value]) => `${key}: ${value}ms`)
            .join(', ');

        console.log(
            `[API /runs] Total: ${totalTime}ms (${timingsStr}) | Runs: ${runs.length} (${newFinishedRuns.length} nouvelle(s))`,
        );

        // ⚡ OPTIMISATION : Cache HTTP pour les runs terminées (pas pour la première run en cours)
        // Si aucune nouvelle run n'a été détectée, on peut mettre un cache plus long
        const hasNewRuns = newFinishedRuns.length > 0;
        const response = NextResponse.json({
            runs,
            cached: false,
            timestamp: new Date().toISOString(),
        });

        // Cache HTTP : 1 minute si pas de nouvelles runs, 0 si nouvelles runs détectées
        if (!hasNewRuns) {
            response.headers.set(
                'Cache-Control',
                'public, s-maxage=60, stale-while-revalidate=300',
            );
        } else {
            // Pas de cache si nouvelles runs détectées (pour voir les changements immédiatement)
            response.headers.set('Cache-Control', 'no-cache');
        }

        return response;
    } catch (error: unknown) {
        const totalTime = Date.now() - startTime;
        const errorMessage =
            error instanceof Error ? error.message : 'Erreur inconnue';
        console.error(
            `[API /runs] Erreur après ${totalTime}ms: ${errorMessage}`,
        );

        if (cachedRuns) {
            return NextResponse.json({
                runs: cachedRuns,
                cached: true,
                warning: 'Erreur lors de la récupération, utilisation du cache',
                error: errorMessage,
                timestamp: new Date(cacheTimestamp).toISOString(),
            });
        }

        return NextResponse.json(
            {
                error: 'Service temporairement indisponible',
                message:
                    errorMessage ||
                    'Impossible de charger les données depuis Google Sheets',
                hint: 'Les données du dernier build sont disponibles en fallback',
            },
            { status: 503 },
        );
    }
}
