# DECISIONS.md — Registre des Hypothèses et Points à Confirmer
## Système de Monitoring Énergétique (SME) — Appel d'Offres n° 12/DEPA/2026 (Marsa Maroc - Port d'Agadir)

> [!NOTE]
> Ce document consigne l'ensemble des choix techniques, hypothèses de simulation et arbitrages retenus pour la réalisation de l'application web de démonstration du SME. Conformément aux exigences de transparence, tous les éléments non contractuels ou sujets à validation avec la Direction de l'Exploitation au Port d'Agadir (DEPA) sont explicitement listés ci-après.

---

## 1. Principes d'Honnêteté des Données et Démonstration

| Réf. | Sujet | Décision retenue pour la démonstration | Impact / Statut contractuel |
|---|---|---|---|
| **DEC-01** | **Simulation des données** | 100 % des grandeurs électriques et indicateurs présentés sont générés par un moteur algorithmique simulant les cycles portuaires (grues, terre-pleins, reefers, éclairage, nuit, week-end). | Un bandeau permanent **« DONNÉES SIMULÉES — DÉMONSTRATION »** est affiché sur l'ensemble des pages. Aucune donnée ne doit être interprétée comme issue d'une mesure réelle du Port d'Agadir. |
| **DEC-02** | **Topologie et libellés des 6 postes** | Utilisation de dénominations génériques fonctionnelles : *Poste 1 (Quai Nord & Grues)*, *Poste 2 (Terminal Conteneurs)*, *Poste 3 (Poste Polyvalent & Roulier)*, *Poste 4 (Vracs Liquides & Solides)*, *Poste 5 (Zone Frigorifique & Entrepôts)*, *Poste 6 (Services Généraux & Capitainerie)*. | **Exemple illustratif — à valider avec la DEPA**. Les schémas réels d'alimentation (22 kV / 400 V), puissances souscrites et références exactes des armoires TGBT seront importés lors de la phase d'inventaire terrain. |
| **DEC-03** | **Fabricants et modèles des compteurs** | Émulation de compteurs multifonctions industriels conformes à la norme CEI 62053-22 (Classe 0.2S / 0.5S en actif, Classe 2 en réactif) avec TC/TT paramétrables. | **Exemple illustratif — à valider avec la DEPA**. Le système est ouvert et agnostique vis-à-vis des marques (Schneider PM8000/PM5000, Socomec Diris, Siemens Sentron, ABB, etc.). |
| **DEC-04** | **Cartographie des registres Modbus TCP** | Utilisation d'une table type de registres *Holding Registers* (40001+) en Float32 et Uint32 avec facteurs d'échelle standard (0.1, 0.01, 0.001). | **Exemple illustratif — à valider avec la DEPA**. La table réelle de chaque équipement sera renseignée via l'assistant de mise en service sans modification de code source. |

---

## 2. Points Techniques à Confirmer avec la DEPA (Section 11 du CdC)

1. **Réseau de communication & Adressage IP** :
   - *Hypothèse démo* : Sous-réseau local dédié aux mesures `192.168.12.0/24`, port standard `502`, Unit ID de 1 à 6 par concentrateur.
   - *À confirmer* : Plan d'adressage IP Marsa Maroc, allocation des VLANs industriels (OT) et règles de routage inter-VLAN vers le serveur SME.
2. **Canaux de notification des alertes** :
   - *Hypothèse démo* : Notifications visuelles dans l'interface et console SCADA temps réel. Les champs de transmission E-mail (SMTP) et SMS (passerelle GSM ou API opérateur marocain) sont prévus et documentés avec la mention *« à confirmer avec la DEPA »*.
   - *À confirmer* : Passerelle SMS d'entreprise ou serveur relais SMTP interne à autoriser dans le pare-feu.
3. **Formules officielles des IPE (Indicateurs de Performance Énergétique - ISO 50001)** :
   - *Hypothèse démo* : 3 IPE représentatifs mis en avant :
     - `IPE-01` : $kWh / EVP$ (Consommation spécifique par conteneur manutentionné)
     - `IPE-02` : $kWh / Tonne$ (Consommation vrac solide/liquide)
     - `IPE-03` : $kWh / m^3\cdot jour$ (Efficacité énergétique des entrepôts frigorifiques)
   - *À confirmer* : Données d'activité sources (intégration automatique avec le TOS - Terminal Operating System ou saisie périodique manuelle/CSV).
4. **Modèle de la Situation Énergétique de Référence (SER / Baseline)** :
   - *Hypothèse démo* : Baseline basée sur l'année de référence 2025 avec modèle de régression linéaire multi-variables (terme fixe talon + volume conteneurs + tonnage vrac). Calcul de l'écart cumulé CUSUM.
   - *À confirmer* : Période officielle de référence retenue pour l'audit de certification ISO 50001 du Port d'Agadir.
5. **Seuils contractuels et pénalités de facteur de puissance** :
   - *Hypothèse démo* : Seuil d'alerte $\cos\varphi < 0.90$ (zone de pénalité réactive selon le barème ONEE/distributeur) et seuil de dépassement de puissance souscrite fixé à 90 % et 100 % de la valeur kVA.
   - *À confirmer* : Contrat de fourniture électrique souscrit auprès du distributeur d'Agadir (tranches horaires Heures Pleines / Heures de Pointe / Heures Creuses, tarifs horo-saisonniers).

---

## 3. Choix d'Architecture Logicielle Front-End

- **Architecture 100 % Statique & Zéro Build** :
  - Choix du Vanilla JavaScript avec modules ES (`import` / `export`). Ce choix garantit une pérennité maximale, aucune vulnérabilité introduite par des chaînes de build obsolètes (npm/webpack/vite) et une compatibilité native immédiate avec GitHub Pages.
- **Routage Hash (`#/page`)** :
  - L'utilisation du routage par hash `#/...` permet un rechargement propre sur n'importe quel serveur statique sans nécessiter de redirection d'URL de type rewrite `try_files $uri /index.html`.
- **Indépendance vis-à-vis des CDN** :
  - La bibliothèque graphique `Chart.js` est clonée en local dans le répertoire `/vendor/chart.umd.min.js`. L'application fonctionne intégralement hors ligne (réseau isolé ou air-gap industriel).
- **Prévention stricte du double comptage** :
  - Le modèle topologique distingue formellement les arrivées générales (`ARRIVEE_GENERALE`, drapeau `isAggregateMaster: true`) des départs divisionnaires (`SOUS_COMPTAGE`, drapeau `isAggregateMaster: false`). Seuls les points d'arrivée générale sont sommés dans le total site, garantissant l'exactitude métrologique du bilan global.
