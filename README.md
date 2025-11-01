# Run&Bun - Tracker de Runs Pokémon 🎮

Application Next.js moderne pour afficher vos runs Pokémon avec synchronisation automatique depuis Google Sheets.

## ✨ Fonctionnalités

-   📊 **Frise chronologique horizontale** des rencontres Pokémon
-   🔄 **Synchronisation automatique** depuis Google Sheets (toutes les 10 minutes)
-   🖼️ **Sprites** des Pokémon et dresseurs depuis PokéAPI
-   📈 **Statistiques détaillées** : IVs, talents, zones de rencontre
-   🎨 **Design moderne** avec dégradés et effets visuels
-   📱 **Responsive** (mobile, tablette, desktop)
-   💀 **Distinction visuelle** des Pokémon K.O.

## 🚀 Installation

```bash
npm install
```

## ⚙️ Configuration

Créez un fichier `.env` à la racine :

```env
GOOGLE_SHEETS_API_KEY=votre_cle_api
GOOGLE_SHEET_ID=1OrFcuxg5DE-TvhK9_dGrqWScT4PyjLJ3uObTP3Sclkk
GOOGLE_SHEET_NAME=Runs
```

## 🎯 Utilisation

### Lancer l'application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

### Synchroniser les données

```bash
# Synchronisation manuelle
npm run sheets:sync

# Synchronisation automatique (toutes les 10 minutes)
npm run sheets:watch
```

## 📁 Structure

```
runbun/
├── app/
│   ├── page.tsx              # Interface principale
│   ├── layout.tsx            # Layout
│   └── globals.css           # Styles
├── data/
│   └── runs.ts               # Données (généré automatiquement)
├── scripts/
│   ├── fetch-from-sheets.js  # Script de synchronisation
│   └── watch-sheets.js       # Watcher automatique
├── types/
│   └── run.ts                # Types TypeScript
└── utils/
    └── pokemon.ts            # Utilitaires sprites
```

## 🛠️ Technologies

-   **Next.js 16** - Framework React
-   **TypeScript** - Typage statique
-   **Tailwind CSS 4** - Styles
-   **Google Sheets API** - Source de données
-   **PokéAPI** - Sprites Pokémon et trainers

## 📝 Format Google Sheet

Le script lit automatiquement :

-   **Run #X** : Numéro de run
-   **Pokémon** : Noms, talents, niveaux, IVs
-   **Zones** : Lieux de rencontre
-   **Personal Best** : Type de dresseur (pour le sprite)

---

Créé avec ❤️ pour Run&Bun
