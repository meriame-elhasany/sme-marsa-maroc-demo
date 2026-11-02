# Système de Monitoring Énergétique (SME) — Marsa Maroc (Port d'Agadir)
## Application Web de Démonstration Interactive — Appel d'Offres n° 12/DEPA/2026 (ISO 50001)

> ⚠️ **AVERTISSEMENT : DONNÉES SIMULÉES — DÉMONSTRATION**  
> Cette application est un prototype de démonstration fonctionnelle et technique 100 % statique simulant le Système de Monitoring Énergétique (SME) des postes électriques de Marsa Maroc au Port d'Agadir. L'ensemble des mesures électriques présentées sont générées par un moteur de simulation algorithmique. Les paramètres non contractuels sont des exemples illustratifs consignés dans [`DECISIONS.md`](./DECISIONS.md).

---

## 🌐 Déploiement & Accès

- **Hébergement GitHub Pages** : `https://{owner}.github.io/sme-marsa-maroc-demo/` (sera mis à jour après publication)
- **Point d'entrée principal** : [`index.html`](./index.html)
- **Banc de tests automatisés** : [`tests.html`](./tests.html)

---

## ⚡ Objectifs de la Démonstration

Cette application démontre la faisabilité technique, l'ergonomie SCADA/GTC et la conformité aux exigences normatives de management de l'énergie (**ISO 50001:2018**) dans le cadre de l'appel d'offres n° 12/DEPA/2026 :

1. **Supervision temps réel** des 6 postes électriques du Port d'Agadir avec codes couleurs normalisés (vert, ambre, rouge, gris).
2. **Contrôle strict anti-double comptage** métrologique entre les arrivées générales transformateurs (TR) et les départs divisionnaires (grues, conteneurs reefers, éclairage).
3. **Moteur de simulation portuaire** à vitesse variable (x1, x10, x60) avec banc d'injection d'incidents (coupure Modbus TCP, pics aberrants, paquets perdus).
4. **Assistant de mise en service** guidé en 7 étapes avec trame Modbus TCP/IP (port 502) et génération d'un procès-verbal (PV) d'essai officiel.
5. **Indicateurs de Performance Énergétique (IPE / EnPI)** : $kWh/EVP$, $kWh/Tonne$, et efficacité des quais froids.
6. **Situation Énergétique de Référence (SER / Baseline)** : Modèle de régression multi-variables, suivi des dérives et courbe CUSUM des économies en kWh et en MAD.
7. **Architecture interactive 7 couches** en SVG mettant en valeur le cloisonnement étanche du réseau industriel OT (VLAN 12) et l'intégration à la GTC existante.
8. **Plan de recette SAT** : Checklist interactive des 15 tests (T01 à T15) du cahier des charges avec calcul de conformité en direct.
9. **Contrôle d'accès RBAC (4 profils)** : Administrateur technique, Responsable énergie, Exploitant, Lecteur avec journal d'audit inaltérable.

---

## 🚀 Lancement Local Rapide

L'application est **100 % statique** et ne requiert aucune étape de compilation (`npm build`, `webpack`, etc.) ni aucun serveur backend.

### Méthode 1 : Avec Python (Recommandé)
```bash
# Dans le dossier racine du projet :
python3 -m http.server 8080
```
Ouvrez votre navigateur sur : `http://localhost:8080/index.html` ou testez sous un sous-chemin simulé : `http://localhost:8080/sme-marsa-maroc-demo/`

### Méthode 2 : Avec Node.js (npx)
```bash
npx serve .
```

### Méthode 3 : Ouverture directe
Double-cliquez directement sur `index.html` (certains navigateurs restreignent les modules ES en protocole `file://` ; préférez un serveur HTTP local comme ci-dessus).

---

## 📂 Structure Modulaire du Code

