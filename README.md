# CreaPrint — Design & Impression (Marrakech)

Application web complète, responsive et orientée conversion pour **CreaPrint — Design & Impression** (`#CreaPrintMarrakech`, WhatsApp `+212 6 90 62 62 13`).

## Fonctionnalités incluses

### Pages publiques
- **Accueil (`/`)** : Hero orienté conversion, barre de réassurance, catégories cliquables, processus en 4 étapes, avantages atelier, galerie récente, avis clients, FAQ et CTA WhatsApp.
- **Services (`/services`)** : Les 13 pôles d'impression, signalétique, textile et conception graphique avec formats et délais indicatifs.
- **Configurateur de devis (`/devis`)** : Parcours en 4 étapes (Produit → Options dynamiques → Import de fichier PDF/JPG/PNG/AI/PSD avec prévisualisation → Coordonnées validées Zod), estimation en dirham marocain (DH), génération d'un devis brouillon PDF et redirection WhatsApp préremplie.
- **Catalogue (`/catalogue`)** : Recherche temps réel, filtres par catégorie, tarifs indicatifs en DH.
- **Réalisations (`/realisations`)** : Galerie filtrable avec modale détaillée.
- **À propos (`/a-propos`)** : Présentation locale à Marrakech et valeurs de l'atelier.
- **Contact (`/contact`)** : Formulaire connecté au CRM, horaires dynamiques et emplacement Google Maps modifiable depuis le dashboard.
- **Espace Client (`/mon-espace`)** : Connexion/création de compte, suivi des commandes, téléchargement des devis/factures PDF, messagerie par commande et envoi de fichiers complémentaires.

### Dashboard Admin sécurisé (`/admin`)
- Authentification par rôles : **Administrateur**, **Commercial**, **Production**.
- **Vue d'ensemble** : KPIs en DH, graphique Prospects/Commandes 30 jours (Recharts), origine UTM des prospects, top produits.
- **Prospects / CRM**, **Devis + export PDF CreaPrint**, **Kanban Commandes / Production**, **Produits & Tarifs**, **Vérification Fichiers clients**, **Galerie** et **Paramètres** (horaires, adresse/carte, TVA, équipe).

## Installation locale

```bash
npm install
cp .env.example .env
npm run dev
```

L'application démarre sur `http://localhost:3000`.

## Configuration Supabase (PostgreSQL)

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Exécutez le script SQL `supabase/migrations/001_initial_schema.sql` dans l'éditeur SQL Supabase pour créer les 18 tables, relations et politiques RLS.
3. Renseignez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans `.env`.

## Déploiement sur Vercel

1. Importez le dépôt Git sur Vercel.
2. Commande de build : `npm run build` — Dossier de sortie : `dist`.
3. Ajoutez les variables d'environnement définies dans `.env.example`.
