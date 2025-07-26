# HealthBox - Gestion Médicale Intelligente

## Description du projet
HealthBox est une application web de gestion médicale intelligente conçue pour la détection, le suivi et la gestion des maladies courantes telles que la grippe et le paludisme. Le projet vise à fournir un outil accessible et efficace pour les professionnels de santé, notamment dans des régions comme le Sénégal, où ces maladies sont fréquentes.

## Installation et configuration

### Prérequis
- Python 3.7+
- Pip
- Environnement virtuel recommandé (venv, virtualenv, etc.)

### Installation des dépendances
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Lancement de l'application
```bash
python app.py
```
L'application sera accessible à l'adresse : `http://127.0.0.1:5000/`

## Fonctionnalités principales

### Gestion des patients
- Création, consultation et liste des patients.
- Stockage des données patients dans un fichier JSON (`patients.json`).

### Diagnostic médical assisté par IA
- Modèle d'apprentissage automatique (Random Forest) entraîné pour détecter la grippe et le paludisme.
- Prise en compte des signes vitaux (battements par minute, température) et des symptômes rapportés.
- Historique des diagnostics conservé pour chaque patient.

### Tableau de bord
- Statistiques globales sur les patients et diagnostics.
- Visualisation graphique de la répartition par sexe, âge et types de diagnostics via Chart.js.

### Simulation de consultation vidéo
- Interface de téléconsultation simulée avec accès à la caméra et au microphone.
- Fonctionnalité prête à être étendue avec des API réelles (WebRTC, Twilio, etc.).

## Objectifs pour le Sénégal

- Offrir un outil numérique adapté aux besoins locaux pour la gestion des maladies endémiques comme le paludisme et la grippe.
- Faciliter le suivi médical et la prise de décision grâce à l'intelligence artificielle.
- Promouvoir l'accès à la téléconsultation pour les zones rurales ou isolées.
- Contribuer à la réduction de la charge sur les infrastructures médicales par une meilleure gestion des cas.

## Perspectives d'amélioration

- Intégration de véritables solutions de téléconsultation vidéo en temps réel.
- Extension du modèle IA pour inclure d'autres maladies et affiner la précision.
- Amélioration de la sécurité et de la confidentialité des données patients.
- Support multilingue pour toucher un public plus large.
- Optimisation de l'interface utilisateur pour une meilleure expérience mobile.

## Technologies utilisées

- Backend : Flask (Python)
- Modèle IA : scikit-learn (Random Forest)
- Frontend : HTML, CSS (Tailwind CSS), JavaScript
- Visualisation : Chart.js
- Stockage : Fichiers JSON pour les données patients

## Structure du projet

```
/app.py                 # Application Flask principale
/patients.json          # Données patients
/diagnosis_model.pkl    # Modèle IA entraîné
/templates/             # Templates HTML
/static/
    /css/               # Feuilles de style CSS
    /js/                # Scripts JavaScript
    /images/            # Images et logos
/README.md              # Documentation du projet
/requirements.txt       # Dépendances Python
```

---

Ce projet est un prototype fonctionnel destiné à être adapté et amélioré pour répondre aux besoins spécifiques des professionnels de santé et des patients dans des contextes variés, notamment en Afrique.

## Contributions

Les contributions sont les bienvenues ! N'hésitez pas à proposer des améliorations, signaler des bugs ou ajouter de nouvelles fonctionnalités pour faire évoluer HealthBox et mieux répondre aux besoins des utilisateurs.


