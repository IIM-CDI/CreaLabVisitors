# CreaLabVisitors

CreaLabVisitors est l'application de gestion des visiteurs et des réservations utilisée au CreaLab.
Son objectif est simple : identifier rapidement les utilisateurs avec une carte, leur permettre de réserver des activités dans un calendrier partagé, et offrir aux administrateurs un flux de validation clair.

## Ce que fait l'application

### 1) Accueil et accès des visiteurs
- Un utilisateur scanne sa carte pour entrer dans l'application.
- Si la carte est déjà connue, l'utilisateur arrive directement sur le calendrier.
- Si la carte est nouvelle, l'application ouvre un formulaire d'inscription (prénom, nom, e-mail).

### 2) Gestion du profil
- Les utilisateurs peuvent mettre à jour leurs informations de profil depuis l'interface.
- Cela permet de garder des coordonnées à jour pour les notifications et le suivi des réservations.

### 3) Réservation d'activités
- Les utilisateurs créent leurs réservations directement dans le calendrier.
- Les activités apparaissent dans un planning clair, partagé avec tous les utilisateurs connectés.
- Les nouvelles réservations sont créées en attente jusqu'à leur validation.

### 4) Processus de validation admin
- Les administrateurs voient les réservations en attente dans un espace de modération dédié.
- Chaque demande peut être approuvée ou refusée.
- Les administrateurs peuvent aussi valider depuis des liens d'action reçus par e-mail.

### 5) Mises à jour en direct et notifications
- Les changements du calendrier sont partagés en temps réel, pour que chacun voie immédiatement les mises à jour.
- Des e-mails de notification sont envoyés aux étapes importantes (approbation/refus).

## Rôles utilisateur

- **Étudiant (rôle par défaut) :** peut s'inscrire, modifier son profil et créer des réservations.
- **Admin :** dispose de toutes les permissions étudiant, plus la validation/le refus des réservations.

## Stack technique (essentiel)

- **Frontend :** React + TypeScript
- **Backend :** Python (FastAPI)
- **Base de données :** Supabase (PostgreSQL)
- **Temps réel :** Socket.IO

## Contexte du projet

Ce projet a été développé pour le CreaLab de l'IIM Digital School.