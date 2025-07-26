# HealthBox 🩺📡

**HealthBox** est un système de **suivi et de détection de maladies** basé sur des capteurs médicaux et la plateforme **Blynk**. Il permet de surveiller la température corporelle et la tension simulée d’un utilisateur, et d’en déduire des risques potentiels comme la **grippe**, **l’hypotension**, **l’hypertension** ou même le **paludisme**.

---

## 🔧 Matériel requis

- ESP8266 (Wemos D1 R2 Mini)
- Capteur DHT11 
- Capteur de tension 
- Écran LCD 16x2 (avec connexion parallèle)
- Connexion Wi-Fi
- Compte Blynk avec app mobile

---

## 🔌 Connexions des composants

| Composant      | Broche ESP8266 |
|----------------|----------------|
| DHT11          | D1             |
| Capteur tension (KY-039) | A0             |
| LCD RS         | D0             |
| LCD E          | D8             |
| LCD D4         | D4             |
| LCD D5         | D3             |
| LCD D6         | D7             |
| LCD D7         | D2             |

---

## 🚀 Fonctionnalités

- Affichage de la température corporelle et de la tension sur écran LCD et Serial Monitor.
- Envoi des données sur l’application **Blynk** via Wi-Fi :
  - `V0` : Température
  - `V1` : Tension
  - `V2` : Diagnostic température (Grippe / Paludisme)
  - `V3` : Diagnostic tension (Hypo / Hyper / Normal)

- Diagnostique automatique :
  - **Température**
    - > 39°C → Risque **paludisme**
    - > 37.5°C → Symptômes **grippe**
    - ≤ 37.5°C → Température **normale**
  - **Tension**
    - < 60 bpm → **Hypotension**
    - > 100 bpm → **Hypertension**
    - 60–100 bpm → **Tension normale**

---

## 🧠 Principe de fonctionnement

- Toutes les 5 secondes :
  - Lecture de la température via DHT11.
  - Lecture de la tension simulée (battements détectés sur 10 secondes).
  - Affichage local + envoi Blynk + diagnostic automatisé.

---

## 📱 Interface Blynk

Crée une interface avec les éléments suivants :

- **Gauge** (V0) → Température
- **Gauge** (V1) → Tension
- **Label** (V2) → Diagnostic température
- **Label** (V3) → Diagnostic tension

---

## 📂 Fichier principal

Le fichier Arduino principal inclut les bibliothèques :

```cpp
#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
#include <DHT.h>
#include <LiquidCrystal.h>
```

## 💬 Envie de participer ? On a besoin de vous !

Si ce projet t’intéresse et que tu souhaites y contribuer — que ce soit pour améliorer le code, proposer des idées, corriger des bugs ou ajouter de nouvelles fonctionnalités — **ta participation est la bienvenue** ! 🙌

🛠 Que tu sois étudiant(e), développeur(se), passionné(e) d’électronique ou simplement curieux(se), tu peux faire la différence.

📩 N’hésite pas à ouvrir une **issue** pour suggérer une amélioration ou poser une question, ou à créer une **pull request** pour proposer directement une modification.

👉 **Contacte-nous ou commence dès maintenant sur le dépôt !**
