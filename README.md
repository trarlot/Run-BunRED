# Run&Bun

Application web pour mieux visualiser et suivre les runs Run&Bun de RED. Les données sont extraites directement depuis une **Google Sheets** faite par @Sykless.

## 🚀 Déploiement sur Vercel

Le projet est configuré pour charger les données **dynamiquement depuis Google Sheets** sans nécessiter de rebuild !

### ✨ Comment fonctionne la synchronisation

Les données sont maintenant chargées **en temps réel** via une API route :

1. ✅ **Pas de rebuild nécessaire** - Les données sont chargées dynamiquement depuis Google Sheets
2. ✅ **Cache intelligent** - Les données sont mises en cache pendant 1 minute pour limiter les appels API
3. ✅ **Fallback automatique** - Si l'API Google Sheets est indisponible, l'app utilise les données du dernier build
4. ✅ **Mises à jour automatiques** - Les nouvelles données du Google Sheet sont disponibles dans la minute

### Configuration requise

1. **Variables d'environnement** à configurer dans Vercel :
    - `GOOGLE_SHEETS_API_KEY` : Votre clé API Google Sheets
    - `GOOGLE_SHEETS_SHEET_ID` : L'ID de votre Google Sheet
    - `GOOGLE_SHEETS_SHEET_NAME` : Le nom de la feuille (par défaut: "SpritesRuns")
    - `CRON_SECRET` : Un secret pour sécuriser l'endpoint `/api/sync` (optionnel)

### Comment ça fonctionne

1. **Au chargement de la page** :

    - L'application charge les données depuis `/api/runs`
    - L'API route récupère les données depuis Google Sheets
    - Les données sont mises en cache pendant 1 minute

2. **Au build** :

    - Les données sont aussi synchronisées via `buildCommand` dans `vercel.json`
    - Cela génère `data/runs.ts` comme fallback si l'API Google Sheets est indisponible

3. **Synchronisation automatique** :
    - Les données sont automatiquement rafraîchies toutes les minutes (via le cache)
    - Pas besoin de rebuild ou de push GitHub
    - Les modifications du Google Sheet apparaissent dans la minute

### Avantages de cette approche

-   🚀 **Pas de rebuild** - Les données se mettent à jour automatiquement
-   ⚡ **Performances** - Cache intelligent pour limiter les appels API
-   🛡️ **Robuste** - Fallback automatique si l'API est indisponible
-   🔄 **Temps réel** - Les données sont toujours à jour
