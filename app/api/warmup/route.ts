import { NextResponse } from 'next/server';
import { getGoogleSheetsClient } from '@/scripts/fetch-from-sheets';

/**
 * Endpoint de warming pour maintenir la fonction Serverless "warm"
 * 
 * Utilisation :
 * - Configurer un cron job (Vercel Cron) pour appeler cet endpoint toutes les 5-10 minutes
 * - Ou utiliser un service externe (UptimeRobot, Pingdom, etc.) pour pinger cet endpoint
 * 
 * Cet endpoint :
 * - Initialise le client Google Sheets (charge les dépendances)
 * - Fait une requête légère pour "échauffer" la connexion
 * - Réduit le cold start pour les prochaines requêtes
 */
export async function GET(request: Request) {
    try {
        const startTime = Date.now();
        
        // Initialise le client (charge googleapis si pas déjà fait)
        const sheets = await getGoogleSheetsClient();
        
        // Fait une requête légère pour "échauffer" la connexion HTTPS
        // On récupère seulement 1 cellule pour minimiser le temps
        const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1OrFcuxg5DE-TvhK9_dGrqWScT4PyjLJ3uObTP3Sclkk';
        const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'SpritesRuns';
        
        await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${SHEET_NAME}!A1:A1`, // Seulement 1 cellule
        });
        
        const duration = Date.now() - startTime;
        
        return NextResponse.json({
            success: true,
            message: 'Function warmed up successfully',
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

