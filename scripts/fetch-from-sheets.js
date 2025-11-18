/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * Script qui récupère les données directement depuis Google Sheets
 * Sans besoin de télécharger manuellement le CSV !
 */

const OUTPUT_FILE = path.join(__dirname, '../data/runs.ts');

// Configuration
const SHEET_ID =
    process.env.GOOGLE_SHEET_ID ||
    '1OrFcuxg5DE-TvhK9_dGrqWScT4PyjLJ3uObTP3Sclkk';
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'SpritesRuns';
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

// Mapping des formes alternatives (IDs > 905) vers les IDs PokéAPI
// Copié depuis utils/pokemon.ts pour être utilisé dans le script
const ALT_FORM_ID_MAP = {
    906: { apiId: 10033 },
    907: { apiId: 10034 },
    908: { apiId: 10035 },
    909: { apiId: 10036 },
    910: { apiId: 10090 },
    911: { apiId: 10073 },
    912: { apiId: 10037 },
    913: { apiId: 10071 },
    914: { apiId: 10038 },
    915: { apiId: 10039 },
    916: { apiId: 10040 },
    917: { apiId: 10041 },
    918: { apiId: 10042 },
    919: { apiId: 10043 },
    920: { apiId: 10044 },
    921: { apiId: 10045 },
    922: { apiId: 10072 },
    923: { apiId: 10046 },
    924: { apiId: 10047 },
    925: { apiId: 10048 },
    926: { apiId: 10049 },
    927: { apiId: 10065 },
    928: { apiId: 10050 },
    929: { apiId: 10064 },
    930: { apiId: 10051 },
    931: { apiId: 10066 },
    932: { apiId: 10052 },
    933: { apiId: 10053 },
    934: { apiId: 10054 },
    935: { apiId: 10055 },
    936: { apiId: 10070 },
    937: { apiId: 10087 },
    938: { apiId: 10067 },
    939: { apiId: 10056 },
    940: { apiId: 10057 },
    941: { apiId: 10074 },
    942: { apiId: 10089 },
    943: { apiId: 10076 },
    944: { apiId: 10062 },
    945: { apiId: 10063 },
    946: { apiId: 10088 },
    947: { apiId: 10058 },
    948: { apiId: 10059 },
    949: { apiId: 10160 },
    950: { apiId: 10068 },
    951: { apiId: 10069 },
    952: { apiId: 10075 },
    953: { apiId: 10079 },
    954: { apiId: 10077 },
    955: { apiId: 10078 },
    956: { apiId: 10091 },
    957: { apiId: 10092 },
    958: { apiId: 10100 },
    959: { apiId: 10101 },
    960: { apiId: 10102 },
    961: { apiId: 10103 },
    962: { apiId: 10104 },
    963: { apiId: 10105 },
    964: { apiId: 10106 },
    965: { apiId: 10107 },
    966: { apiId: 10108 },
    967: { apiId: 10109 },
    968: { apiId: 10110 },
    969: { apiId: 10111 },
    970: { apiId: 10112 },
    971: { apiId: 10113 },
    972: { apiId: 10114 },
    973: { apiId: 10115 },
    974: { apiId: 10161 },
    975: { apiId: 10162 },
    976: { apiId: 10163 },
    977: { apiId: 10164 },
    978: { apiId: 10165 },
    979: { apiId: 10166 },
    980: { apiId: 10167 },
    981: { apiId: 10168 },
    982: { apiId: 10169 },
    983: { apiId: 10170 },
    984: { apiId: 10171 },
    985: { apiId: 10172 },
    986: { apiId: 10173 },
    987: { apiId: 10174 },
    988: { apiId: 10175 },
    989: { apiId: 10176 },
    990: { apiId: 10177 },
    991: { apiId: 10179 },
    992: { apiId: 10180 },
    993: { apiId: 10229 },
    994: { apiId: 10230 },
    995: { apiId: 10231 },
    996: { apiId: 10232 },
    997: { apiId: 10233 },
    998: { apiId: 10234 },
    999: { apiId: 10235 },
    1000: { apiId: 10236 },
    1001: { apiId: 10237 },
    1002: { apiId: 10238 },
    1003: { apiId: 10239 },
    1004: { apiId: 10240 },
    1005: { apiId: 10241 },
    1006: { apiId: 10242 },
    1007: { apiId: 10243 },
    1008: { apiId: 10244 },
    1009: { apiId: 10085 },
    1010: { apiId: 10080 },
    1011: { apiId: 10081 },
    1012: { apiId: 10082 },
    1013: { apiId: 10083 },
    1014: { apiId: 10084 },
    1015: { apiId: 10094 },
    1016: { apiId: 10095 },
    1017: { apiId: 10096 },
    1018: { apiId: 10097 },
    1019: { apiId: 10098 },
    1020: { apiId: 10099 },
    1021: { apiId: 10148 },
    1022: { apiId: 10160 },
    1023: { apiId: 172 },
    1024: { apiId: 201 },
    1025: { apiId: 201 },
    1026: { apiId: 201 },
    1027: { apiId: 201 },
    1028: { apiId: 201 },
    1029: { apiId: 201 },
    1030: { apiId: 201 },
    1031: { apiId: 201 },
    1032: { apiId: 201 },
    1033: { apiId: 201 },
    1034: { apiId: 201 },
    1035: { apiId: 201 },
    1036: { apiId: 201 },
    1037: { apiId: 201 },
    1038: { apiId: 201 },
    1039: { apiId: 201 },
    1040: { apiId: 201 },
    1041: { apiId: 201 },
    1042: { apiId: 201 },
    1043: { apiId: 201 },
    1044: { apiId: 201 },
    1045: { apiId: 201 },
    1046: { apiId: 201 },
    1047: { apiId: 201 },
    1048: { apiId: 201 },
    1049: { apiId: 201 },
    1050: { apiId: 201 },
    1051: { apiId: 10013 },
    1052: { apiId: 10014 },
    1053: { apiId: 10015 },
    1054: { apiId: 10001 },
    1055: { apiId: 10002 },
    1056: { apiId: 10003 },
    1057: { apiId: 412 },
    1058: { apiId: 412 },
    1059: { apiId: 10004 },
    1060: { apiId: 10005 },
    1062: { apiId: 422 },
    1063: { apiId: 423 },
    1064: { apiId: 10008 },
    1065: { apiId: 10009 },
    1066: { apiId: 10010 },
    1067: { apiId: 10011 },
    1068: { apiId: 10012 },
    1070: { apiId: 10124 },
    1071: { apiId: 10007 },
    1072: { apiId: 10006 },
    1073: { apiId: 494 },
    1074: { apiId: 494 },
    1075: { apiId: 494 },
    1076: { apiId: 494 },
    1077: { apiId: 494 },
    1078: { apiId: 494 },
    1079: { apiId: 494 },
    1080: { apiId: 494 },
    1081: { apiId: 494 },
    1082: { apiId: 494 },
    1083: { apiId: 494 },
    1084: { apiId: 494 },
    1085: { apiId: 494 },
    1086: { apiId: 494 },
    1087: { apiId: 494 },
    1088: { apiId: 494 },
    1089: { apiId: 494 },
    1104: { apiId: 10023 },
    1105: { apiId: 10022 },
    1113: { apiId: 10116 },
    1148: { apiId: 10061 },
    1155: { apiId: 10025 },
    1168: { apiId: 10086 },
    1169: { apiId: 10123 },
    1170: { apiId: 10124 },
    1171: { apiId: 10125 },
    1173: { apiId: 10126 },
    1174: { apiId: 10152 },
    1224: { apiId: 10185 },
    1225: { apiId: 10186 },
    1226: { apiId: 10187 },
    1227: { apiId: 10188 },
    1228: { apiId: 10189 },
    1230: { apiId: 10191 },
    1231: { apiId: 10192 },
    1232: { apiId: 10193 },
    1233: { apiId: 10194 },
};

// Mapping des noms de Pokémon français vers anglais
const pokemonFrToEn = {
    chimpenfeu: 'monferno',
    batracné: 'palpitoad',
    delcatty: 'delcatty',
    caninos: 'growlithe',
    pifeuil: 'nuzleaf',
    bleuseille: 'corvisquire',
    grillepatt: 'sizzlipede',
    cradopaud: 'croagunk',
    carvanha: 'carvanha',
    phogleur: 'sealeo',
    phanpy: 'phanpy',
    flingouste: 'clauncher',
    rémoraid: 'remoraid',
    luxio: 'luxio',
    ouisticram: 'chimchar',
    tiplouf: 'piplup',
    tortipouss: 'turtwig',
};

// Track si c'est la première connexion de la session
let isFirstConnection = true;

// ⚡ OPTIMISATION : Cache du client Google Sheets pour éviter de le recréer à chaque appel
// Sur Vercel Serverless, ce cache persiste entre les requêtes sur la même instance
let cachedSheetsClient = null;
let cachedAuth = null;

/**
 * Initialise le client Google Sheets (avec cache pour réutilisation)
 * ⚡ OPTIMISATION : Réutilise le même client entre les appels pour éviter les réinitialisations
 */
