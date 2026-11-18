# API ToDo

API REST de gestion de tâches en Node.js, Express et MongoDB (Mongoose),
avec authentification par JWT. Chaque utilisateur ne voit et ne modifie
que ses propres tâches.

## Fonctionnalités

- Inscription et connexion (mots de passe hachés avec bcrypt)
- Authentification par JWT (en-tête `Authorization: Bearer <token>`)
- CRUD complet sur les tâches, limité à leur propriétaire
- Statut des tâches : `a_faire`, `en_cours`, `termine`
- Filtres (`statut`, `priorite`, `q`) et statistiques
- Validation des données via les schémas Mongoose
- Gestion centralisée des erreurs et route de santé (`/health`)

## Technologies

Node.js, Express, MongoDB Atlas, Mongoose, bcryptjs, jsonwebtoken, dotenv

## Structure du projet

```
api-todo/
├── config/          # connexion à MongoDB
├── controllers/     # logique des routes (authController, taskController)
├── middlewares/     # auth, logger, erreurs, 404, vérification d'id
├── models/          # schémas User et Task
├── routes/          # définition des URL
└── server.js        # point d'entrée
```

## Installation

```bash
git clone https://github.com/TON-PSEUDO/api-todo.git
cd api-todo
npm install
cp .env.example .env
```

Renseigner ensuite les valeurs dans `.env`.

## Variables d'environnement

| Variable | Description |
|---|---|
| PORT | Port du serveur (défaut : 3000) |
| MONGODB_URI | Adresse de connexion MongoDB Atlas |
| JWT_SECRET | Clé secrète pour signer les tokens (longue et aléatoire) |
| JWT_EXPIRES_IN | Durée de validité d'un token (ex. `1h`) |

Générer un secret :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Lancement

```bash
npm run dev     # développement (nodemon)
npm start       # production
```

L'API répond sur http://localhost:3000

## Format des réponses

- Succès : l'objet demandé en JSON (ou aucun contenu avec le code 204).
- Erreur : toujours `{ "erreur": "message" }`.
  Pour une validation : `{ "erreur": "Données invalides", "details": ["..."] }`.

## Authentification

Les routes `/tasks` exigent un token. Il est reçu à l'inscription ou à la
connexion, puis envoyé dans chaque requête :

```
Authorization: Bearer <token>
```

## Endpoints

### Santé

| Méthode | URL | Description | Statut |
|---|---|---|---|
| GET | /health | Vérifie que l'API répond | 200 |

### Authentification

| Méthode | URL | Description | Statut |
|---|---|---|---|
| POST | /auth/register | Créer un compte | 201 / 400 / 409 |
| POST | /auth/login | Se connecter | 200 / 400 / 401 |
| GET | /auth/me | Utilisateur connecté (token requis) | 200 / 401 |

**POST /auth/register**

```json
{ "nom": "Awa", "email": "awa@test.com", "motDePasse": "motdepasse123" }
```

Réponse (201) :

```json
{
  "user": { "_id": "...", "nom": "Awa", "email": "awa@test.com", "role": "user" },
  "token": "eyJhbGciOi..."
}
```

Règles : nom de 2 à 50 caractères, email valide et unique, mot de passe de 8 caractères minimum.

**POST /auth/login**

```json
{ "email": "awa@test.com", "motDePasse": "motdepasse123" }
```

Réponse (200) : même forme que l'inscription.

### Tâches (token requis)

| Méthode | URL | Description | Statut |
|---|---|---|---|
| GET | /tasks | Mes tâches | 200 / 400 / 401 |
| GET | /tasks/stats | Mes statistiques | 200 / 401 |
| GET | /tasks/:id | Une tâche | 200 / 400 / 401 / 404 |
| POST | /tasks | Créer une tâche | 201 / 400 / 401 |
| PUT | /tasks/:id | Remplacer (titre et statut obligatoires) | 200 / 400 / 401 / 404 |
| PATCH | /tasks/:id | Modifier une partie | 200 / 400 / 401 / 404 |
| DELETE | /tasks/:id | Supprimer | 204 / 400 / 401 / 404 |

**Objet tâche**

```json
{
  "_id": "65f1c2a9b3d4e5f6a7b8c9d0",
  "titre": "Écrire le README",
  "description": "",
  "statut": "a_faire",
  "priorite": "moyenne",
  "dateLimite": null,
  "user": "65f1c2a9b3d4e5f6a7b8c9aa",
  "createdAt": "2026-11-18T10:00:00.000Z",
  "updatedAt": "2026-11-18T10:00:00.000Z"
}
```

| Champ | Type | Règles |
|---|---|---|
| titre | texte | obligatoire, 100 caractères max |
| description | texte | facultatif, 500 caractères max |
| statut | texte | `a_faire` (défaut), `en_cours`, `termine` |
| priorite | texte | `basse`, `moyenne` (défaut), `haute` |
| dateLimite | date ISO | facultatif |

Les champs `_id`, `user`, `createdAt` et `updatedAt` sont gérés par le serveur
et ignorés s'ils sont envoyés.

**Filtres sur GET /tasks**

| Paramètre | Exemple | Effet |
|---|---|---|
| statut | `?statut=en_cours` | tâches ayant ce statut |
| priorite | `?priorite=haute` | tâches ayant cette priorité |
| q | `?q=readme` | recherche dans le titre |

**GET /tasks/stats**

```json
{ "total": 5, "a_faire": 2, "en_cours": 1, "termine": 2 }
```

**Exemple : créer puis modifier une tâche**

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"titre":"Écrire le README","priorite":"haute"}'

curl -X PATCH http://localhost:3000/tasks/<id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"statut":"en_cours"}'
```

## Codes d'erreur

| Code | Signification |
|---|---|
| 400 | Données invalides, JSON cassé, id invalide |
| 401 | Token absent, invalide ou expiré, ou identifiants incorrects |
| 404 | Tâche ou route introuvable |
| 409 | Valeur déjà utilisée (email) |
| 500 | Erreur interne du serveur |

Une tâche appartenant à un autre utilisateur renvoie 404, comme si elle n'existait pas.

## Sécurité

- Mots de passe hachés (bcrypt), jamais renvoyés par l'API
- Secrets dans `.env`, non versionné
- Isolation des données : chaque requête est filtrée par utilisateur
- Seuls les champs attendus sont pris en compte (liste blanche)

## Tests

Une collection Postman est disponible dans `docs/`.
L'importer dans Postman, puis définir la variable `baseUrl`.

## Limites et suite

- Pas encore de tests automatisés ni de limitation du nombre de requêtes
- Prochaines étapes : Helmet et CORS, tests Jest, déploiement sur Render

