import { NextRequest, NextResponse } from 'next/server';
import { getRunByNumber } from '@/scripts/fetch-from-sheets';
import { Run } from '@/types/run';

// Cache en mémoire pour les runs individuelles
// Structure: { [runNumber]: { run: Run, timestamp: number } }
const cachedRuns: Map<number, { run: Run; timestamp: number }> = new Map();
const CACHE_DURATION = 60000; // 1 minute en millisecondes

/**
 * API Route pour servir une run spécifique avec tous ses détails
 * Charge uniquement la run demandée pour optimiser les performances
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ runNumber: string }> },
) {
    try {
        const { runNumber: runNumberParam } = await params;
        const runNumber = parseInt(runNumberParam, 10);

        if (isNaN(runNumber) || runNumber <= 0) {
            return NextResponse.json(
                { error: 'Numéro de run invalide' },
                { status: 400 },
            );
        }

        const now = Date.now();

        // Vérifie si le cache est encore valide pour cette run
        const cached = cachedRuns.get(runNumber);
        if (cached && now - cached.timestamp < CACHE_DURATION) {
            return NextResponse.json({
                run: cached.run,
                cached: true,
                timestamp: new Date(cached.timestamp).toISOString(),
            });
        }

        // Charge la run spécifique depuis Google Sheets avec timeout
        // Timeout à 25 secondes car on doit charger données + formules + parser
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
                () =>
                    reject(
                        new Error(
                            'Timeout: Google Sheets API trop lente (>25s)',
                        ),
                    ),
                25000,
            ),
        );

        let run: Run;
        try {
            run = (await Promise.race([
                getRunByNumber(runNumber),
                timeoutPromise,
            ])) as Run;
        } catch (timeoutError: unknown) {
            const errorMessage = timeoutError instanceof Error ? timeoutError.message : 'Erreur inconnue';
            // En cas de timeout, on retourne le cache même expiré si disponible
            if (errorMessage.includes('Timeout') && cached) {
                console.warn(
                    `⏱️ Timeout API Google Sheets pour Run #${runNumber}, utilisation du cache expiré`,
                );
                return NextResponse.json({
                    run: cached.run,
                    cached: true,
                    warning:
                        'API Google Sheets trop lente, utilisation du cache',
                    timestamp: new Date(cached.timestamp).toISOString(),
                });
            }
            throw timeoutError;
        }

        // Met à jour le cache
        cachedRuns.set(runNumber, { run, timestamp: now });

        // Nettoie le cache des runs trop anciennes (garder seulement les 10 dernières)
        if (cachedRuns.size > 10) {
            const entries = Array.from(cachedRuns.entries());
            entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
            const toKeep = entries.slice(0, 10);
            cachedRuns.clear();
            toKeep.forEach(([num, data]) => cachedRuns.set(num, data));
        }

        return NextResponse.json({
            run,
            cached: false,
            timestamp: new Date().toISOString(),
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error(
            `❌ Erreur API /api/runs/[runNumber]:`,
            errorMessage,
        );

        // En cas d'erreur, on retourne le cache même expiré si disponible
        try {
            const { runNumber: runNumberParam } = await params;
            const runNumber = parseInt(runNumberParam, 10);
            const cached = cachedRuns.get(runNumber);
            if (cached) {
                return NextResponse.json({
                    run: cached.run,
                    cached: true,
                    warning: 'Erreur lors de la récupération, utilisation du cache',
                    error: errorMessage,
                    timestamp: new Date(cached.timestamp).toISOString(),
                });
            }

            return NextResponse.json(
                {
                    error: 'Run non trouvée',
                    message:
                        errorMessage ||
                        `Impossible de charger la run #${runNumberParam}`,
                },
                { status: errorMessage?.includes('non trouvée') ? 404 : 503 },
            );
        } catch {
            // Si on ne peut même pas parser params, retourne une erreur générique
            return NextResponse.json(
                {
                    error: 'Paramètre invalide',
                    message: errorMessage || 'Impossible de charger la run',
                },
                { status: 400 },
            );
        }
    }
}

