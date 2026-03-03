# CreaLabVisitors

Une application complète de gestion des visiteurs et des réservations pour le CreaLab. Cette solution permet de suivre les visites, gérer les profils utilisateurs et administrer un système de réservation d'activités en temps réel.

## 🎯 Objectif

CreaLabVisitors facilite la gestion quotidienne du CreaLab en automatisant l'accueil des visiteurs et la planification des activités. L'application utilise un système de cartes pour identifier rapidement les utilisateurs et leur donner accès à une interface de réservation intuitive.

## ✨ Fonctionnalités Principales

### 🏷️ Gestion des Visiteurs
- **Scan de cartes** : Identification instantanée des visiteurs
- **Inscription automatique** : Création de profil pour les nouveaux visiteurs
- **Modification de profil** : Mise à jour des informations personnelles
- **Authentification sécurisée** : Système de tokens JWT

### 📅 Système de Réservation
- **Calendrier interactif** : Interface de réservation intuitive avec FullCalendar
- **Activités prédéfinies** : Impression 3D, Peinture, Électronique, Cours
- **Glisser-déposer** : Création facile de réservations
- **Validation administrative** : Approbation des événements par les administrateurs

### 🔄 Temps Réel
- **Mises à jour instantanées** : Synchronisation en direct via Socket.IO
- **Collaboration** : Plusieurs utilisateurs peuvent voir les changements simultanément

### 📧 Notifications Email
- **Approbation d'événements** : Emails automatiques aux administrateurs
- **Liens d'action** : Validation/rejet direct depuis l'email
- **Templates personnalisés** : Emails professionnels avec Jinja2

## 🛠️ Technologies Utilisées

### Backend (Python)
- **FastAPI** : API REST moderne et performante
- **Supabase** : Base de données PostgreSQL hébergée
- **Socket.IO** : Communication temps réel
- **PyJWT** : Authentification par tokens
- **Jinja2** : Génération d'emails HTML
- **PySerial** : Communication avec le lecteur de cartes

### Frontend (React/TypeScript)
- **React 18** : Interface utilisateur moderne
- **TypeScript** : Développement type-safe
- **FullCalendar** : Composant calendrier interactif
- **Socket.IO Client** : Synchronisation temps réel
- **CSS3** : Interface responsive et moderne

### Infrastructure
- **Docker** : Conteneurisation (optionnelle)
- **SMTP/Gmail** : Envoi d'emails
- **CORS** : Sécurité cross-origin


## 📖 Utilisation

1. **Premier démarrage** : Accédez à `http://localhost:3000`
2. **Scan de carte** : Utilisez le lecteur RFID ou l'interface de test
3. **Inscription** : Les nouveaux utilisateurs créent leur profil
4. **Réservation** : Glissez-déposez les activités sur le calendrier
5. **Administration** : Les admins valident les événements via l'interface ou email

## 📝 Licence

Projet développé pour le CreaLab - IIM Digital School.

## 🐛 Support

Pour signaler un bug ou demander une fonctionnalité, ouvrez une [issue](https://github.com/IIM-CDI/CreaLabVisitors/issues).