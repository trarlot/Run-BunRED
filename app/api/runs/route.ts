import { NextResponse } from 'next/server';
import { getRunsData } from '@/scripts/fetch-from-sheets';

// Cache en mémoire (persiste entre les requêtes sur le même instance)
// ⚠️ NOTE: Sur Vercel Serverless, le cache peut être perdu si une nouvelle instance est créée
// Pour un cache persistant, considérer l'utilisation de Vercel KV ou Redis
let cachedRuns: any[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60000; // 1 minute en millisecondes

// Rate limiting simple (basique - pour production, utiliser un middleware dédié)
const requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 60; // Limite de 60 requêtes par minute

/**
 * API Route pour servir les données des runs
 * Charge les données dynamiquement depuis Google Sheets
 * Utilise un cache en mémoire pour éviter trop d'appels à l'API Google Sheets
 */
export async function GET() {
    try {
        const now = Date.now();
        
        // Rate limiting basique
        const oneMinuteAgo = now - 60000;
        const recentRequests = requestTimestamps.filter(ts => ts > oneMinuteAgo);
        
        if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
            // Si on dépasse la limite, on retourne le cache même expiré
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
                { status: 429 }
            );
        }
        
        requestTimestamps.push(now);
        // Nettoie les anciennes timestamps (garder seulement les 5 dernières minutes)
        if (requestTimestamps.length > MAX_REQUESTS_PER_MINUTE * 5) {
            requestTimestamps.splice(0, requestTimestamps.length - MAX_REQUESTS_PER_MINUTE);
        }
        
        // Vérifie si le cache est encore valide
        if (cachedRuns && (now - cacheTimestamp) < CACHE_DURATION) {
            return NextResponse.json({
                runs: cachedRuns,
                cached: true,
                timestamp: new Date(cacheTimestamp).toISOString(),
            });
        }

        // Charge les données depuis Google Sheets avec timeout
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: Google Sheets API trop lente')), 10000)
        );
        
        const runs = await Promise.race([
            getRunsData(),
            timeoutPromise
        ]) as any[];
        
        // Met à jour le cache
        cachedRuns = runs;
        cacheTimestamp = now;

        return NextResponse.json({
            runs,
            cached: false,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('❌ Erreur API /api/runs:', error);
        
        // Si on a un cache même expiré, on le retourne en fallback
        // C'est important car Google Sheets API peut être temporairement indisponible
        if (cachedRuns) {
            return NextResponse.json({
                runs: cachedRuns,
                cached: true,
                warning: 'Erreur lors de la récupération, utilisation du cache',
                error: error.message,
                timestamp: new Date(cacheTimestamp).toISOString(),
            });
        }
        
        // En dernier recours, retourne une erreur 503 (Service Unavailable)
        // plutôt que 500 pour indiquer que c'est temporaire
        return NextResponse.json(
            { 
                error: 'Service temporairement indisponible',
                message: error.message || 'Impossible de charger les données depuis Google Sheets',
                hint: 'Les données du dernier build sont disponibles en fallback'
            },
            { status: 503 }
        );
    }
}

