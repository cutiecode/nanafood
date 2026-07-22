# NanaFood — West African Restaurant App

Stack: Next.js 15, TypeScript, Tailwind CSS v4, Prisma v7 + SQLite, Stripe, Resend

## Installation sur un nouvel ordinateur

### 1. Prérequis
Installe dans cet ordre :
- [Node.js LTS](https://nodejs.org) — v20+
- [Git](https://git-scm.com)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

### 2. Cloner le projet
```bash
git clone https://github.com/TON_USERNAME/TON_REPO.git
cd TON_REPO
```

### 3. Installer les dépendances
```bash
npm install
```

### 4. Variables d'environnement
Crée un fichier `.env.local` à la racine : 

DATABASE_URL="file:./prisma/dev.db"
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ADMIN_PASSWORD=ton_mot_de_passe_admin
RESEND_API_KEY=re_...
CONTACT_EMAIL=ton@email.com

### 5. Base de données
```bash
npx prisma migrate deploy
npx prisma generate
```

### 6. Lancer le projet
```bash
npm run dev
```

### 7. Stripe webhook (terminal séparé)
```bash
stripe listen --forward-to localhost:3000/api/webhook
```

## Structure du projet
- `app/` — pages et composants Next.js
- `app/api/` — routes API
- `app/components/` — composants réutilisables
- `app/context/` — CartContext, SettingsContext
- `app/admin/` — back office admin
- `prisma/` — schéma et migrations DB
- `public/` — images statiques (dont nanabg.png)

## Variables d'environnement requises
| Variable | Description |
|---|---|
| DATABASE_URL | Chemin SQLite local |
| STRIPE_SECRET_KEY | Clé secrète Stripe |
| STRIPE_WEBHOOK_SECRET | Secret webhook Stripe CLI |
| ADMIN_PASSWORD | Mot de passe back office |
| RESEND_API_KEY | Clé API Resend (emails) |
| CONTACT_EMAIL | Email qui reçoit les messages |