async function getGoogleSheetsClient() {
    // Si le client est déjà en cache, on le réutilise
    if (cachedSheetsClient) {
        return cachedSheetsClient;
    }

    const startTime = Date.now();

    // ⚡ OPTIMISATION : Cache aussi l'auth pour éviter de recréer l'objet
    if (!cachedAuth) {
        cachedAuth = new google.auth.GoogleAuth({
            apiKey: API_KEY,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
    }

    cachedSheetsClient = google.sheets({ version: 'v4', auth: cachedAuth });

    const authTime = Date.now() - startTime;
    if (authTime > 10) {
        console.log(`[⏱️  Google Sheets] Authentification: ${authTime}ms`);
    }

    return cachedSheetsClient;
}

/**
 * Mesure le temps de la première connexion réelle (première requête API)
 */
async function measureFirstConnection(apiCall) {
    if (isFirstConnection) {
        const firstConnectionStart = Date.now();
        const result = await apiCall();
        const firstConnectionTime = Date.now() - firstConnectionStart;
        console.log(
            `[🔌 Google Sheets] Première connexion: ${firstConnectionTime}ms`,
        );
        isFirstConnection = false;
        return result;
    }
    return await apiCall();
}

/**
 * Récupère les données depuis Google Sheets
 * @param {object} sheetsClient - Client Google Sheets réutilisable (optionnel)
 */
async function fetchSheetData(sheetsClient = null) {
    try {
        console.log('🔄 Récupération des données...');
        const sheets = sheetsClient || (await getGoogleSheetsClient());

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${SHEET_NAME}!A1:ZZ1000`, // Lit toutes les colonnes jusqu'à ZZ (702 colonnes)
        });

        const rows = response.data.values;
        console.log(`✅ ${rows.length} lignes récupérées depuis Google Sheets`);

        return rows;
    } catch (error) {
        console.error(
            '❌ Erreur lors de la récupération des données:',
            error.message,
        );
        if (error.message.includes('API key')) {
            console.error('⚠️  Vérifiez votre clé API dans le fichier .env');
        }
        throw error;
    }
}

/**
 * Récupère les formules depuis Google Sheets (pour détecter les images =IMAGE())
 * @param {object} sheetsClient - Client Google Sheets réutilisable (optionnel)
 */
async function fetchSheetFormulas(sheetsClient = null) {
    try {
        console.log('🔄 Récupération des formules...');
        const sheets = sheetsClient || (await getGoogleSheetsClient());

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${SHEET_NAME}!A1:ZZ1000`,
            valueRenderOption: 'FORMULA', // Récupère les formules au lieu des valeurs
        });

        const rows = response.data.values;
        console.log(`✅ ${rows.length} lignes de formules récupérées`);

        return rows;
    } catch (error) {
        console.error(
            '❌ Erreur lors de la récupération des formules:',
            error.message,
        );
        throw error;
    }
}

/**
 * Récupère les métadonnées des cellules pour détecter les images insérées directement
 */
async function fetchSheetWithImages() {
    try {
        console.log(
            '🔄 Récupération des métadonnées pour détecter les images directes...',
        );
        const sheets = await getGoogleSheetsClient();

        const response = await sheets.spreadsheets.get({
            spreadsheetId: SHEET_ID,
            includeGridData: true, // Inclut les métadonnées des cellules
            ranges: [`${SHEET_NAME}!A1:ZZ1000`],
        });

        const sheet = response.data.sheets[0];
        const gridData = sheet.data[0];
        console.log(
            `✅ Métadonnées récupérées pour ${gridData.rowData.length} lignes`,
        );

        return gridData;
    } catch (error) {
        console.error(
            '❌ Erreur lors de la récupération des métadonnées:',
            error.message,
        );
        throw error;
    }
}

/**
 * Extrait le nom du badge d'une formule =VLOOKUP
 * Exemple: =VLOOKUP("Knuckle Badge",Sprites!$A:$B,2,FALSE) -> "Knuckle Badge"
 */
function extractBadgeNameFromFormula(formula) {
    try {
        // Recherche le pattern =VLOOKUP("Nom Badge",...)
        const match = formula.match(/=VLOOKUP\("([^"]+)"/);
        if (match && match[1]) {
            return match[1];
        }
    } catch (error) {
        console.log(`⚠️  Erreur extraction nom badge: ${error.message}`);
    }
    return null;
}

/**
 * Convertit un nom de badge en nom de fichier image
 * Exemple: "Knuckle Badge" -> "knuckle-badge.png"
 */
function badgeNameToImagePath(badgeName) {
    return (
        badgeName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '') + '.png'
    );
}

/**
 * Compte le nombre de badges en détectant les formules =VLOOKUP dans les 8 cases de badges
 */
function countBadgesInAllRuns(rows, formulas) {
    let totalBadges = 0;
    let runCount = 0;
    const allRunsBadges = []; // Collecte les badges de tous les runs
    const seenRunNumbers = new Set(); // ⚡ DÉDUPLICATION : Évite de compter les mêmes runs plusieurs fois

    // Trouve toutes les lignes "Gym Badges"
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row) continue;

        const firstCell = String(row[1] || '').trim(); // Colonne B

        if (firstCell === 'Gym Badges' || firstCell.includes('Vital Spirit')) {
            runCount++;

            // ⚡ NOUVEAU SYSTÈME : Trouve le numéro original du sheet pour cette run
            // On cherche la ligne "Run #X" qui précède cette ligne "Gym Badges"
            let originalRunNumber = null;
            for (let j = Math.max(0, i - 20); j < i; j++) {
                const searchRow = rows[j];
                if (!searchRow) continue;

                // Cherche "Run #" dans n'importe quelle colonne
                for (let col = 0; col < searchRow.length; col++) {
                    const cell = String(searchRow[col] || '').trim();
                    if (cell.startsWith('Run #')) {
                        originalRunNumber =
                            parseInt(cell.replace('Run #', '')) || null;
                        break;
                    }
                }
                if (originalRunNumber !== null) break;
            }

            // Si on n'a pas trouvé le numéro original, on utilise le compteur comme fallback
            const runNumberForBadges =
                originalRunNumber !== null ? originalRunNumber : runCount;

            // ⚡ DÉDUPLICATION : Ignore les runs déjà vues (doublons dans le sheet)
            if (seenRunNumbers.has(runNumberForBadges)) {
                continue; // Skip cette run, elle a déjà été comptée
            }
            seenRunNumbers.add(runNumberForBadges);

            let runBadgeCount = 0;
            const runBadges = []; // Collecte les badges de ce run

            // Vérifie les formules =VLOOKUP dans les lignes en dessous de "Gym Badges"
            // Les badges sont dans les lignes suivantes, pas dans la ligne "Gym Badges" elle-même
            for (
                let badgeRow = i + 1;
                badgeRow < Math.min(i + 10, rows.length);
                badgeRow++
            ) {
                const badgeFormulaRow = formulas[badgeRow];
                if (badgeFormulaRow) {
                    let badgesInThisRow = 0;

                    // Vérifie les colonnes A à H (0 à 7) pour les 8 badges
                    for (
                        let col = 0;
                        col < Math.min(8, badgeFormulaRow.length);
                        col++
                    ) {
                        const formula = String(
                            badgeFormulaRow[col] || '',
                        ).trim();
                        if (
                            formula.startsWith('=VLOOKUP(') &&
                            formula.includes('Badge')
                        ) {
                            // Extrait le nom du badge de la formule
                            const badgeName =
                                extractBadgeNameFromFormula(formula);
                            if (badgeName) {
                                badgesInThisRow++;
                                runBadgeCount++;
                                totalBadges++;

                                // Crée l'objet badge avec nom et chemin image
                                const badge = {
                                    name: badgeName,
                                    imageName: badgeNameToImagePath(badgeName),
                                    position: {
                                        row: badgeRow + 1,
                                        col: col + 1,
                                    },
                                };
                                runBadges.push(badge);
                            }
                        }
                    }

                    // Si on trouve des badges dans cette ligne, on s'arrête (pas besoin de chercher plus loin)
                    if (badgesInThisRow > 0) {
                        break; // Sort de la boucle des lignes suivantes
                    }
                }
            }

            // Ajoute les badges de ce run à la collection globale
            // ⚡ Utilise le numéro original du sheet pour pouvoir matcher avec les runs parsées
            allRunsBadges.push({
                runNumber: runNumberForBadges,
                badges: runBadges,
            });
        }
    }

    return { totalBadges, runCount, allRunsBadges };
}

/**
 * Parse les données du Google Sheet en format Run
 * Structure : les Pokémon sont en colonnes (K, P, U, Z...) espacées de 5
 */
async function parseSheetData(rows, formulas, allRunsBadges = []) {
    const runs = [];
    const runsWithOriginalNumbers = []; // Stocke temporairement avec le numéro original

    // Les Pokémon commencent à la colonne 10 (K) et sont espacés de 5 colonnes
    const POKEMON_START_COL = 10; // Colonne K
    const POKEMON_SPACING = 5;

    // Trouve toutes les sections de run (cherche "Run #")
    // On garde l'ordre d'apparition dans le sheet (première trouvée = plus récente)
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        // Cherche "Run #" dans n'importe quelle colonne
        let runNumberCol = -1;
        let originalRunNumber = 0;

        for (let col = 0; col < row.length; col++) {
            const cell = String(row[col] || '').trim();
            if (cell.startsWith('Run #')) {
                runNumberCol = col;
                originalRunNumber = parseInt(cell.replace('Run #', '')) || 0;
                break;
            }
        }

        if (originalRunNumber > 0) {
            console.log(
                `  📝 Run #${originalRunNumber} détecté à la ligne ${i + 1}`,
            );

            // Parse ce run (les badges seront calculés depuis les formules à partir de la zone du run)
            // On passe le numéro original pour le parsing, mais on assignera un ID séquentiel après
            const run = await parseRun(rows, i, originalRunNumber, formulas);
            if (run) {
                runsWithOriginalNumbers.push({
                    run,
                    originalRunNumber,
                });
            }
        }
    }

    // ⚡ NOUVEAU SYSTÈME : Assignation d'IDs séquentiels selon l'ordre d'apparition
    // La première run trouvée (plus récente) = numéro le plus élevé
    // La dernière run trouvée (plus ancienne) = numéro 1
    const totalRuns = runsWithOriginalNumbers.length;
    runsWithOriginalNumbers.forEach(({ run }, index) => {
        // Index 0 = première trouvée = plus récente = numéro total
        // Index totalRuns-1 = dernière trouvée = plus ancienne = numéro 1
        const sequentialNumber = totalRuns - index;
        run.runNumber = sequentialNumber;
        run.id = String(sequentialNumber);
        // ⚡ Le numéro original est déjà stocké dans run.originalRunNumber par parseRun
        runs.push(run);
    });

    return runs;
}

