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

/**
 * Initialise le client Google Sheets
 */
async function getGoogleSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        apiKey: API_KEY,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
}

/**
 * Récupère les données depuis Google Sheets
 */
async function fetchSheetData() {
    try {
        console.log('🔄 Connexion à Google Sheets...');
        const sheets = await getGoogleSheetsClient();

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
 */
async function fetchSheetFormulas() {
    try {
        console.log('🔄 Récupération des formules pour détecter les images...');
        const sheets = await getGoogleSheetsClient();

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

    // Trouve toutes les lignes "Gym Badges"
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row) continue;

        const firstCell = String(row[1] || '').trim(); // Colonne B

        if (firstCell === 'Gym Badges' || firstCell.includes('Vital Spirit')) {
            runCount++;
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
            allRunsBadges.push({
                runNumber: runCount,
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

    // Les Pokémon commencent à la colonne 10 (K) et sont espacés de 5 colonnes
    const POKEMON_START_COL = 10; // Colonne K
    const POKEMON_SPACING = 5;

    // Trouve toutes les sections de run (cherche "Run #")
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        // Cherche "Run #" dans n'importe quelle colonne
        let runNumberCol = -1;
        let runNumber = 0;

        for (let col = 0; col < row.length; col++) {
            const cell = String(row[col] || '').trim();
            if (cell.startsWith('Run #')) {
                runNumberCol = col;
                runNumber = parseInt(cell.replace('Run #', '')) || 0;
                break;
            }
        }

        if (runNumber > 0) {
            console.log(`  📝 Run #${runNumber} détecté à la ligne ${i + 1}`);

            // Parse ce run (les badges seront calculés depuis les formules à partir de la zone du run)
            const run = await parseRun(rows, i, runNumber, formulas);
            if (run) {
                runs.push(run);
            }
        }
    }

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
    for (let i = startLine; i < Math.min(startLine + 20, rows.length); i++) {
        const row = rows[i];
        if (!row) continue;

        const firstCell = String(row[1] || '').trim(); // Colonne B

        if (firstCell.startsWith('RundId')) {
            runIdRow = row;
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

    console.log(
        `    🔍 Scan de ${maxCol} colonnes pour trouver les Pokémon...`,
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

        // Récupère le sprite depuis PokéAPI par nom
        let sprite = null;

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
                const pokemonId = data.id;
                sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
                console.log(
                    `      🖼️  Sprite récupéré pour ${englishName} (ID: ${pokemonId})`,
                );
            } else {
                console.log(`      ⚠️  Sprite non trouvé pour ${englishName}`);
            }
        } catch (error) {
            console.log(
                `      ❌ Erreur récupération sprite pour ${englishName}:`,
                error.message,
            );
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
                            console.log(
                                `      💀 ${nickname} détecté comme mort (emoji 💀 trouvé ligne ${
                                    lineIndex + 1
                                })`,
                            );
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

        console.log(
            `      ✓ Pokémon ${team.length}: ${nickname} (${englishName}) - Niveau ${level}`,
        );
    }

    console.log(`    ✅ ${team.length} Pokémon trouvés dans Run #${runNumber}`);

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
        // Debug log: what we picked up (IDs from formulas)
        try {
            const f1 = formulas[showcaseRow] || [];
            const f2 = formulas[showcaseRow + 1] || [];
            const f3 = formulas[showcaseRow + 2] || [];
            const f4 = formulas[showcaseRow + 3] || [];
            console.log(
                `🔎 Showcase rows ${showcaseRow + 1}/${
                    showcaseRow + 2
                } FGH formulas:`,
                [f1[5], f1[6], f1[7]],
                [f2[5], f2[6], f2[7]],
            );
            console.log(
                `🔎 Showcase rows ${showcaseRow + 3}/${
                    showcaseRow + 4
                } FGH formulas:`,
                [f3[5], f3[6], f3[7]],
                [f4[5], f4[6], f4[7]],
            );
            console.log(
                `✅ Showcase Pokémon IDs parsed (max6):`,
                showcasePokemon,
            );
        } catch {}
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
        id: String(runNumber),
        runNumber,
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
 * Fonction principale
 */
async function fetchAndConvert() {
    try {
        // Vérifie la configuration
        if (!API_KEY) {
            console.error('❌ Clé API Google Sheets non configurée !');
            console.log('📝 Créez un fichier .env avec votre clé API');
            return false;
        }

        // Récupère les données des runs
        const rows = await fetchSheetData();

        // Récupère les formules pour détecter les badges =RechercheV
        const formulas = await fetchSheetFormulas();

        // Compte les badges en détectant les formules =VLOOKUP
        const { totalBadges, runCount, allRunsBadges } = countBadgesInAllRuns(
            rows,
            formulas,
        );

        // Logs des badges supprimés

        // Parse les données
        console.log('🔍 Analyse des données...');
        const runs = await parseSheetData(rows, formulas, allRunsBadges);
        console.log(`✅ ${runs.length} run(s) trouvé(s)`);

        runs.forEach((run) => {
            console.log(
                `   → Run #${run.runNumber}: ${run.team.length} Pokémon`,
            );
        });

        // Génère le fichier TypeScript
        const tsContent = generateRunsFile(runs);

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

// Export pour utilisation dans le watcher
module.exports = { fetchAndConvert };

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
