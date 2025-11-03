import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route pour invalider le cache de /api/runs
 * Appelée automatiquement par Vercel Cron Jobs (toutes les X minutes)
 * 
 * Cette route n'a plus besoin de déclencher un rebuild car les données
 * sont maintenant chargées dynamiquement via /api/runs.
 * Elle peut servir à invalider le cache si nécessaire.
 */
export async function GET(request: NextRequest) {
    // Vérification du secret pour sécuriser l'endpoint (optionnel)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    // Note: Cette route est appelée par le cron job mais n'a pas besoin
    // de faire quoi que ce soit car /api/runs charge les données dynamiquement
    // avec son propre système de cache (1 minute).
    // Les données seront automatiquement actualisées à la prochaine requête
    // à /api/runs après expiration du cache.
    
    return NextResponse.json({
        success: true,
        message: 'Cron job actif. Les données sont chargées dynamiquement via /api/runs.',
        note: 'Le cache de /api/runs expire après 1 minute, les nouvelles données seront automatiquement chargées.',
        timestamp: new Date().toISOString(),
    });
}

