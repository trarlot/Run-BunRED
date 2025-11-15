export interface Pokemon {
    nameFr: string;
    nameEn: string;
    ability: string;
    level: number;
    isDead?: boolean;
    sprite?: string;
    location: string; // Zone où le Pokémon a été rencontré
    nature?: string; // Nature du Pokémon
    moves?: string[]; // Liste des attaques (jusqu'à 4)
    ivs?: {
        hp: number;
        attack: number;
        defense: number;
        spAttack: number;
        spDefense: number;
        speed: number;
        total?: number;
    };
    encounterOrder?: number; // Ordre de rencontre
}

export interface Badge {
    name: string;
    imageName: string;
    position: {
        row: number;
        col: number;
    };
}

export interface Run {
    id: string;
    runNumber: number;
    originalRunNumber?: number; // ⚡ Numéro original du Google Sheet (pour référence/filtrage)
    runId: string;
    starter: string;
    gymBadges: number;
    totalBadges: number;
    badges: Badge[];
    deadPokemon: number;
    totalPokemon: number;
    team: Pokemon[];
    locations: string[];
    // Informations de résumé additionnelles
    runStart?: string;
    runEnd?: string;
    wonBattles?: string;
    personalBest?: string;
    trainerSprite?: string;
    showcasePokemon?: string[];
    showcasePokemonSprites?: string[];
}