```text
.
├── .nojekyll                 # Déploiement GitHub Pages sans traitement Jekyll
├── .gitignore                # Exclusion des fichiers temporaires et docs-sources
├── index.html                # Point d'entrée de la supervision
├── tests.html                # Banc de tests unitaires et métrologiques automatisés
├── README.md                 # Présente documentation
├── DECISIONS.md              # Registre des hypothèses et points à confirmer DEPA
├── css/
│   ├── main.css              # Structure responsive et variables (thème clair/sombre)
│   ├── scada-theme.css       # Thème industriel SCADA/GTC et voyants d'état LED
│   ├── components.css        # Composants (cartes, formulaires, stepper, modales)
│   └── print.css             # Feuille de style dédiée à l'impression PDF propre
├── vendor/
│   └── chart.umd.min.js      # Chart.js v4 UMD copié en local (0 dépendance CDN)
└── js/
    ├── app.js                # Initialisation générale de l'application
    ├── router.js             # Routeur par hash (#/dashboard, #/postes, etc.)
    ├── auth/                 # Contrôle d'accès RBAC (4 profils) et journal d'audit
    ├── storage/              # Persistance locale (localStorage) et données par défaut
    ├── simulation/           # Moteur temps réel, profils portuaires et Modbus TCP
    ├── calculs/              # Anti-double comptage, calculs d'IPE et SER CUSUM
    ├── alertes/              # Détection temps réel et cycle de vie des alarmes
    ├── rapports/             # Générateur de bilans énergétiques et export CSV
    └── ui/                   # Les 14 vues d'interface de la supervision
```

---

## 📑 Liste des 14 Écrans de la Supervision

1. `#/dashboard` : **Tableau de bord site** (KPI globaux, synthèse des 6 postes, graphiques temps réel, banc d'incidents).
2. `#/postes` : **Postes & Compteurs** (Mesures instantanées, badge de fraîcheur dynamique, historique et export CSV).
3. `#/mise-en-service` : **Assistant de mise en service** (7 étapes, test trame Modbus TCP, génération de PV d'essai).
4. `#/ipe` : **Indicateurs IPE (ISO 50001)** (Formules documentées, 3 exemples illustratifs, seuils cibles).
5. `#/ser` : **Situation Énergétique de Référence** (Baseline 2025, écarts constatés, courbe CUSUM, gains en MAD).
6. `#/alertes` : **Console des alarmes & seuils** (Cycle de vie Nouvelle > Prise en charge > Clôturée, seuils éditables).
7. `#/reporting` : **Rapports & Bilans** (Édition des bilans périodiques, export CSV, impression PDF mise en page).
8. `#/architecture` : **Architecture 7 Couches (SVG)** (Synoptique interactif, pare-feu DMZ, séparation OT/IT).
9. `#/metrologie` : **Équipements & Métrologie** (Classes 0.2S / 0.5S selon CEI 62053-22, étalonnages et validité).
10. `#/cybersecurite` : **Cybersécurité & Données** (Politique de protection Modbus, export & restauration sauvegarde JSON).
11. `#/recette` : **Plan de Recette SAT** (Checklist interactive des 15 tests T01 à T15, jauge de conformité).
12. `#/planning` : **Planning Gantt** (Chronogramme en 9 jalons pour le déploiement sur les quais).
13. `#/formation` : **Formation & Quiz** (4 modules pédagogiques et quiz interactif certifiant pour exploitants).
14. `#/audit` : **Journal d'Audit** (Traçabilité inaltérable avec historique avant/après des actions).

---

## 🔒 Limites de la Simulation

- **Données simulées** : Les mesures affichées proviennent de profils physiques plausibles (horaires d'activité, navires, froid) mais ne reflètent pas les flux réels des postes d'Agadir.
- **Topologie indicative** : Les dénominations (Poste 1 à 6) et armoires TGBT sont illustratives et devront être validées lors de la visite d'inventaire terrain avec la DEPA.
- **Modbus simulé** : Les trames Modbus TCP sont émulées côté client dans le navigateur (pas de socket TCP brute directe dans un navigateur standard).
- **Notification externe** : Les alertes sont notifiées dans l'interface web (les passerelles réelles SMS/SMTP nécessitent un composant serveur lors du déploiement final).
