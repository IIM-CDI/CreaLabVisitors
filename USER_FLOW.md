# CreaLabVisitors — Parcours Utilisateur

```
                      ┌───────────────────────────────────────┐
                      │           LECTEUR DE CARTE            │
                      │                                       │
                      │   Passez votre badge devant           │
                      │   le lecteur pour vous identifier     │
                      └──────────────────┬────────────────────┘
                                         │
                                         ▼
                      ┌───────────────────────────────────────┐
                      │             VÉRIFICATION              │
                      │                                       │
                      │   Votre badge est-il déjà connu       │
                      │   dans le système ?                   │
                      └──────────────────┬────────────────────┘
                                         │
               ┌─────────────────────────┴──────────────────────────┐
          NON  │                                                    │  OUI
               ▼                                                    ▼
 ┌─────────────────────────────┐          ┌─────────────────────────────┐
 │       PREMIÈRE VISITE       │          │           ACCUEIL           │
 │                             │          │                             │
 │  Remplissez le formulaire   │          │  Votre profil est chargé    │
 │  d'inscription :            │          │  ainsi que le calendrier    │
 │                             │          │  de toutes les              │
 │    · Prénom                 │          │  réservations               │
 │    · Nom                    │          │                             │
 │    · Adresse e-mail         │          │                             │
 └──────────────┬──────────────┘          └──────────────┬──────────────┘
                │                                        │
                │ Compte créé et sauvegardé              │
                └───────────────────────┬────────────────┘
                                        │
            ┌───────────────────────────┼───────────────────────────┐
            │                           │                           │
            ▼                           ▼                           ▼
 ┌──────────────────────┐  ┌───────────────────────┐  ┌────────────────────────────┐
 │   RÉSERVER UN        │  │   MODIFIER MON        │  │       ESPACE ADMIN         │
 │   CRÉNEAU            │  │   PROFIL              │  │    (admins seulement)      │
 │                      │  │                       │  │                            │
 │  Choisissez une      │  │  Mettez à jour votre  │  │  Consultez et gérez les    │
 │  activité depuis     │  │  prénom, votre nom    │  │  demandes de réservation   │
 │  la barre latérale   │  │  ou votre adresse     │  │  en attente de validation  │
 │  et déposez-la sur   │  │  e-mail à tout        │  │                            │
 │  le créneau voulu    │  │  moment               │  │  ┌──────────────────────┐  │
 │  du calendrier       │  │                       │  │  │   ✔  Valider         │  │
 └──────────┬───────────┘  └───────────────────────┘  │  └──────────────────────┘  │
            │                                         │  ┌──────────────────────┐  │
            ▼                                         │  │   ✘  Refuser         │  │
 ┌──────────────────────┐                             │  └──────────────────────┘  │
 │  DEMANDE EN ATTENTE  │                             └────────────────────────────┘
 │                      │
 │  Votre réservation   │  ← Tous les visiteurs connectés
 │  est enregistrée,    │    voient le calendrier se mettre
 │  en attente d'une    │    à jour en temps réel
 │  validation admin    │
 └──────────┬───────────┘
            │
            │   Un e-mail de demande de validation est
            │   envoyé automatiquement à l'administrateur
            ▼
 ┌────────────────────────────────────────────────────────────┐
 │                  E-MAIL REÇU PAR L'ADMIN                   │
 │                                                            │
 │   Détails de la réservation : titre, date, heure           │
 │   Nom du demandeur                                         │
 │                                                            │
 │          [ ✔  APPROUVER ]          [ ✘  REFUSER ]          │
 │            Lien sécurisé             Lien sécurisé         │
 └────────────────────┬──────────────────────────┬────────────┘
                      │ Clic sur APPROUVER       │ Clic sur REFUSER
                      ▼                          ▼
         ┌─────────────────────────┐   ┌─────────────────────────┐
         │   RÉSERVATION           │   │   RÉSERVATION           │
         │   APPROUVÉE  ✔          │   │   REFUSÉE  ✘            │
         │                         │   │                         │
         │  · Visible sur le       │   │  · Retirée du           │
         │    calendrier           │   │    calendrier           │
         │  · Synchronisée avec    │   │  · L'utilisateur reçoit │
         │    Google Calendar      │   │    un e-mail l'informant│
         │  · L'utilisateur reçoit │   │    du refus             │
         │    un e-mail de         │   │  · Tous les visiteurs   │
         │    confirmation         │   │    connectés voient la  │
         │  · Tous les visiteurs   │   │    mise à jour          │
         │    connectés voient la  │   └─────────────────────────┘
         │    mise à jour          │
         └─────────────────────────┘


──────────────────────────────────────────────────────────────────────
  ÉTATS DE L'INTERFACE
──────────────────────────────────────────────────────────────────────

  Écran d'accueil   →  L'application attend qu'un badge soit passé
  Traitement        →  Le badge est en cours de vérification
  Inscription       →  Première visite : formulaire de création de compte
  Calendrier        →  Accès complet à l'application

──────────────────────────────────────────────────────────────────────
  PROFILS UTILISATEUR
──────────────────────────────────────────────────────────────────────

  Étudiant  ·  Rôle attribué automatiquement à chaque inscription
               Peut réserver des créneaux et modifier son profil

  Admin     ·  Rôle attribué manuellement par l'équipe du CreaLab
               Peut valider ou refuser les demandes de réservation
               Accède à l'espace d'administration depuis le calendrier
```
