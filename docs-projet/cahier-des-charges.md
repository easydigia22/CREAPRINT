# Cahier des charges — CreaPrint

**Projet :** CreaPrint — Design & Impression, Marrakech  
**Type :** Application web métier et vitrine commerciale  
**Statut :** Spécification fonctionnelle initiale  
**Date :** 19 novembre 2026

## 1. Contexte

CreaPrint est un atelier de design et d'impression basé à Marrakech. Le projet consiste à fournir une application web responsive qui permet aux clients de découvrir l'offre, demander un devis, transmettre leurs fichiers et suivre leurs commandes, tout en donnant aux équipes un espace d'administration pour gérer l'activité commerciale et de production.

## 2. Objectifs

- Améliorer la visibilité en ligne de l'atelier et faciliter la prise de contact.
- Transformer les visiteurs en prospects via le catalogue, le configurateur de devis et WhatsApp.
- Centraliser les prospects, devis, commandes, fichiers clients et échanges.
- Donner une visibilité aux clients sur l'avancement de leurs commandes.
- Réduire les tâches manuelles des équipes commerciale et production.

## 3. Utilisateurs et rôles

| Utilisateur | Besoins principaux |
| --- | --- |
| Visiteur | Consulter les services, réalisations, tarifs indicatifs et coordonnées. |
| Prospect | Configurer une demande de devis, importer un fichier et contacter CreaPrint. |
| Client | Gérer son compte, suivre ses commandes, télécharger ses documents et échanger avec l'équipe. |
| Administrateur | Administrer les données, les utilisateurs, les tarifs, les paramètres et les indicateurs. |
| Commercial | Qualifier les prospects, préparer les devis et suivre les clients. |
| Production | Consulter le planning/kanban, vérifier les fichiers et mettre à jour l'avancement des commandes. |

## 4. Périmètre fonctionnel

### 4.1 Site public

- Page d'accueil avec présentation de l'offre, appels à l'action, catégories, avantages, processus de commande, galerie, avis, FAQ et accès WhatsApp.
- Page Services détaillant les pôles d'impression, signalétique, textile et conception graphique, avec formats et délais indicatifs.
- Catalogue avec recherche en temps réel, filtres par catégorie et tarifs indicatifs en dirham marocain (DH).
- Galerie des réalisations filtrable, avec affichage détaillé dans une modale.
- Pages À propos et Contact présentant l'atelier, les horaires, l'adresse, la carte et les moyens de contact.
- Design responsive, optimisé pour mobile, tablette et ordinateur.

### 4.2 Configurateur de devis

- Parcours en quatre étapes : choix du produit, options, import de fichier, coordonnées.
- Options dynamiques selon le produit : format, quantité, support, finition et délai lorsque disponibles.
- Import de fichiers PDF, JPG, PNG, AI et PSD, avec prévisualisation lorsque possible.
- Validation des coordonnées et des données du formulaire.
- Calcul d'une estimation en DH à titre indicatif.
- Génération d'un brouillon de devis PDF aux couleurs CreaPrint.
- Redirection ou message WhatsApp prérempli pour finaliser la demande avec l'équipe.

### 4.3 Espace client

- Création de compte, connexion et gestion de session sécurisée.
- Tableau de bord des commandes et de leur statut.
- Téléchargement des devis et factures PDF associés.
- Messagerie liée à une commande.
- Envoi de fichiers complémentaires pour une commande en cours.

### 4.4 Administration et opérations

- Accès protégé par authentification et rôles : Administrateur, Commercial, Production.
- Tableau de bord avec indicateurs clés : prospects, commandes, chiffre d'affaires en DH, top produits et suivi sur 30 jours.
- Gestion CRM des prospects et de leur origine (notamment UTM).
- Création, édition, export PDF et suivi des devis.
- Gestion des commandes via un tableau Kanban de production.
- Vérification et suivi des fichiers fournis par les clients.
- Gestion des produits, catégories, tarifs indicatifs, galerie et réalisations.
- Paramétrage des horaires, adresse, carte, TVA et équipe.

## 5. Exigences non fonctionnelles

- Interface claire, rapide et adaptée aux écrans mobiles.
- Navigation accessible et messages d'erreur compréhensibles.
- Protection des espaces privés et séparation stricte des autorisations par rôle.
- Validation des entrées côté interface et côté données persistées.
- Conservation des montants en dirham marocain (DH).
- Compatibilité avec les navigateurs modernes.
- Journalisation des erreurs techniques sans exposer de données sensibles à l'utilisateur.

## 6. Architecture et stack

| Domaine | Choix actuel |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Interface | Composants React et styles du projet |
| Données / authentification | Supabase (PostgreSQL et politiques RLS) |
| Documents | Génération de PDF côté application |
| Graphiques | Recharts |
| Validation | Zod |
| Déploiement cible | Vercel |

La base de données est initialisée par `supabase/migrations/001_initial_schema.sql`. Les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` doivent être configurées dans `.env` à partir de `.env.example`.

## 7. Sécurité et données

- Les clés et secrets sont stockés exclusivement dans les variables d'environnement, jamais dans le code versionné.
- Les politiques RLS Supabase doivent limiter l'accès aux données au client propriétaire et aux rôles internes autorisés.
- Les fichiers clients doivent être contrôlés par type, taille et droits d'accès avant traitement.
- Les formulaires doivent limiter le spam et valider les contenus reçus.
- Les accès administratifs doivent utiliser des comptes nominatifs et des mots de passe robustes ; l'authentification multifacteur est recommandée.
- Les données personnelles sont limitées à celles nécessaires aux devis, commandes, livraisons et échanges.

## 8. Indicateurs de réussite

- Nombre de demandes de devis qualifiées.
- Taux de conversion des visiteurs vers une demande de contact/devis.
- Délai moyen de traitement d'un devis.
- Nombre de commandes suivies en ligne.
- Taux de fichiers acceptés sans correction.
- Satisfaction client après livraison.

## 9. Livrables

- Application web responsive CreaPrint.
- Site public, catalogue et configurateur de devis.
- Espace client authentifié.
- Tableau d'administration avec CRM, devis, commandes, fichiers, galerie et paramètres.
- Schéma et migrations Supabase avec politiques de sécurité.
- Documentation d'installation et de déploiement.

## 10. Hors périmètre à confirmer

- Paiement en ligne et facturation comptable automatisée.
- Connexion à un ERP, logiciel de caisse ou transporteur.
- Gestion automatique de production par machines d'impression.
- Application mobile native.
- Plusieurs langues et devises.

## 11. Critères de recette

- Un visiteur peut naviguer dans toutes les pages publiques et envoyer une demande de devis valide.
- Le configurateur calcule une estimation, accepte les formats de fichier autorisés et produit le brouillon de devis.
- Un client authentifié ne voit que ses commandes, documents, messages et fichiers.
- Chaque rôle interne ne peut effectuer que les actions autorisées.
- Une commande est suivie de bout en bout dans le kanban.
- Les données sont correctement persistées dans Supabase et protégées par les politiques RLS.
- La version de production se construit avec `npm run build` et peut être déployée sur Vercel.
