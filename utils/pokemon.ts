/**
 * Construit l'URL du sprite directement depuis le nom du Pokémon
 * Sans appeler l'API PokéAPI (pour éviter les dépendances à Cloudflare)
 */
function buildSpriteUrlFromName(nameEn: string): string {
    let pokemonName = nameEn.toLowerCase();

    // Pour les formes régionales (Hisui, Galar, Alola), PokéAPI utilise le nom avec tiret
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

    // Construit l'URL GitHub directement avec le nom
    // GitHub/PokeAPI sprites supporte les noms dans certains cas
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonName}.png`;
}

/**
 * Fonction fallback pour les sprites
 * (Utilisée seulement si le script de sync n'a pas récupéré le sprite)
 * Construit l'URL directement depuis le nom, sans appeler l'API
 */
export function getPokemonSprite(nameEn: string): string {
    // Construit l'URL directement depuis le nom
    return buildSpriteUrlFromName(nameEn);
}

/**
 * Table des natures Pokémon (en anglais)
 * Format: { name: [stat augmentée, stat diminuée] }
 * null = nature neutre (aucune modification)
 */
export const POKEMON_NATURES: Record<string, [string, string] | null> = {
    // Natures neutres
    Quirky: null,
    Docile: null,
    Hardy: null,
    Bashful: null,
    Serious: null,

    // Natures avec bonus/malus
    Lonely: ['attack', 'defense'],
    Brave: ['attack', 'speed'],
    Adamant: ['attack', 'spAttack'],
    Naughty: ['attack', 'spDefense'],

    Bold: ['defense', 'attack'],
    Relaxed: ['defense', 'speed'],
    Impish: ['defense', 'spAttack'],
    Lax: ['defense', 'spDefense'],

    Timid: ['speed', 'attack'],
    Hasty: ['speed', 'defense'],
    Jolly: ['speed', 'spAttack'],
    Naive: ['speed', 'spDefense'],

    Modest: ['spAttack', 'attack'],
    Mild: ['spAttack', 'defense'],
    Quiet: ['spAttack', 'speed'],
    Rash: ['spAttack', 'spDefense'],

    Calm: ['spDefense', 'attack'],
    Gentle: ['spDefense', 'defense'],
    Sassy: ['spDefense', 'speed'],
    Careful: ['spDefense', 'spAttack'],
};

/**
 * Mapping des natures françaises vers anglaises
 * Permet de gérer les natures en français depuis le Google Doc
 */
export const NATURE_FR_TO_EN: Record<string, string> = {
    // Natures neutres
    Bizarre: 'Quirky',
    Docile: 'Docile',
    Hardi: 'Hardy',
    Pudique: 'Bashful',
    Sérieux: 'Serious',

    // Natures avec bonus/malus
    Solo: 'Lonely',
    Brave: 'Brave',
    Rigide: 'Adamant',
    Mauvais: 'Naughty',

    Assuré: 'Bold',
    Relax: 'Relaxed',
    Malin: 'Impish',
    Lâche: 'Lax',

    Timide: 'Timid',
    Pressé: 'Hasty',
    Jovial: 'Jolly',
    Naïf: 'Naive',

    Modeste: 'Modest',
    Doux: 'Mild',
    Discret: 'Quiet',
    Foufou: 'Rash',

    Calme: 'Calm',
    Gentil: 'Gentle',
    Prudent: 'Careful',
    Malpoli: 'Sassy',
};

/**
 * Convertit une nature française en anglaise si nécessaire
 * Retourne la nature en anglais, ou la nature originale si elle est déjà en anglais
 */
function normalizeNature(nature: string): string {
    // Si la nature est déjà en anglais (dans POKEMON_NATURES), on la retourne telle quelle
    if (POKEMON_NATURES[nature] !== undefined) {
        return nature;
    }

    // Sinon, on essaie de la convertir depuis le français
    const normalized = NATURE_FR_TO_EN[nature];
    return normalized || nature; // Retourne la nature originale si pas trouvée
}

/**
 * Retourne la stat augmentée et diminuée par une nature
 * Gère les natures en français et en anglais
 */
export function getNatureEffect(nature: string): {
    increased?: string;
    decreased?: string;
} {
    // Normalise la nature (convertit français → anglais si nécessaire)
    const normalizedNature = normalizeNature(nature);

    // Récupère l'effet depuis la table en anglais
    const effect = POKEMON_NATURES[normalizedNature];
    if (!effect) return {};

    return {
        increased: effect[0],
        decreased: effect[1],
    };
}

// === Méga (IDs > 905) - mapping manuel ===
// Clé: ID méga (votre mapping interne) → { nameFr, apiId }
// apiId = ID numérique du Pokémon form PokeAPI (souvent > 10000)
// Mapping générique des formes alternatives (Méga, Primo, etc.)
export const ALT_FORM_ID_MAP: Record<
    number,
    { nameFr?: string; apiId: number }
> = {
    // Exemples (IDs PokeAPI connus):
    // mewtwo-mega-x: 10033, mewtwo-mega-y: 10034, charizard-mega-x: 10035, charizard-mega-y: 10036,
    // venusaur-mega: 10037, blastoise-mega: 10038
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

    // Ajoutez ici: 908, 909, ... avec l'apiId PokeAPI correspondant
};

export function getAltFormSpriteById(id: number): string | undefined {
    const entry = ALT_FORM_ID_MAP[id];
    if (!entry) return undefined;
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.apiId}.png`;
}

export function getAltFormNameFrById(id: number): string | undefined {
    return ALT_FORM_ID_MAP[id]?.nameFr;
}
