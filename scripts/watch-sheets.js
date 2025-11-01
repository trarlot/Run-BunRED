/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { fetchAndConvert } = require('./fetch-from-sheets');

/**
 * Watcher qui synchronise automatiquement depuis Google Sheets
 * Toutes les 10 minutes
 */

const INTERVAL = 1 * 60 * 1000; // 1 minute en millisecondes

console.log('🚀 Démarrage du watcher Google Sheets');
console.log(`📊 Google Sheet ID : ${process.env.GOOGLE_SHEET_ID}`);
console.log(`⏱️  Intervalle : 10 minutes\n`);

async function syncLoop() {
    try {
        console.log(
            `\n🔄 ${new Date().toLocaleTimeString()} - Synchronisation en cours...`,
        );
        const success = await fetchAndConvert();

        if (success) {
            console.log('✨ Synchronisation réussie !');
        } else {
            console.log('⚠️  La synchronisation a échoué');
        }
    } catch (error) {
        console.error(`❌ Erreur : ${error.message}`);
    }
}

// Première exécution immédiate
syncLoop();

// Ensuite toutes les 10 minutes
setInterval(syncLoop, INTERVAL);

console.log('✅ Watcher actif - Appuyez sur Ctrl+C pour arrêter\n');

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
    console.log('\n\n🛑 Arrêt du watcher...');
    process.exit(0);
});