/**
 * Parse un run spécifique à partir d'une ligne de départ
 */
async function parseRun(rows, startLine, runNumber, formulas) {
    // Cherche les lignes importantes
    let runIdRow = null;
    let abilitiesRow = null;
    let naturesRow = null;
    let ivHpRow = null;
    let ivAtkRow = null;
    let ivDefRow = null;
    let move1Row = null;
    let move2Row = null;
    let move3Row = null;
    let move4Row = null;
    let deadPokemonRow = null;
    let runStartRow = null;
    let runEndRow = null;
    let wonBattlesRow = null;
    let gymBadgesRow = null;
    let gymBadgesRowIndex = null;
    let personalBestRow = null;
    let personalBestRowIndex = null;

    // Scanne les 20 lignes suivantes pour trouver les infos
    let runIdRowIndex = null;
    for (let i = startLine; i < Math.min(startLine + 20, rows.length); i++) {
        const row = rows[i];
        if (!row) continue;

        const firstCell = String(row[1] || '').trim(); // Colonne B

        if (firstCell.startsWith('RundId')) {
            runIdRow = row;
            runIdRowIndex = i; // Sauvegarde l'index de la ligne
        } else if (
            firstCell === 'Gym Badges' ||
            firstCell.includes('Vital Spirit')
        ) {
            abilitiesRow = row;
            gymBadgesRow = row;
            gymBadgesRowIndex = i;
        } else if (firstCell === 'Dead Pokémon') {
            deadPokemonRow = row;
        } else if (firstCell === 'Run start') {
            runStartRow = row;
        } else if (firstCell === 'Run end') {
            runEndRow = row;
        } else if (firstCell === 'Won battles') {
            wonBattlesRow = row;
        } else if (firstCell.startsWith('Personal Best')) {
            personalBestRow = row;
            personalBestRowIndex = i;
        } else if (String(row[10] || '').trim() === 'HP') {
            ivHpRow = row;
            // La ligne juste au-dessus des IVs contient les natures
            if (i > 0) {
                naturesRow = rows[i - 1];
            }
        } else if (String(row[10] || '').trim() === 'Attack') {
            ivAtkRow = row;
        } else if (String(row[10] || '').trim() === 'Defense') {
            ivDefRow = row;
        }
    }

    if (!runIdRow || !abilitiesRow) {
        console.log(`  ⚠️  Run #${runNumber} incomplet, ignoré`);
        return null;
    }

    // Les moves sont entre la ligne abilities et la ligne des natures
    // Trouve l'index de chaque ligne
    let abilitiesIndex = -1;
    let naturesIndex = -1;
    for (let i = startLine; i < Math.min(startLine + 20, rows.length); i++) {
        if (rows[i] === abilitiesRow) abilitiesIndex = i;
        if (rows[i] === naturesRow) naturesIndex = i;
    }

    // Récupère toutes les lignes entre abilities et nature comme des lignes de moves
    const moveRows = [];
    if (
        abilitiesIndex !== -1 &&
        naturesIndex !== -1 &&
        naturesIndex > abilitiesIndex + 1
    ) {
        for (let i = abilitiesIndex + 1; i < naturesIndex; i++) {
            moveRows.push(rows[i]);
        }
    }

    // Assigne les 4 premières lignes comme move1, move2, move3, move4
    // Il devrait toujours y avoir 4 lignes de moves
    move1Row = moveRows[0] || null;
    move2Row = moveRows[1] || null;
    move3Row = moveRows[2] || null;
    move4Row = moveRows[3] || null;

    // Extrait le RunId
    const runIdMatch = String(runIdRow[1] || '').match(/RundId\s*:\s*(.+)/);
    const runId = runIdMatch ? runIdMatch[1].trim() : `run-${runNumber}`;

    // Extrait les informations de résumé
    const runStart =
        runStartRow && runStartRow[5]
            ? String(runStartRow[5]).trim()
            : undefined;
    const runEnd =
        runEndRow && runEndRow[5] ? String(runEndRow[5]).trim() : undefined;
    const wonBattles =
        wonBattlesRow && wonBattlesRow[5]
            ? String(wonBattlesRow[5]).trim()
            : undefined;
    const deadPokemonCount =
        deadPokemonRow && deadPokemonRow[5]
            ? String(deadPokemonRow[5]).trim()
            : undefined;

    // Extrait Personal Best (nom du dresseur vaincu)
    const personalBestMatch =
        personalBestRow && personalBestRow[1]
            ? String(personalBestRow[1]).match(/Personal Best\s*:\s*(.+)/)
            : null;
    const personalBest = personalBestMatch
        ? personalBestMatch[1].trim()
        : undefined;

    // Extrait le type de dresseur du Personal Best (ex: "Battle Girl Jocelyn" -> "battle girl")
    let trainerType = null;
    if (personalBest) {
        const words = personalBest.trim().split(' ');
        // Prend les 2 premiers mots (type de dresseur) et enlève le nom propre
        if (words.length >= 2) {
            // Si le dernier mot commence par une majuscule, c'est probablement le nom du trainer
            const lastName = words[words.length - 1];
            if (lastName && lastName[0] === lastName[0].toUpperCase()) {
                // Tous les mots sauf le dernier = type de trainer
                trainerType = words.slice(0, -1).join(' ').toLowerCase();
            } else {
                // Pas de nom, prend tout
                trainerType = personalBest.toLowerCase();
            }
        } else if (words.length === 1) {
            trainerType = words[0].toLowerCase();
        }
    }

    // Extrait Dead Pokémon pour le calcul
    let deadPokemon = 0;
    let totalPokemon = 0;
    if (deadPokemonCount) {
        const match = deadPokemonCount.match(/(\d+)\/(\d+)/);
        if (match) {
            deadPokemon = parseInt(match[1]) || 0;
            totalPokemon = parseInt(match[2]) || 0;
        }
    }

    // Parse les Pokémon (colonnes K, P, U, Z... = indices 10, 15, 20, 25...)
    const team = [];
    const locations = [];
    const locationsRow = rows[startLine]; // Ligne "Run #X" contient aussi les locations

    // Lit TOUTES les colonnes disponibles (pas de limite fixe)
    const maxCol = Math.max(
        runIdRow.length,
        abilitiesRow.length,
        naturesRow ? naturesRow.length : 0,
        locationsRow.length,
        ivHpRow ? ivHpRow.length : 0,
        ivAtkRow ? ivAtkRow.length : 0,
        ivDefRow ? ivDefRow.length : 0,
        move1Row ? move1Row.length : 0,
        move2Row ? move2Row.length : 0,
        move3Row ? move3Row.length : 0,
        move4Row ? move4Row.length : 0,
    );

    for (let col = 10; col < maxCol; col += 5) {
        const pokemonName = String(runIdRow[col] || '').trim();
        if (!pokemonName) continue;

        // Extrait le surnom et le nom anglais : "Franck (Monferno)" -> surnom="Franck", nom="Monferno"
        const match = pokemonName.match(/\(([^)]+)\)/);
        if (!match) continue;

        const englishName = match[1].trim();
        const nickname = pokemonName.split('(')[0].trim();

        // Talent (ligne abilities, colonne col)
        const ability = String(abilitiesRow[col] || 'Unknown').trim();

        // Nature (ligne natures, colonne col) - Garde en anglais
        let nature = undefined;
        if (naturesRow && naturesRow[col]) {
            nature = String(naturesRow[col]).trim() || undefined;
        }

        // Niveau (ligne abilities, colonne col+2)
        const levelStr = String(abilitiesRow[col + 2] || '').trim();
        const level = parseInt(levelStr.replace('Level ', '')) || 1;

        // Location (ligne Run #, colonne col)
        const location = String(locationsRow[col] || 'Unknown').trim();
        if (
            location &&
            location !== 'Unknown' &&
            !locations.includes(location)
        ) {
            locations.push(location);
        }

        // IVs
        const hp = parseInt(ivHpRow ? ivHpRow[col + 1] : 0) || 0;
        const attack = parseInt(ivAtkRow ? ivAtkRow[col + 1] : 0) || 0;
        const defense = parseInt(ivDefRow ? ivDefRow[col + 1] : 0) || 0;
        const spAttack = parseInt(ivHpRow ? ivHpRow[col + 3] : 0) || 0;
        const spDefense = parseInt(ivAtkRow ? ivAtkRow[col + 3] : 0) || 0;
        const speed = parseInt(ivDefRow ? ivDefRow[col + 3] : 0) || 0;
        const total = hp + attack + defense + spAttack + spDefense + speed;

        // Moves (récupère jusqu'à 4 attaques en grille 2x2)
        // Les moves sont organisés sur 2 lignes et 2 colonnes
        // moveRows[1] = ligne 2 (moves 1-2), moveRows[2] = ligne 3 (moves 3-4)
        const moves = [];

        // Ligne 2: Move 1 (col) et Move 2 (col+2)
        if (move2Row) {
            const move1 = String(move2Row[col] || '').trim();
            const move2 = String(move2Row[col + 2] || '').trim();
            if (move1) moves.push(move1);
            if (move2) moves.push(move2);
        }

        // Ligne 3: Move 3 (col) et Move 4 (col+2)
        if (move3Row) {
            const move3 = String(move3Row[col] || '').trim();
            const move4 = String(move3Row[col + 2] || '').trim();
            if (move3) moves.push(move3);
            if (move4) moves.push(move4);
        }

        // Récupère l'ID du Pokémon depuis les formules Google Sheets (comme pour showcasePokemon)
        let pokemonId = null;
        let sprite = null;

        // Cherche l'ID dans la formule de la case juste au-dessus du prénom du Pokémon
        // Le prénom est dans runIdRow[col], et l'ID se trouve dans les colonnes col, col+1, col+2, col+3
        // juste au-dessus du prénom (ligne runIdRowIndex - 1)
        if (
            Array.isArray(formulas) &&
            runIdRowIndex !== null &&
            runIdRowIndex > 0
        ) {
            const formulaRowIndex = runIdRowIndex - 1; // Ligne juste au-dessus
            const formulaRow = formulas[formulaRowIndex];

            // Cherche dans les colonnes col, col+1, col+2, col+3 (les 4 colonnes suivantes)
            const colsToCheck = [col, col + 1, col + 2, col + 3];

            for (const checkCol of colsToCheck) {
                if (formulaRow && formulaRow[checkCol]) {
                    const f = String(formulaRow[checkCol] || '').trim();

                    // Cherche un pattern comme =VLOOKUP(123 ou =VLOOKUP(123,
                    const mId = f.match(/=VLOOKUP\((\d+)/i);
                    if (mId && mId[1]) {
                        pokemonId = parseInt(mId[1], 10);
                        break; // On a trouvé l'ID, on peut arrêter
                    }
                }
            }
        }

        // Si on a trouvé l'ID, construit directement l'URL du sprite
        if (pokemonId && !Number.isNaN(pokemonId)) {
            // Pour les IDs <= 905, utilise directement l'ID
            if (pokemonId > 0 && pokemonId <= 905) {
                sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
            } else if (pokemonId > 905) {
                // Pour les IDs > 905 (formes alternatives), utilise le mapping ALT_FORM_ID_MAP
                const altFormEntry = ALT_FORM_ID_MAP[pokemonId];
                if (altFormEntry && altFormEntry.apiId) {
                    sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${altFormEntry.apiId}.png`;
                }
            }
        }

        // Fallback: récupère le sprite depuis PokéAPI par nom si l'ID n'a pas été trouvé
        if (!sprite) {
            try {
                // Utilise l'API PokéAPI pour récupérer l'ID par nom
                let pokemonName = englishName.toLowerCase();

                // Pour les formes régionales (Hisui, Galar), PokéAPI utilise le nom avec tiret
                if (
                    pokemonName.includes('-hisui') ||
                    pokemonName.includes('-galar') ||
                    pokemonName.includes('-alola')
                ) {
                    // Garde le nom avec tiret pour les formes régionales
                    pokemonName = pokemonName;
                } else {
                    // Pour les autres Pokémon, enlève les tirets
                    pokemonName = pokemonName.replace(/-/g, '');
                }

                const response = await fetch(
                    `https://pokeapi.co/api/v2/pokemon/${pokemonName}`,
                );

                if (response.ok) {
                    const data = await response.json();
                    const apiPokemonId = data.id;
                    sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${apiPokemonId}.png`;
                }
            } catch {
                // Erreur silencieuse lors de la récupération du sprite
            }
        }

        // Vérifie si le Pokémon est mort (emoji 💀 dans la même ligne que le nom)
        let isDead = false;

        // Cherche dans toutes les lignes pour trouver le nom du Pokémon
        for (let lineIndex = 0; lineIndex < rows.length; lineIndex++) {
            const row = rows[lineIndex];
            if (!row) continue;

            // Cherche le nom du Pokémon dans cette ligne
            for (let i = 0; i < row.length; i++) {
                if (row[i] && row[i].includes(nickname)) {
                    // Vérifie les cases suivantes dans la même ligne pour l'emoji 💀
                    for (
                        let j = i + 1;
                        j <= Math.min(i + 5, row.length - 1);
                        j++
                    ) {
                        if (row[j] && row[j].includes('💀')) {
                            isDead = true;
                            break;
                        }
                    }
                    if (isDead) break;
                }
            }
            if (isDead) break;
        }

        team.push({
            nameFr: nickname, // Utilise le surnom au lieu du nom français
            nameEn: englishName,
            ability,
            nature: nature && nature !== '' ? nature : undefined,
            moves: moves.length > 0 ? moves : undefined,
            level,
            location,
            encounterOrder: team.length + 1,
            ivs: { hp, attack, defense, spAttack, spDefense, speed, total },
            isDead,
            sprite,
        });
    }

    // Calcule les badges pour ce run en scannant sous la ligne "Gym Badges"
    const runBadges = [];
    if (gymBadgesRowIndex !== null && Array.isArray(formulas)) {
        for (
            let badgeRow = gymBadgesRowIndex + 1;
            badgeRow < Math.min(gymBadgesRowIndex + 10, rows.length);
            badgeRow++
        ) {
            const badgeFormulaRow = formulas[badgeRow];
            if (!badgeFormulaRow) continue;
            let foundInRow = 0;
            for (
                let col = 0;
                col < Math.min(8, badgeFormulaRow.length);
                col++
            ) {
                const formula = String(badgeFormulaRow[col] || '').trim();
                if (
                    formula.startsWith('=VLOOKUP(') &&
                    formula.includes('Badge')
                ) {
                    const badgeName = extractBadgeNameFromFormula(formula);
                    if (badgeName) {
                        runBadges.push({
                            name: badgeName,
                            imageName: badgeNameToImagePath(badgeName),
                            position: { row: badgeRow + 1, col: col + 1 },
                        });
                        foundInRow++;
                    }
                }
            }
            if (foundInRow > 0) break;
        }
    }

    // Ligne sous Personal Best: dresseur + pokémon vitrine
    let trainerSprite = null;
    let showcasePokemon = [];
    if (personalBestRowIndex !== null) {
        const showcaseRow = personalBestRowIndex + 1;
        const formulaRow = formulas[showcaseRow] || [];
        // 1) Trainer: premier =VLOOKUP("...") rencontré -> imageName
        for (let col = 0; col < Math.min(20, formulaRow.length); col++) {
            const f = String(formulaRow[col] || '').trim();
            if (f.startsWith('=VLOOKUP(')) {
                const m = f.match(/=VLOOKUP\("([^"]+)"/);
                if (m && m[1]) {
                    const label = m[1];
                    const filename = trainerLabelToFilename(label);
                    trainerSprite = `/assets/trainer/${filename}`;
                    break;
                }
            }
        }
        // 2) Pokémons affichés sur les lignes sous le dresseur (colonnes F,G,H)
        // On lit UNIQUEMENT les formules et on récupère l'ID numérique après VLOOKUP(
        showcasePokemon = [];
        // Scanne jusqu'à 4 lignes (la ligne sous Personal Best et 3 lignes suivantes)
        const rowsToScan = [
            showcaseRow,
            showcaseRow + 1,
            showcaseRow + 2,
            showcaseRow + 3,
        ];
        for (const rIdx of rowsToScan) {
            const formulaRow2 = formulas[rIdx] || [];
            // F,G,H → indices 5,6,7
            for (let c = 5; c <= 7; c++) {
                const f = String(formulaRow2[c] || '').trim();
                const mId = f.match(/=VLOOKUP\((\d+)/i);
                if (mId && mId[1]) {
                    showcasePokemon.push(mId[1]); // store id as string
                }
                if (showcasePokemon.length >= 6) break;
            }
            if (showcasePokemon.length >= 6) break;
        }
    }

    // Détermine le starter (premier Pokémon) - utilise le nom anglais
    const starter = team.length > 0 ? team[0].nameEn : 'Unknown';

    // Sprite du dresseur générique (utilise les sprites de protagonistes Pokémon)
    // Les sprites de trainers spécifiques ne sont pas disponibles publiquement
    const trainerSprites = [
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png', // Pikachu
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png', // Evoli
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', // Dracaufeu
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png', // Ectoplasma
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png', // Lucario
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png', // Ronflex
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png', // Rayquaza
    ];

    if (!trainerSprite) {
        trainerSprite = trainerSprites[(runNumber - 1) % trainerSprites.length];
    }

    console.log(`    🎭 Run #${runNumber} -> Sprite trainer: ${trainerSprite}`);

    // Build sprite URLs for numeric IDs (<=905)
    const showcasePokemonSprites = (showcasePokemon || [])
        .map((entry) => {
            const id = parseInt(String(entry).trim(), 10);
            if (!Number.isNaN(id) && id > 0 && id <= 905) {
                return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
            }
            return '';
        })
        .filter(Boolean);

    return {
        id: String(runNumber), // Sera remplacé par l'ID séquentiel dans parseSheetData
        runNumber, // Sera remplacé par l'ID séquentiel dans parseSheetData
        originalRunNumber: runNumber, // ⚡ Garde le numéro original du sheet pour référence
        runId,
        starter,
        gymBadges: runBadges.length, // Nombre de badges obtenus
        totalBadges: 8,
        badges: runBadges, // Liste des badges avec images
        deadPokemon,
        totalPokemon: totalPokemon || team.length,
        team,
        locations,
        // Informations de résumé
        runStart,
        runEnd,
        wonBattles,
        personalBest,
        trainerSprite,
        showcasePokemon,
        showcasePokemonSprites,
    };
}

function trainerLabelToFilename(label) {
    // Normalize: lowercase, remove 'trainerpic' token, replace spaces/hyphens with underscores
    let s = String(label || '').toLowerCase();
    s = s.replace(/trainer_pic[_\-\s]?/g, '');
    s = s.replace(/[\s\-]+/g, '_');
    // Keep only a-z0-9 and underscores
    s = s.replace(/[^a-z0-9_]/g, '');
    // collapse multiple underscores
    s = s.replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    return `${s}.png`;
}

/**
 * Génère le fichier TypeScript
 */
function generateRunsFile(runs) {
    let content = `import { Run } from '@/types/run';
import { getPokemonSprite } from '@/utils/pokemon';

// 🔄 Ce fichier est généré automatiquement depuis Google Sheets
// Ne pas modifier manuellement - vos modifications seront écrasées !
// Dernière synchronisation : ${new Date().toLocaleString('fr-FR')}
// Source : https://docs.google.com/spreadsheets/d/${SHEET_ID}

export const runs: Run[] = [\n`;

    runs.forEach((run) => {
        content += `    {\n`;
        content += `        id: '${run.id}',\n`;
        content += `        runNumber: ${run.runNumber},\n`;
        content += `        runId: '${run.runId}',\n`;
        content += `        starter: '${run.starter}',\n`;
        content += `        gymBadges: ${run.gymBadges},\n`;
        content += `        totalBadges: ${run.totalBadges},\n`;
        content += `        deadPokemon: ${run.deadPokemon},\n`;
        content += `        totalPokemon: ${run.totalPokemon},\n`;
        if (run.badges && run.badges.length > 0) {
            content += `        badges: [\n`;
            run.badges.forEach((b) => {
                content += `            { name: '${b.name}', imageName: '${
                    b.imageName || b.imagePath || ''
                }', position: { row: ${b.position?.row || 0}, col: ${
                    b.position?.col || 0
                } } },\n`;
            });
            content += `        ],\n`;
        } else {
            content += `        badges: [],\n`;
        }
        content += `        team: [\n`;

        run.team.forEach((pokemon) => {
            content += `            {\n`;
            content += `                nameFr: '${pokemon.nameFr}',\n`;
            content += `                nameEn: '${pokemon.nameEn}',\n`;
            content += `                ability: '${pokemon.ability}',\n`;
            if (pokemon.nature) {
                content += `                nature: '${pokemon.nature}',\n`;
            }
            if (pokemon.moves && pokemon.moves.length > 0) {
                content += `                moves: [${pokemon.moves
                    .map((m) => `'${m}'`)
                    .join(', ')}],\n`;
            }
            content += `                level: ${pokemon.level},\n`;
            if (pokemon.sprite) {
                content += `                sprite: '${pokemon.sprite}',\n`;
            } else {
                content += `                sprite: getPokemonSprite('${pokemon.nameEn}'),\n`;
            }
            content += `                location: '${pokemon.location}',\n`;
            content += `                encounterOrder: ${pokemon.encounterOrder},\n`;
            content += `                ivs: {\n`;
            content += `                    hp: ${pokemon.ivs.hp},\n`;
            content += `                    attack: ${pokemon.ivs.attack},\n`;
            content += `                    defense: ${pokemon.ivs.defense},\n`;
            content += `                    spAttack: ${pokemon.ivs.spAttack},\n`;
            content += `                    spDefense: ${pokemon.ivs.spDefense},\n`;
            content += `                    speed: ${pokemon.ivs.speed},\n`;
            content += `                    total: ${pokemon.ivs.total},\n`;
            content += `                },\n`;
            if (pokemon.isDead) {
                content += `                isDead: true,\n`;
            }
            content += `            },\n`;
        });

        content += `        ],\n`;
        content += `        locations: [${run.locations
            .map((l) => `'${l}'`)
            .join(', ')}],\n`;

        // Informations de résumé
        if (run.runStart) {
            content += `        runStart: '${run.runStart}',\n`;
        }
        if (run.runEnd) {
            content += `        runEnd: '${run.runEnd}',\n`;
        }
        if (run.wonBattles) {
            content += `        wonBattles: '${run.wonBattles}',\n`;
        }
        if (run.personalBest) {
            content += `        personalBest: '${run.personalBest}',\n`;
        }
        if (run.trainerSprite) {
            content += `        trainerSprite: '${run.trainerSprite}',\n`;
        }
        if (run.showcasePokemon && run.showcasePokemon.length > 0) {
            content += `        showcasePokemon: [${run.showcasePokemon
                .map((p) => `'${p}'`)
                .join(', ')}],\n`;
        }
        if (
            run.showcasePokemonSprites &&
            run.showcasePokemonSprites.length > 0
        ) {
            content += `        showcasePokemonSprites: [${run.showcasePokemonSprites
                .map((u) => `'${u}'`)
                .join(', ')}],\n`;
        }

        content += `    },\n`;
    });

    content += `];\n`;

    return content;
}

/**
 * Fonction optimisée qui vérifie seulement si la première run a obtenu un runEnd
 * et l'ajoute aux statiques si nécessaire (sans parser toutes les runs)
 * ⚡ OPTIMISATION : Beaucoup plus rapide que fetchAndConvert() pour les vérifications périodiques
 *
 * NOTE: Cette fonction n'est plus utilisée par défaut (pas de watcher)
 * Elle peut être utile pour des scripts personnalisés si nécessaire
 */
async function checkAndUpdateFirstRun() {
    try {
        if (!API_KEY) {
            throw new Error('Clé API Google Sheets non configurée');
        }

        // Lit le fichier statique actuel pour connaître le dernier runNumber
        let maxStaticRunNumber = 0;
        try {
            const staticContent = fs.readFileSync(OUTPUT_FILE, 'utf-8');
            // Extrait le numéro de la première run (la plus récente) dans les statiques
            const runNumberMatch = staticContent.match(/runNumber:\s*(\d+)/);
            if (runNumberMatch) {
                // Parse toutes les runs pour trouver le max
                const allRunMatches =
                    staticContent.matchAll(/runNumber:\s*(\d+)/g);
                for (const match of allRunMatches) {
                    const num = parseInt(match[1]);
                    if (num > maxStaticRunNumber) {
                        maxStaticRunNumber = num;
                    }
                }
            }
        } catch {
            // Si le fichier n'existe pas, on continue
            console.log('   ℹ️  Aucun fichier statique existant');
        }

        // Récupère seulement la première run depuis Google Sheets
        console.log(
            '🔄 Vérification de la première run depuis Google Sheets...',
        );
        const firstRun = await getFirstRun();

        if (!firstRun) {
            console.log('   ℹ️  Aucune première run trouvée');
            return false;
        }

        // Vérifie si la première run a un runEnd et si elle n'est pas déjà dans les statiques
        if (firstRun.runEnd && firstRun.runNumber > maxStaticRunNumber) {
            console.log(
                `\n🎯 La première run (Run #${firstRun.runNumber}) a un runEnd et n'est pas encore dans les statiques !`,
            );
            console.log('   ⚡ Mise à jour des statiques...\n');

            // Parse toutes les runs et met à jour les statiques
            // (nécessaire pour générer le fichier complet)
            return await fetchAndConvert();
        } else if (
            firstRun.runEnd &&
            firstRun.runNumber <= maxStaticRunNumber
        ) {
            console.log(
                `   ✅ La première run (Run #${firstRun.runNumber}) est déjà dans les statiques`,
            );
            return false; // Pas besoin de mettre à jour
        } else {
            console.log(
                `   ℹ️  La première run (Run #${firstRun.runNumber}) est encore en cours (pas de runEnd)`,
            );
            return false; // Pas besoin de mettre à jour
        }
    } catch (error) {
        console.error(
            '❌ Erreur lors de la vérification de la première run:',
            error.message,
        );
        return false;
    }
}

/**
 * Fonction principale - Parse toutes les runs et génère le fichier statique
 */
async function fetchAndConvert() {
    try {
        // Vérifie la configuration
        if (!API_KEY) {
            console.error('❌ Clé API Google Sheets non configurée !');
            console.log('📝 Créez un fichier .env avec votre clé API');
            return false;
        }

        // ⚡ OPTIMISATION : Parallélise les 2 appels API pour réduire le temps total
        // On réutilise aussi le même client Google Sheets
        console.log('🔄 Connexion à Google Sheets...');
        const sheets = await getGoogleSheetsClient();
        console.log('🔄 Récupération des données et formules en parallèle...');
        const [rows, formulas] = await Promise.all([
            fetchSheetData(sheets),
            fetchSheetFormulas(sheets),
        ]);

        // Compte les badges en détectant les formules =VLOOKUP
        const { totalBadges, runCount, allRunsBadges } = countBadgesInAllRuns(
            rows,
            formulas,
        );

        // Logs des badges supprimés

        // Parse les données
        console.log('🔍 Analyse des données...');
        const allRuns = await parseSheetData(rows, formulas, allRunsBadges);
        console.log(`✅ ${allRuns.length} run(s) trouvé(s)`);

        // ⚡ FILTRAGE : Ne garde que les runs terminées (avec runEnd) pour le cache statique
        // Les runs sans runEnd seront chargées dynamiquement depuis Google Sheets par l'API
        // Ce fichier est généré une fois au build, puis les nouvelles runs terminées seront
        // ajoutées automatiquement au cache en mémoire par l'API (pas d'écriture de fichiers)
        const runsWithEnd = allRuns.filter((run) => run.runEnd);
        const runsWithoutEnd = allRuns.filter((run) => !run.runEnd);

        // Trie les runs par numéro pour identifier la première (la plus récente)
        allRuns.sort((a, b) => b.runNumber - a.runNumber);
        const firstRunNumber = allRuns.length > 0 ? allRuns[0].runNumber : null;

        // Logs informatifs
        allRuns.forEach((run) => {
            const isFirst = run.runNumber === firstRunNumber;
            const status = run.runEnd
                ? `(terminée le ${run.runEnd})`
                : isFirst
                ? '(en cours - première run)'
                : '(en cours)';
            console.log(
                `   → Run #${run.runNumber}: ${run.team.length} Pokémon ${status}`,
            );
        });

        if (runsWithoutEnd.length > 0) {
            console.log(
                `\n⚠️  ${runsWithoutEnd.length} run(s) en cours (sans runEnd) ne seront pas dans le cache statique:`,
            );
            runsWithoutEnd.forEach((run) => {
                const isFirst = run.runNumber === firstRunNumber;
                console.log(
                    `   → Run #${run.runNumber} ${
                        isFirst
                            ? "(PREMIÈRE RUN - sera chargée en live par l'API)"
                            : '(en cours, pas de runEnd)'
                    }`,
                );
            });
            console.log(
                "   Ces runs seront chargées dynamiquement depuis Google Sheets par l'API.\n",
            );
        }

        if (runsWithEnd.length === 0) {
            console.warn(
                '⚠️  Aucune run terminée trouvée. Le cache statique sera vide.',
            );
        } else {
            console.log(
                `\n✅ ${runsWithEnd.length} run(s) terminée(s) seront dans le cache statique (data/runs.ts):`,
            );
            runsWithEnd.forEach((run) => {
                console.log(
                    `   → Run #${run.runNumber} (terminée le ${run.runEnd})`,
                );
            });
            console.log(
                "\n📝 Note: Les nouvelles runs terminées seront automatiquement ajoutées au cache en mémoire par l'API",
            );
            console.log(
                '   (pas besoin de régénérer ce fichier, compatible Vercel read-only filesystem)\n',
            );
        }

        // Génère le fichier TypeScript avec uniquement les runs terminées (cache par défaut)
        const tsContent = generateRunsFile(runsWithEnd);

        // Écrit le fichier
        fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf-8');
        console.log(`✅ Fichier généré : ${OUTPUT_FILE}`);
        console.log(
            `🕐 ${new Date().toLocaleTimeString()} - Synchronisation terminée\n`,
        );

        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la synchronisation :', error.message);
        return false;
    }
}

/**
 * Fonction qui retourne les données des runs sans écrire de fichier
 * Utile pour les API routes qui chargent les données dynamiquement
 */
async function getRunsData() {
    try {
        // Vérifie la configuration
        if (!API_KEY) {
            throw new Error('Clé API Google Sheets non configurée');
        }

        // ⚡ OPTIMISATION : Parallélise les 2 appels API pour réduire le temps total
        // Au lieu d'attendre séquentiellement (10s + 10s = 20s),
        // on fait les 2 appels en parallèle (max(10s, 10s) = 10s)
        // On réutilise aussi le même client Google Sheets
        console.log('🔄 Connexion à Google Sheets...');
        const sheets = await getGoogleSheetsClient();
        console.log('🔄 Récupération des données et formules en parallèle...');
        const [rows, formulas] = await Promise.all([
            fetchSheetData(sheets),
            fetchSheetFormulas(sheets),
        ]);

        // Compte les badges en détectant les formules =VLOOKUP
        const { totalBadges, runCount, allRunsBadges } = countBadgesInAllRuns(
            rows,
            formulas,
        );

        // Parse les données
        const runs = await parseSheetData(rows, formulas, allRunsBadges);

        return runs;
    } catch (error) {
        console.error(
            '❌ Erreur lors de la récupération des données:',
            error.message,
        );
        throw error;
    }
}

/**
 * Récupère une plage limitée de données depuis Google Sheets (optimisé pour getRunsList)
 * Ne récupère que les colonnes nécessaires (A-F pour trouver Run # et Run end)
 */
async function fetchRunsListData(sheetsClient = null) {
    const totalStart = Date.now();
    try {
        let clientStart = Date.now();
        const sheets = sheetsClient || (await getGoogleSheetsClient());
        const clientTime = Date.now() - clientStart;
        if (clientTime > 10) {
            console.log(
                `[⏱️  fetchRunsListData] Client Google Sheets: ${clientTime}ms`,
            );
        }

        // ⚡ OPTIMISATION : Ne récupère que les colonnes A-F (6 colonnes) au lieu de ZZ (702 colonnes)
        // Les colonnes A-F contiennent "Run #", "Run end", etc.
        const apiStart = Date.now();
        const response = await measureFirstConnection(() =>
            sheets.spreadsheets.values.get({
                spreadsheetId: SHEET_ID,
                range: `${SHEET_NAME}!A1:F1000`, // Seulement 6 colonnes au lieu de 702
            }),
        );
        const apiTime = Date.now() - apiStart;
        const totalTime = Date.now() - totalStart;
        const rows = response.data.values || [];
        console.log(
            `[⏱️  fetchRunsListData] Total: ${totalTime}ms (Client: ${clientTime}ms, API: ${apiTime}ms) | ${rows.length} lignes`,
        );

        return rows;
    } catch (error) {
        const totalTime = Date.now() - totalStart;
        console.error(
            `[❌ fetchRunsListData] Erreur après ${totalTime}ms:`,
            error.message,
        );
        throw error;
    }
}

/**
 * Fonction qui retourne uniquement la liste des runs avec métadonnées minimales
 * Plus rapide car elle ne parse pas tous les détails et n'utilise qu'une plage limitée
 */
async function getRunsList() {
    const totalStart = Date.now();
    try {
        if (!API_KEY) {
            throw new Error('Clé API Google Sheets non configurée');
        }

        // ⚡ OPTIMISATION : Récupère seulement les colonnes A-F (6 colonnes) au lieu de toutes les colonnes
        const fetchStart = Date.now();
        const rows = await fetchRunsListData();
        const fetchTime = Date.now() - fetchStart;

        const parseStart = Date.now();
        const runsList = [];

        // Trouve toutes les sections de run (cherche "Run #")
        // On garde l'ordre d'apparition dans le sheet (première trouvée = plus récente)
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            // Cherche "Run #" dans n'importe quelle colonne
            let originalRunNumber = 0;
            for (let col = 0; col < row.length; col++) {
                const cell = String(row[col] || '').trim();
                if (cell.startsWith('Run #')) {
                    originalRunNumber =
                        parseInt(cell.replace('Run #', '')) || 0;
                    break;
                }
            }

            if (originalRunNumber > 0) {
                // Cherche les métadonnées basiques dans les lignes suivantes
                let runId = '';
                let starter = '';
                let wonBattles = '';
                let personalBest = '';
                let runStart = '';
                let runEnd = '';
                let gymBadges = 0;

                // Scanne les 20 lignes suivantes pour trouver les infos basiques
                for (let j = i; j < Math.min(i + 20, rows.length); j++) {
                    const searchRow = rows[j];
                    if (!searchRow) continue;

                    const firstCell = String(searchRow[1] || '').trim(); // Colonne B

                    if (firstCell.startsWith('RundId')) {
                        runId = String(searchRow[2] || '').trim();
                    } else if (firstCell === 'Starter') {
                        starter = String(searchRow[2] || '').trim();
                    } else if (firstCell === 'Gym Badges') {
                        // Compte les badges dans cette ligne (colonnes A-H)
                        for (let col = 0; col < 8; col++) {
                            const badge = String(searchRow[col] || '').trim();
                            if (badge && badge !== 'Gym Badges') {
                                gymBadges++;
                            }
                        }
                    } else if (firstCell === 'Run start') {
                        // runStart est dans la colonne 5 (F)
                        runStart = searchRow[5]
                            ? String(searchRow[5]).trim()
                            : '';
                    } else if (firstCell === 'Run end') {
                        // runEnd est dans la colonne 5 (F)
                        runEnd = searchRow[5]
                            ? String(searchRow[5]).trim()
                            : '';
                    } else if (
                        firstCell === 'Won battles' ||
                        firstCell.includes('Battles Won')
                    ) {
                        // wonBattles est dans la colonne 5 (F), pas la colonne 2
                        wonBattles = searchRow[5]
                            ? String(searchRow[5]).trim()
                            : '';
                    } else if (firstCell.includes('Personal Best')) {
                        // Personal Best peut être dans la colonne 1 ou 2 selon le format
                        // Essaye d'extraire depuis la colonne 1 (format "Personal Best : X")
                        const pbMatch = firstCell.match(
                            /Personal Best\s*:\s*(.+)/,
                        );
                        personalBest = pbMatch
                            ? pbMatch[1].trim()
                            : searchRow[2]
                            ? String(searchRow[2]).trim()
                            : '';
                    }
                }

                runsList.push({
                    originalRunNumber, // Garde le numéro original du sheet pour référence
                    runId,
                    starter,
                    gymBadges,
                    wonBattles: wonBattles || undefined,
                    personalBest: personalBest || undefined,
                    runStart: runStart || undefined,
                    runEnd: runEnd || undefined,
                    startLine: i, // ⚡ Ajoute la ligne de départ pour optimiser getRunByNumber
                    // id et runNumber seront assignés après
                });
            }
        }

        // ⚡ NOUVEAU SYSTÈME : Assignation d'IDs séquentiels selon l'ordre d'apparition
        // La première run trouvée (plus récente) = numéro le plus élevé
        // La dernière run trouvée (plus ancienne) = numéro 1
        const totalRuns = runsList.length;
        const sortStart = Date.now();
        runsList.forEach((run, index) => {
            // Index 0 = première trouvée = plus récente = numéro total
            // Index totalRuns-1 = dernière trouvée = plus ancienne = numéro 1
            const sequentialNumber = totalRuns - index;
            run.runNumber = sequentialNumber;
            run.id = String(sequentialNumber);
        });
        const sortTime = Date.now() - sortStart;

        const parseTime = Date.now() - parseStart;
        const totalTime = Date.now() - totalStart;
        console.log(
            `[⏱️  getRunsList] Total: ${totalTime}ms (Fetch: ${fetchTime}ms, Parse: ${parseTime}ms, Sort: ${sortTime}ms) | ${runsList.length} runs`,
        );

        return runsList;
    } catch (error) {
        const totalTime = Date.now() - totalStart;
        console.error(
            `[❌ getRunsList] Erreur après ${totalTime}ms:`,
            error.message,
        );
        throw error;
    }
}

/**
 * Récupère une plage limitée de données pour une run spécifique (optimisé)
 * Ne charge que les lignes nécessaires autour de la run (~50 lignes au lieu de 1000)
 */
async function fetchRunRange(startLine, sheetsClient = null) {
    const totalStart = Date.now();
    try {
        let clientStart = Date.now();
        const sheets = sheetsClient || (await getGoogleSheetsClient());
        const clientTime = Date.now() - clientStart;
        if (clientTime > 10) {
            console.log(
                `[⏱️  fetchRunRange] Client Google Sheets: ${clientTime}ms`,
            );
        }

        // Charge environ 50 lignes autour de la run
        // ⚡ OPTIMISATION : Limite les colonnes à GR (200) au lieu de ZZ (702)
        // Les Pokémon commencent à la colonne K (10) et sont espacés de 5 colonnes
        // Colonne GR (200) = 10 + (38 Pokémon × 5) = suffisant pour une run complète
        // startLine est 0-based (index dans le tableau), mais l'API Google Sheets utilise 1-based (numéro de ligne)
        const startRow = Math.max(1, startLine + 1); // Conversion 0-based -> 1-based
        const endRow = startLine + 55; // +55 lignes au total (suffisant pour une run complète)
        const maxCol = 'GR'; // Colonne 200 au lieu de ZZ (702) - réduit les données de ~71%

        // ⚡ OPTIMISATION : Les formules ne sont nécessaires que pour les badges (colonnes A-H) et showcase (F-H)
        // On charge les formules pour toutes les lignes mais seulement les colonnes A-H (8 colonnes au lieu de 200)
        const formulasRange = `A${startRow}:H${endRow}`; // Colonnes A-H seulement pour les badges/showcase

        const apiStart = Date.now();
        const [rows, formulas] = await measureFirstConnection(() =>
            Promise.all([
                sheets.spreadsheets.values.get({
                    spreadsheetId: SHEET_ID,
                    range: `${SHEET_NAME}!A${startRow}:${maxCol}${endRow}`,
                }),
                sheets.spreadsheets.values.get({
                    spreadsheetId: SHEET_ID,
                    range: `${SHEET_NAME}!${formulasRange}`,
                    valueRenderOption: 'FORMULA',
                }),
            ]),
        );
        const apiTime = Date.now() - apiStart;

        const adjustedRows = rows.data.values || [];
        const formulasData = formulas.data.values || [];

        // ⚡ Les formules sont seulement pour les colonnes A-H, on doit les étendre pour correspondre aux rows
        // On crée un tableau de formules avec la même structure que rows (mais seulement A-H seront remplis)
        const adjustedFormulas = adjustedRows.map((row, rowIdx) => {
            const formulaRow = formulasData[rowIdx] || [];
            // Crée un tableau de 200 colonnes (GR) avec les formules A-H aux bonnes positions
            const extendedRow = new Array(200).fill('');
            for (let i = 0; i < Math.min(8, formulaRow.length); i++) {
                extendedRow[i] = formulaRow[i] || '';
            }
            return extendedRow;
        });

        // adjustedStartLine = 0 car les données récupérées commencent à startRow
        // donc l'index 0 correspond à la ligne startRow du sheet

        // Calcule le nombre réel de colonnes chargées
        const maxColsLoaded = Math.max(
            ...adjustedRows.map((row) => (row ? row.length : 0)),
            0,
        );

        const totalTime = Date.now() - totalStart;
        console.log(
            `[⏱️  fetchRunRange] Total: ${totalTime}ms (Client: ${clientTime}ms, API: ${apiTime}ms) | Lignes ${startRow}-${endRow} (${adjustedRows.length} lignes) | Colonnes A-${maxCol} (${maxColsLoaded} colonnes) | Formules A-H seulement`,
        );

        return {
            rows: adjustedRows,
            formulas: adjustedFormulas,
            adjustedStartLine: 0,
        };
    } catch (error) {
        const totalTime = Date.now() - totalStart;
        console.error(
            `[❌ fetchRunRange] Erreur après ${totalTime}ms:`,
            error.message,
        );
        throw error;
    }
}

/**
 * Récupère une plage qui couvre plusieurs runs (optimisé pour parser plusieurs runs d'un coup)
 * Calcule la plage minimale qui couvre toutes les runs demandées
 */
async function fetchMultipleRunsRange(runsWithStartLines, sheetsClient = null) {
    const totalStart = Date.now();
    try {
        let clientStart = Date.now();
        const sheets = sheetsClient || (await getGoogleSheetsClient());
        const clientTime = Date.now() - clientStart;
        if (clientTime > 10) {
            console.log(
                `[⏱️  fetchMultipleRunsRange] Client Google Sheets: ${clientTime}ms`,
            );
        }

        // Trouve la plage minimale qui couvre toutes les runs
        const calcStart = Date.now();
        const startLines = runsWithStartLines.map((r) => r.startLine);
        const minStartLine = Math.min(...startLines);
        const maxStartLine = Math.max(...startLines);

        // Charge de la première run jusqu'à la fin de la dernière run
        // ⚡ OPTIMISATION : Limite les colonnes à GR (200) au lieu de ZZ (702)
        // Chaque run fait environ 50 lignes, on ajoute une marge
        const startRow = Math.max(1, minStartLine + 1); // Conversion 0-based -> 1-based
        const endRow = maxStartLine + 55; // +55 lignes pour la dernière run
        const maxCol = 'GR'; // Colonne 200 au lieu de ZZ (702) - réduit les données de ~71%

        // ⚡ OPTIMISATION : Les formules ne sont nécessaires que pour les badges (colonnes A-H) et showcase (F-H)
        // On charge les formules pour toutes les lignes mais seulement les colonnes A-H (8 colonnes au lieu de 200)
        const formulasRange = `A${startRow}:H${endRow}`; // Colonnes A-H seulement pour les badges/showcase

        const calcTime = Date.now() - calcStart;

        const apiStart = Date.now();
        const [rows, formulas] = await measureFirstConnection(() =>
            Promise.all([
                sheets.spreadsheets.values.get({
                    spreadsheetId: SHEET_ID,
                    range: `${SHEET_NAME}!A${startRow}:${maxCol}${endRow}`,
                }),
                sheets.spreadsheets.values.get({
                    spreadsheetId: SHEET_ID,
                    range: `${SHEET_NAME}!${formulasRange}`,
                    valueRenderOption: 'FORMULA',
                }),
            ]),
        );
        const apiTime = Date.now() - apiStart;

        const adjustedRows = rows.data.values || [];
        const formulasData = formulas.data.values || [];

        // ⚡ Les formules sont seulement pour les colonnes A-H, on doit les étendre pour correspondre aux rows
        // On crée un tableau de formules avec la même structure que rows (mais seulement A-H seront remplis)
        const adjustedFormulas = adjustedRows.map((row, rowIdx) => {
            const formulaRow = formulasData[rowIdx] || [];
            // Crée un tableau de 200 colonnes (GR) avec les formules A-H aux bonnes positions
            const extendedRow = new Array(200).fill('');
            for (let i = 0; i < Math.min(8, formulaRow.length); i++) {
                extendedRow[i] = formulaRow[i] || '';
            }
            return extendedRow;
        });

        // Calcule le nombre réel de colonnes chargées
        const maxColsLoaded = Math.max(
            ...adjustedRows.map((row) => (row ? row.length : 0)),
            0,
        );

        // Calcule les startLines ajustés pour chaque run dans la plage récupérée
        const adjustStart = Date.now();
        const adjustedRuns = runsWithStartLines.map((run) => ({
            ...run,
            adjustedStartLine: run.startLine - minStartLine, // Ajuste relativement au début de la plage
        }));
        const adjustTime = Date.now() - adjustStart;

        const totalTime = Date.now() - totalStart;
        console.log(
            `[⏱️  fetchMultipleRunsRange] Total: ${totalTime}ms (Client: ${clientTime}ms, Calc: ${calcTime}ms, API: ${apiTime}ms, Adjust: ${adjustTime}ms) | ${runsWithStartLines.length} runs | Lignes ${startRow}-${endRow} (${adjustedRows.length} lignes) | Colonnes A-${maxCol} (${maxColsLoaded} colonnes) | Formules A-H seulement`,
        );

        return {
            rows: adjustedRows,
            formulas: adjustedFormulas,
            runs: adjustedRuns, // Chaque run avec son startLine ajusté
        };
    } catch (error) {
        const totalTime = Date.now() - totalStart;
        console.error(
            `[❌ fetchMultipleRunsRange] Erreur après ${totalTime}ms:`,
            error.message,
        );
        throw error;
    }
}

/**
 * Fonction qui retourne une run spécifique par son numéro
 * ⚡ OPTIMISATION : Accepte startLine et données pré-chargées (rows/formulas) pour éviter les appels API redondants
 * Si rows et formulas sont fournis, utilise ces données au lieu de charger depuis Google Sheets
 */
async function getRunByNumber(
    runNumber,
    startLine = null,
    rows = null,
    formulas = null,
) {
    const totalStart = Date.now();
    try {
        let adjustedStartLine = 0;
        let findStartLineTime = 0;
        let fetchTime = 0;
        let badgesTime = 0;
        let parseTime = 0;

        // Si rows et formulas sont fournis, on les utilise directement
        if (rows !== null && formulas !== null && startLine !== null) {
            // Les données sont déjà chargées, on utilise startLine tel quel
            adjustedStartLine = startLine;
        } else {
            // Sinon, on charge les données depuis Google Sheets
            if (!API_KEY) {
                throw new Error('Clé API Google Sheets non configurée');
            }

            // Trouve la ligne de départ si elle n'est pas fournie
            // ⚡ NOUVEAU SYSTÈME : runNumber est maintenant un ID séquentiel, pas le numéro original du sheet
            if (startLine === null) {
                const findStart = Date.now();
                // Utilise getRunsList() pour obtenir la liste avec les IDs séquentiels
                const runsList = await getRunsList();
                const targetRun = runsList.find(
                    (r) => r.runNumber === runNumber,
                );
                if (targetRun && typeof targetRun.startLine === 'number') {
                    startLine = targetRun.startLine;
                } else {
                    throw new Error(
                        `Run avec ID séquentiel #${runNumber} non trouvée dans la liste`,
                    );
                }
                findStartLineTime = Date.now() - findStart;
            }

            if (startLine === null || startLine === -1) {
                throw new Error(
                    `Ligne de départ pour Run #${runNumber} non trouvée`,
                );
            }

            // Charge seulement la plage nécessaire autour de cette run (~50 lignes)
            const fetchStart = Date.now();
            const sheets = await getGoogleSheetsClient();
            const result = await fetchRunRange(startLine, sheets);
            fetchTime = Date.now() - fetchStart;
            rows = result.rows;
            formulas = result.formulas;
            adjustedStartLine = result.adjustedStartLine;
        }

        // Compte les badges pour cette run (plage limitée)
        // ⚡ NOTE : countBadgesInAllRuns utilise encore les numéros originaux du sheet
        // On doit trouver le numéro original pour chercher les badges
        const badgesStart = Date.now();
        const { allRunsBadges } = countBadgesInAllRuns(rows, formulas);

        // Trouve le numéro original du sheet pour cette run
        // On cherche dans les lignes chargées pour trouver le numéro original
        let originalRunNumber = null;
        if (adjustedStartLine < rows.length) {
            const headerRow = rows[adjustedStartLine];
            if (headerRow) {
                for (let col = 0; col < headerRow.length; col++) {
                    const cell = String(headerRow[col] || '').trim();
                    if (cell.startsWith('Run #')) {
                        originalRunNumber =
                            parseInt(cell.replace('Run #', '')) || null;
                        break;
                    }
                }
            }
        }

        const runBadges =
            (originalRunNumber &&
                allRunsBadges.find((rb) => rb.runNumber === originalRunNumber)
                    ?.badges) ||
            [];
        badgesTime = Date.now() - badgesStart;

        // Parse cette run spécifique avec le numéro original pour le parsing interne
        const parseStart = Date.now();
        const originalNumberForParsing = originalRunNumber || runNumber;
        const run = await parseRun(
            rows,
            adjustedStartLine,
            originalNumberForParsing,
            formulas,
        );
        parseTime = Date.now() - parseStart;
        if (!run) {
            throw new Error(`Impossible de parser Run #${runNumber}`);
        }

        // ⚡ NOUVEAU SYSTÈME : Assigne l'ID séquentiel correct
        // Le run parsé a encore l'ancien ID basé sur le numéro original
        // On doit le remplacer par l'ID séquentiel
        run.runNumber = runNumber;
        run.id = String(runNumber);
        // ⚡ Le originalRunNumber est déjà stocké dans run.originalRunNumber par parseRun

        // Assure que les badges sont correctement assignés
        run.badges = runBadges;
        run.gymBadges = runBadges.length;

        const totalTime = Date.now() - totalStart;
        const parts = [];
        if (findStartLineTime > 0)
            parts.push(`FindStartLine: ${findStartLineTime}ms`);
        if (fetchTime > 0) parts.push(`Fetch: ${fetchTime}ms`);
        if (badgesTime > 0) parts.push(`Badges: ${badgesTime}ms`);
        if (parseTime > 0) parts.push(`Parse: ${parseTime}ms`);
        console.log(
            `[⏱️  getRunByNumber #${runNumber}] Total: ${totalTime}ms${
                parts.length > 0
                    ? ` (${parts.join(', ')})`
                    : ' (données pré-chargées)'
            }`,
        );

        return run;
    } catch (error) {
        const totalTime = Date.now() - totalStart;
        console.error(
            `[❌ getRunByNumber #${runNumber}] Erreur après ${totalTime}ms:`,
            error.message,
        );
        throw error;
    }
}

/**
 * Fonction qui retourne uniquement la première run (la plus récente)
 * ⚡ OPTIMISATION : Ne parse que la première run au lieu de toutes les runs
 * Retourne toujours la première run, même si elle a un runEnd (l'API décidera si elle doit l'inclure)
 */
async function getFirstRun() {
    const totalStart = Date.now();
    try {
        if (!API_KEY) {
            throw new Error('Clé API Google Sheets non configurée');
        }

        console.log(
            '🔄 Récupération de la première run depuis Google Sheets...',
        );

        let clientStart = Date.now();
        const sheets = await getGoogleSheetsClient();
        const clientTime = Date.now() - clientStart;

        const fetchStart = Date.now();
        const [rows, formulas] = await Promise.all([
            fetchSheetData(sheets),
            fetchSheetFormulas(sheets),
        ]);
        const fetchTime = Date.now() - fetchStart;

        // ⚡ NOUVEAU SYSTÈME : Trouve la première run (première trouvée dans le sheet = plus récente)
        const findStart = Date.now();
        let firstRunInfo = null;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            // Cherche "Run #" dans n'importe quelle colonne
            let originalRunNumber = 0;
            for (let col = 0; col < row.length; col++) {
                const cell = String(row[col] || '').trim();
                if (cell.startsWith('Run #')) {
                    originalRunNumber =
                        parseInt(cell.replace('Run #', '')) || 0;
                    break;
                }
            }

            if (originalRunNumber > 0) {
                // Première run trouvée = plus récente
                firstRunInfo = { originalRunNumber, startLine: i };
                break;
            }
        }
        const findTime = Date.now() - findStart;

        if (!firstRunInfo) {
            console.log('⚠️  Aucune run trouvée dans Google Sheets');
            return null;
        }

        // Compte toutes les runs pour déterminer l'ID séquentiel de la première
        const runsList = await getRunsList();
        const totalRuns = runsList.length;
        const sequentialNumber = totalRuns; // Première run = numéro le plus élevé

        console.log(
            `  📝 Première run détectée: Run originale #${firstRunInfo.originalRunNumber} -> ID séquentiel #${sequentialNumber}`,
        );

        // Compte les badges pour cette run
        const badgesStart = Date.now();
        const { allRunsBadges } = countBadgesInAllRuns(rows, formulas);
        const badgesTime = Date.now() - badgesStart;

        // Parse uniquement la première run avec le numéro original pour le parsing
        const parseStart = Date.now();
        const run = await parseRun(
            rows,
            firstRunInfo.startLine,
            firstRunInfo.originalRunNumber,
            formulas,
        );
        const parseTime = Date.now() - parseStart;

        if (!run) {
            console.log(
                `⚠️  Impossible de parser la run originale #${firstRunInfo.originalRunNumber}`,
            );
            return null;
        }

        // ⚡ NOUVEAU SYSTÈME : Assigne l'ID séquentiel correct
        run.runNumber = sequentialNumber;
        run.id = String(sequentialNumber);
        // ⚡ Le originalRunNumber est déjà stocké dans run.originalRunNumber par parseRun

        // Assure que les badges sont correctement assignés
        const runBadges =
            allRunsBadges.find(
                (rb) => rb.runNumber === firstRunInfo.originalRunNumber,
            )?.badges || [];
        run.badges = runBadges;
        run.gymBadges = runBadges.length;

        const totalTime = Date.now() - totalStart;
        console.log(
            `[⏱️  getFirstRun] Total: ${totalTime}ms (Client: ${clientTime}ms, Fetch: ${fetchTime}ms, Find: ${findTime}ms, Badges: ${badgesTime}ms, Parse: ${parseTime}ms) | Run #${sequentialNumber} (originale #${firstRunInfo.originalRunNumber}) | ${rows.length} lignes chargées`,
        );

        // ⚡ On retourne toujours la première run, même si elle a un runEnd
        // L'API décidera si elle doit l'inclure (si elle n'est pas encore dans les statiques)
        if (run.runEnd) {
            console.log(
                `  ✅ Run #${sequentialNumber} récupérée (terminée avec runEnd: ${run.runEnd})`,
            );
        } else {
            console.log(
                `  ✅ Première run récupérée: Run #${sequentialNumber} (en cours)`,
            );
        }
        return run;
    } catch (error) {
        const totalTime = Date.now() - totalStart;
        console.error(
            `[❌ getFirstRun] Erreur après ${totalTime}ms:`,
            error.message,
        );
        throw error;
    }
}

// Export pour utilisation dans le watcher et les API routes
module.exports = {
    fetchAndConvert,
    checkAndUpdateFirstRun,
    getRunsData,
    getRunsList,
    getRunByNumber,
    getFirstRun,
    fetchMultipleRunsRange,
    getGoogleSheetsClient,
};

// Exécute si appelé directement
if (require.main === module) {
    fetchAndConvert()
        .then((success) => {
            process.exit(success ? 0 : 1);
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
