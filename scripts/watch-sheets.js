/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const {
    fetchAndConvert,
    checkAndUpdateFirstRun,
} = require('./fetch-from-sheets');

/**
 * Watcher optimisé qui vérifie seulement si la première run a obtenu un runEnd
 * ⚡ OPTIMISATION : Ne parse que la première run au lieu de toutes les runs
 * Si la première run a un runEnd, elle est ajoutée aux statiques
 */

const INTERVAL = 5 * 60 * 1000; // 5 minutes en millisecondes

console.log('🚀 Démarrage du watcher Google Sheets (mode optimisé)');
console.log(`📊 Google Sheet ID : ${process.env.GOOGLE_SHEET_ID}`);
console.log(
    `⏱️  Intervalle : ${INTERVAL / 1000 / 60} minutes (vérification rapide)\n`,
);

async function syncLoop() {
    try {
        console.log(
            `\n🔄 ${new Date().toLocaleTimeString()} - Vérification de la première run...`,
        );
        
        // ⚡ OPTIMISATION : Vérifie seulement si la première run a obtenu un runEnd
        // Cela ne parse que la première run au lieu de toutes les runs
        const needsUpdate = await checkAndUpdateFirstRun();

        if (needsUpdate) {
            console.log('✨ Mise à jour des statiques réussie !');
        } else {
            console.log('✅ Aucune mise à jour nécessaire');
        }
    } catch (error) {
        console.error(`❌ Erreur : ${error.message}`);
        // En cas d'erreur, on peut essayer une synchronisation complète
        console.log('   Tentative de synchronisation complète...');
        try {
            await fetchAndConvert();
        } catch (fullError) {
            console.error(`❌ Erreur lors de la synchronisation complète : ${fullError.message}`);
        }
    }
}

// Première exécution immédiate
syncLoop();

// Ensuite toutes les X minutes (défini par INTERVAL)
setInterval(syncLoop, INTERVAL);

console.log('✅ Watcher actif - Appuyez sur Ctrl+C pour arrêter\n');

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
    console.log('\n\n🛑 Arrêt du watcher...');
    process.exit(0);
});
