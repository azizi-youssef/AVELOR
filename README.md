<<<<<<< HEAD
# AVELOR — Maison de Prêt-à-Porter & Haute Couture de Luxe au Maroc

AVELOR est une plateforme e-commerce professionnelle haut de gamme dédiée à la vente de vêtements, chaussures, sacs et accessoires pour hommes et femmes au Maroc.

---

## 🌟 Points Forts & Architecture

- **Frontend Next.js (App Router)** : TypeScript, Tailwind CSS, typographie haute couture (Cinzel & Tajawal), design minimaliste de prestige (#000000, #FFFFFF, #F5F5F5, #737373).
- **Prise en charge Bilingue & RTL** : Bilingue Français / Arabe avec basculement dynamique du sens de lecture (`dir="rtl"`).
- **Deux Univers Distincts** :
  - **Univers Homme** (`/homme`) : Costumes sartoriaux, chemises en coton d'Égypte, mocassins patinés, sacs de voyage 48h.
  - **Univers Femme** (`/femme`) : Robes sculpturales en soie, blazers structurés, sacs à main en cuir grainé, escarpins.
- **Backend Python FastAPI & SQLAlchemy 2** : API REST haute performance avec validation Pydantic, calculs stricts en `Numeric(10, 2)` (MAD), décrémentation transactionnelle des stocks.
- **Base de Données Supabase (PostgreSQL)** : Compatibilité native avec le connection pooler de Supabase (`psycopg2` avec SSL et fallback SQLite local pour dev).
- **Paiement & Logistique Maroc** : Paiement à la livraison (**Cash on Delivery**) standard, livraison gratuite au-dessus de 500 MAD (ou 40 MAD), suivi de commande en direct.
- **Panneau d'Administration Complet** (`/admin`) : Statistiques de ventes en MAD, gestion des statuts de commandes (Confirmée, En préparation, Expédiée avec numéro de suivi, Livrée, Annulée avec restitution automatique du stock), gestion du catalogue et des codes promos.

---

## 🔑 Identifiants de Démonstration

### Compte Administrateur
- **Email** : `admin@avelor.ma`
- **Mot de passe** : `AdminAvelor2026!`
- **Accès** : Espace d'administration complet sur `/admin`

### Compte Client Test
- **Email** : `client@avelor.ma`
- **Mot de passe** : `ClientAvelor2026!`

### Codes Promotionnels Actifs
- `BIENVENUE10` : **10% de réduction** immédiate dès 400 MAD d'achat.
- `AVELOR100` : **100 MAD de réduction** immédiate dès 1200 MAD d'achat.

---

## 🚀 Guide de Démarrage Rapide

### 1. Configuration de Supabase (Optionnel ou Immédiat)
Pour brancher votre propre base Supabase :
1. Rendez-vous sur votre tableau de bord [Supabase](https://supabase.com).
2. Dans **Project Settings** > **Database**, copiez l'URI de connexion (choisissez le Transaction Pooler sur le port 6543 ou direct 5432).
3. Ouvrez le fichier `backend/.env` et renseignez votre URL :
```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require"
```
*(Remarque : par défaut, un fallback SQLite `sqlite:///./avelor.db` est déjà préconfiguré et peuplé pour vous permettre de tester immédiatement).*

---

### 2. Démarrage du Backend (FastAPI)

```bash
cd backend

# Activer l'environnement virtuel
# Sur Windows :
.\venv\Scripts\activate

# Lancer le serveur avec rechargement automatique
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

L'API FastAPI sera disponible sur :
- **API Base** : `http://localhost:8000/api/v1`
- **Documentation Swagger interactive** : `http://localhost:8000/api/v1/docs`
- **Documentation ReDoc** : `http://localhost:8000/api/v1/redoc`

Pour exécuter les tests automatisés du backend :
```bash
pytest -v tests
```

---

### 3. Démarrage du Frontend (Next.js)

Dans un second terminal :

```bash
cd frontend

# Lancer le serveur de développement Next.js
npm run dev
```

La boutique AVELOR sera accessible sur :
👉 **http://localhost:3000**

---

### 4. Démarrage avec Docker Compose

Pour lancer l'ensemble des services de manière conteneurisée :

```bash
docker-compose up --build
```

---

## 📂 Structure du Projet

```
AVELOR/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/  # Routes (auth, products, categories, orders, promotions, admin, campaigns)
│   │   ├── core/              # Config, Security (JWT/bcrypt), Database (Supabase PostgreSQL / SQLite)
│   │   ├── models/            # Modèles SQLAlchemy (User, Product, Variant, Order, Payment, Shipment, Promo...)
│   │   ├── schemas/           # Schémas Pydantic v2
│   │   ├── services/          # Logique métier transactionnelle (OrderService, PromotionService, AuditService)
│   │   ├── db/seed.py         # Script d'initialisation du catalogue luxe et utilisateurs
│   │   └── main.py            # Point d'entrée FastAPI
│   ├── tests/                 # Tests unitaires et d'intégration pytest
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router (/, /homme, /femme, /products/[slug], /cart, /checkout, /admin...)
│   │   ├── components/        # Header bilingue, Footer luxe, ProductCard
│   │   ├── context/           # LanguageContext (FR/AR RTL), AuthContext (JWT), CartContext
│   │   ├── lib/               # Client API REST, Dictionnaire de traductions bilingue
│   │   └── types/             # Types TypeScript stricts
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```
=======
# AVELOR
 une plateforme e-commerce professionnelle haut de gamme dédiée à la vente de vêtements, chaussures, sacs et accessoires pour hommes et femmes au Maroc.
>>>>>>> c2363a280d9e1a6919c69bed93e97bbf8f212aa7
