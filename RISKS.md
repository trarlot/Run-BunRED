# ⚠️ Risques et Limitations

Ce document liste les risques potentiels de l'approche actuelle et comment les mitiger.

## 🔴 Risques Identifiés

### 1. Cache en Mémoire Perdu (Vercel Serverless)

**Problème** : Sur Vercel, les fonctions serverless sont stateless. Le cache en mémoire peut être perdu entre les requêtes si une nouvelle instance est créée.

**Impact** : 
- ⚠️ **Moyen** - Plus d'appels à l'API Google Sheets que prévu
- ⚠️ **Performance** - Latence plus élevée lors de la création d'une nouvelle instance

**Solutions** :
- ✅ **Actuelle** : Cache en mémoire (fonctionne bien pour la plupart des cas)
- 🔵 **Amélioration** : Utiliser Vercel KV ou Redis pour un cache persistant
- 🔵 **Alternative** : Augmenter la durée du cache à 5 minutes

### 2. Quotas API Google Sheets

**Problème** : Google Sheets API a des limites :
- 300 requêtes par minute par projet
- 600 requêtes par minute par utilisateur

**Impact** :
- 🔴 **Élevé** - Risque de dépassement si beaucoup d'utilisateurs simultanés
- 🔴 **Blocage** - L'API peut temporairement bloquer les requêtes

**Solutions** :
- ✅ **Actuelle** : Cache de 1 minute + Rate limiting basique (60 req/min)
- ✅ **Actuelle** : Fallback vers le cache même expiré
- 🔵 **Amélioration** : Utiliser Vercel KV pour partager le cache entre instances
- 🔵 **Alternative** : Augmenter la durée du cache à 5-10 minutes

### 3. Latence de l'API Google Sheets

**Problème** : Chaque appel à l'API peut prendre 500ms à 2s.

**Impact** :
- ⚠️ **Moyen** - Expérience utilisateur dégradée lors du premier chargement
- ⚠️ **UX** - Affichage d'un loader pendant le chargement

**Solutions** :
- ✅ **Actuelle** : Cache de 1 minute + fallback vers données statiques
- ✅ **Actuelle** : Timeout de 10 secondes
- 🔵 **Amélioration** : Prefetching des données côté serveur
- 🔵 **Alternative** : Utiliser ISR (Incremental Static Regeneration) de Next.js

### 4. Disponibilité de l'API Google Sheets

**Problème** : Si l'API Google Sheets est indisponible, l'app ne fonctionne pas.

**Impact** :
- 🔴 **Élevé** - Service complètement indisponible sans fallback
- 🔴 **UX** - Expérience utilisateur très dégradée

**Solutions** :
- ✅ **Actuelle** : Fallback vers le cache même expiré
- ✅ **Actuelle** : Fallback vers les données statiques (`data/runs.ts`)
- ✅ **Actuelle** : Retour d'erreur 503 avec message clair
- 🔵 **Amélioration** : Monitoring et alertes automatiques

### 5. Pas de Rate Limiting Robust

**Problème** : Le rate limiting actuel est basique et peut être contourné.

**Impact** :
- ⚠️ **Moyen** - Risque d'abus si l'endpoint est publique
- ⚠️ **Coût** - Plus d'appels API = risque de dépasser les quotas

**Solutions** :
- ✅ **Actuelle** : Rate limiting basique (60 req/min)
- 🔵 **Amélioration** : Utiliser Vercel Edge Middleware pour un rate limiting plus robuste
- 🔵 **Alternative** : Utiliser un service externe comme Upstash Rate Limit

### 6. Sécurité de la Clé API

**Problème** : La clé API Google Sheets doit être stockée en sécurité.

**Impact** :
- 🔴 **Élevé** - Si la clé est exposée, risque d'abus de quota

**Solutions** :
- ✅ **Actuelle** : Clé API stockée dans les variables d'environnement Vercel
- ✅ **Actuelle** : Clé API jamais commitée dans le repo (dans `.gitignore`)
- ✅ **Actuelle** : Accès en lecture seule (`readonly`)
- 🔵 **Recommandation** : Limiter la clé API à certaines IPs dans Google Cloud Console

## 🛡️ Recommandations

### Pour un usage Modeste (< 1000 visiteurs/jour)
✅ **Configuration actuelle suffisante** - Le cache et le rate limiting basique devraient suffire.

### Pour un usage Important (> 1000 visiteurs/jour)
🔵 **Améliorations recommandées** :
1. Utiliser Vercel KV pour un cache persistant
2. Augmenter la durée du cache à 5-10 minutes
3. Implémenter un rate limiting plus robuste
4. Ajouter du monitoring (Sentry, LogRocket, etc.)

### Pour un usage Critique (Millions de visiteurs)
🔵 **Architecture recommandée** :
1. Cache distribué (Redis/Vercel KV)
2. CDN pour servir les données statiques
3. ISR (Incremental Static Regeneration) de Next.js
4. Monitoring complet avec alertes
5. Rate limiting robuste à plusieurs niveaux

## 📊 Monitoring Recommandé

1. **Suivi des quotas Google Sheets API** : Surveiller les appels API
2. **Métriques de cache** : Taux de hit/miss du cache
3. **Latence** : Temps de réponse de l'API
4. **Erreurs** : Taux d'erreur de l'API Google Sheets
5. **Rate limiting** : Nombre de requêtes bloquées

## 🔗 Ressources

- [Google Sheets API Quotas](https://developers.google.com/sheets/api/limits)
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Next.js ISR Documentation](https://nextjs.org/docs/pages/building-your-application/data-fetching/incremental-static-regeneration)
