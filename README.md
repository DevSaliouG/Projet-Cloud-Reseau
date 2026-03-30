# Projet-Cloud-Reseau

---

# Projet Cloud – Application Web Node.js

## Présentation

Ce projet est une application web simple développée avec **Node.js** et **Tailwind CSS** dans le cadre d’un projet de virtualisation et d’architecture réseau sécurisée.

L’objectif est de démontrer le fonctionnement d’un **serveur web placé dans une DMZ**, recevant des données depuis un serveur base de données situé dans un réseau LAN séparé.

L’application affiche dynamiquement des articles synchronisés depuis le serveur base de données.

---

## Architecture du projet

L’infrastructure est composée de trois machines virtuelles :

VM1 – Firewall / Gateway
VM2 – Serveur Web (Node.js + Nginx)
VM3 – Serveur Base de données (MySQL)

Architecture réseau :

```
Internet
   |
Firewall
   |
DMZ (192.168.100.0/24)
   |
Serveur Web (VM2)
   |
LAN (192.168.10.0/24)
   |
Serveur Base de données (VM3)
```

Règles de sécurité :

* Le serveur web n’a pas d’accès direct à la base de données.
* Le serveur base de données peut envoyer les données au serveur web.
* Les utilisateurs accèdent uniquement au serveur web.
* Le firewall contrôle les communications avec iptables.

---

## Fonctionnement de l’application

L’application Node.js :

1. Démarre un serveur HTTP.
2. Affiche une page web contenant les articles.
3. Reçoit les données depuis le serveur base de données via une API interne.

Endpoint utilisé :

```
POST /api/articles
```

Le serveur base de données envoie les articles sous forme de JSON.

Exemple de données envoyées :

```
{
  "articles": [
    {
      "id": 1,
      "title": "Premier article",
      "content": "Contenu de démonstration",
      "created_at": "2026-03-20"
    }
  ]
}
```

---

## Technologies utilisées

Backend

* Node.js
* HTTP module natif

Frontend

* Tailwind CSS
* HTML
* Animations CSS modernes

Infrastructure

* Ubuntu Server 22.04
* VirtualBox
* Nginx (reverse proxy)
* MySQL
* iptables (Firewall)

---

## Installation

Cloner le projet :

```
git clone https://github.com/DevSaliouG/Projet-Cloud-Reseau.git
cd Projet-Cloud-Reseau.git
```

Installer les dépendances (si ajout futur) :

```
npm install
```

Lancer le serveur :

```
npm start
```

Le serveur démarre sur :

```
http://localhost:3000
```

---

## Déploiement sur le serveur Web (VM2)

Sur la machine virtuelle Web :

```
git clone <repo>
cd projet-cloud-web
npm start
```

Avec Nginx utilisé pour un :

```
reverse proxy vers le port 3000
```

---

## Structure du projet

```
projet-cloud-web/
│
├── app.js
├── package.json
└── README.md
```

---

## Sécurité de l’architecture

Ce projet met en pratique plusieurs concepts :

* segmentation réseau
* architecture DMZ
* isolation des services
* firewall avec iptables
* communication inter-serveurs contrôlée

Cela permet de simuler une infrastructure utilisée dans un environnement d’entreprise.

---

## Interface utilisateur

L’interface est une landing page moderne comprenant :

* une navbar
* une section d’articles
* un design moderne avec Tailwind CSS
* un affichage dynamique des données

Le design utilise des effets modernes comme :

* animations
* cartes modernes
* style glassmorphism

---

## Tests

Pour tester l’envoi d’articles :

```
curl -X POST http://localhost:3000/api/articles \
-H "Content-Type: application/json" \
-d '{"articles":[{"id":1,"title":"Test","content":"Article envoyé","created_at":"2026"}]}'
```

---

## Objectifs pédagogiques du projet

Ce projet permet de comprendre :

* le déploiement d’applications dans une DMZ
* la communication entre serveurs
* la sécurisation réseau
* le rôle d’un firewall
* le fonctionnement d’un serveur web Node.js

---

## Auteur

Projet par réalisé Serigne Saliou Gaye dans le cadre d’un projet universitaire en Cloud Computing et Virtualisation. 

