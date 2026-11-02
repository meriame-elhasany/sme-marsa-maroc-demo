/**
 * DONNÉES INITIALES PAR DÉFAUT — SYSTÈME DE MONITORING ÉNERGÉTIQUE
 * Marsa Maroc — Port d'Agadir (12/DEPA/2026)
 * Toutes les données sont fournies à titre illustratif (simulation).
 */

export const DEFAULT_POSTES = [
  {
    id: "P1",
    code: "POSTE-01",
    nom: "Poste 1 — Quai Nord & Grues Mobiles",
    zone: "Terminal Polyvalent",
    tensionAlimentation: "22 kV / 400 V",
    puissanceSouscrite_kVA: 1250,
    seuilPuissance_kW: 1050,
    tableaux: [
      {
        id: "TGBT-P1-01",
        nom: "TGBT Général Quai Nord",
        departs: [
          {
            id: "DEP-P1-01",
            nom: "Arrivée Générale TR1 (22kV/400V)",
            type: "ARRIVEE_GENERALE",
            compteurId: "CMP-P1-001",
            isAggregateMaster: true // COMPTÉ DANS TOTAL SITE
          },
          {
            id: "DEP-P1-02",
            nom: "Départ Grues Bord à Quai (G1 & G2)",
            type: "SOUS_COMPTAGE",
            compteurId: "CMP-P1-002",
            isAggregateMaster: false // SOUS-COMPTAGE (NON RE-COMPTÉ)
          },
          {
            id: "DEP-P1-03",
            nom: "Départ Prises Frigorifiques Quai",
            type: "SOUS_COMPTAGE",
            compteurId: "CMP-P1-003",
            isAggregateMaster: false
          }
        ]
      }
    ]
  },
  {
    id: "P2",
    code: "POSTE-02",
    nom: "Poste 2 — Terminal Conteneurs",
    zone: "Terminal à Conteneurs",
    tensionAlimentation: "22 kV / 400 V",
    puissanceSouscrite_kVA: 1600,
    seuilPuissance_kW: 1350,
    tableaux: [
      {
        id: "TGBT-P2-01",
        nom: "TGBT Terminal Conteneurs",
        departs: [
          {
            id: "DEP-P2-01",
            nom: "Arrivée Générale TR2",
            type: "ARRIVEE_GENERALE",
            compteurId: "CMP-P2-001",
            isAggregateMaster: true
          },
          {
            id: "DEP-P2-02",
            nom: "Portiques de Quai (STS 1 & 2)",
            type: "SOUS_COMPTAGE",
            compteurId: "CMP-P2-002",
            isAggregateMaster: false
          },
          {
            id: "DEP-P2-03",
            nom: "Cavaliers gerbeurs & Éclairage parc",
            type: "SOUS_COMPTAGE",
            compteurId: "CMP-P2-003",
            isAggregateMaster: false
          }
        ]
      }
    ]
  },
  {
    id: "P3",
    code: "POSTE-03",
    nom: "Poste 3 — Quai Roulier & Tirage Ro-Ro",
    zone: "Terminal Ro-Ro",
    tensionAlimentation: "22 kV / 400 V",
    puissanceSouscrite_kVA: 800,
    seuilPuissance_kW: 680,
    tableaux: [
      {
        id: "TGBT-P3-01",
        nom: "TGBT Quai Roulier",
        departs: [
          {
            id: "DEP-P3-01",
            nom: "Arrivée Générale TR3",
            type: "ARRIVEE_GENERALE",
            compteurId: "CMP-P3-001",
            isAggregateMaster: true
          },
          {
            id: "DEP-P3-02",
            nom: "Passerelles Ro-Ro & Ravitaillement navires",
            type: "SOUS_COMPTAGE",
            compteurId: "CMP-P3-002",
            isAggregateMaster: false
          }
        ]
      }
    ]
  },
  {
    id: "P4",
    code: "POSTE-04",
    nom: "Poste 4 — Vracs Solides & Liquides",
    zone: "Quai Minéralier & Vracs",
    tensionAlimentation: "22 kV / 400 V",
    puissanceSouscrite_kVA: 1000,
    seuilPuissance_kW: 850,
    tableaux: [
      {
        id: "TGBT-P4-01",
        nom: "TGBT Poste Vracs",
        departs: [
          {
            id: "DEP-P4-01",
            nom: "Arrivée Générale TR4",
            type: "ARRIVEE_GENERALE",
            compteurId: "CMP-P4-001",
            isAggregateMaster: true
          },
          {
            id: "DEP-P4-02",
            nom: "Convoyeurs & Trémies d'ensachage",
            type: "SOUS_COMPTAGE",
            compteurId: "CMP-P4-002",
            isAggregateMaster: false
          }
        ]
      }
    ]
  },
  {
    id: "P5",
    code: "POSTE-05",
    nom: "Poste 5 — Zone Frigorifique & Entrepôts",
    zone: "Zone Logistique Froid",
    tensionAlimentation: "22 kV / 400 V",
    puissanceSouscrite_kVA: 1250,
    seuilPuissance_kW: 1100,
    tableaux: [
      {
        id: "TGBT-P5-01",
        nom: "TGBT Froid & Entrepôts",
        departs: [
          {
            id: "DEP-P5-01",
            nom: "Arrivée Générale TR5",
            type: "ARRIVEE_GENERALE",
            compteurId: "CMP-P5-001",
            isAggregateMaster: true
          },
          {
            id: "DEP-P5-02",
            nom: "Centrale Frigorifique & Compresseurs",
            type: "SOUS_COMPTAGE",
            compteurId: "CMP-P5-002",
            isAggregateMaster: false
          }
        ]
      }
    ]
  },
  {
    id: "P6",
    code: "POSTE-06",
    nom: "Poste 6 — Capitainerie & Services Généraux",
    zone: "Bâtiments Administratifs & Éclairage Port",
    tensionAlimentation: "22 kV / 400 V",
    puissanceSouscrite_kVA: 630,
    seuilPuissance_kW: 520,
    tableaux: [
      {
        id: "TGBT-P6-01",
        nom: "TGBT Capitainerie & Services",
        departs: [
          {
            id: "DEP-P6-01",
            nom: "Arrivée Générale TR6",
            type: "ARRIVEE_GENERALE",
            compteurId: "CMP-P6-001",
            isAggregateMaster: true
          },
          {
            id: "DEP-P6-02",
            nom: "Boucle Haute Éclairage Terre-pleins",
            type: "SOUS_COMPTAGE",
            compteurId: "CMP-P6-002",
            isAggregateMaster: false
          }
        ]
      }
    ]
  }
];

export const DEFAULT_COMPTEURS = [
  {
    id: "CMP-P1-001",
    numeroSerie: "MM-AGD-26-001",
    designation: "Compteur Général P1 Arrivée TR1",
    posteId: "P1",
    classePrecisionActive: "0.2S",
    classePrecisionReactive: "2.0",
    rapportTC: "2000/5",
    rapportTT: "1/1",
    dateDernierEtalonnage: "2026-01-15",
    periodiciteEtalonnageMois: 24,
    statut: "COMMUNICANT",
    modbus: {
      ipAddress: "192.168.12.11",
      port: 502,
      unitId: 1,
      pollingIntervalMs: 2000,
      timeoutMs: 1500,
      status: "CONNECTED",
      derniereCommunication: new Date().toISOString()
    }
  },
  {
    id: "CMP-P1-002",
    numeroSerie: "MM-AGD-26-002",
    designation: "Sous-comptage Grues Bord Quai Nord",
    posteId: "P1",
    classePrecisionActive: "0.5S",
    classePrecisionReactive: "2.0",
    rapportTC: "1000/5",
    rapportTT: "1/1",
    dateDernierEtalonnage: "2026-01-15",
    periodiciteEtalonnageMois: 24,
    statut: "COMMUNICANT",
    modbus: {
      ipAddress: "192.168.12.12",
      port: 502,
      unitId: 2,
      pollingIntervalMs: 2000,
      timeoutMs: 1500,
      status: "CONNECTED",
      derniereCommunication: new Date().toISOString()
    }
  },
  {
    id: "CMP-P1-003",
    numeroSerie: "MM-AGD-26-003",
    designation: "Sous-comptage Reefers Quai Nord",
    posteId: "P1",
    classePrecisionActive: "0.5S",
    classePrecisionReactive: "2.0",
    rapportTC: "800/5",
    rapportTT: "1/1",
    dateDernierEtalonnage: "2026-01-15",
    periodiciteEtalonnageMois: 24,
    statut: "COMMUNICANT",
    modbus: {
      ipAddress: "192.168.12.13",
      port: 502,
      unitId: 3,
      pollingIntervalMs: 2000,
      timeoutMs: 1500,
      status: "CONNECTED",
      derniereCommunication: new Date().toISOString()
    }
  },
  {
    id: "CMP-P2-001",
    numeroSerie: "MM-AGD-26-004",
    designation: "Compteur Général P2 Arrivée TR2",
    posteId: "P2",
    classePrecisionActive: "0.2S",
    classePrecisionReactive: "2.0",
    rapportTC: "2500/5",
    rapportTT: "1/1",
    dateDernierEtalonnage: "2026-02-10",
    periodiciteEtalonnageMois: 24,
    statut: "COMMUNICANT",
    modbus: {
      ipAddress: "192.168.12.21",
      port: 502,
      unitId: 1,
      pollingIntervalMs: 2000,
      timeoutMs: 1500,
      status: "CONNECTED",
      derniereCommunication: new Date().toISOString()
    }
  },
  {
    id: "CMP-P2-002",
    numeroSerie: "MM-AGD-26-005",
    designation: "Sous-comptage Portiques STS 1 & 2",
    posteId: "P2",
    classePrecisionActive: "0.5S",
    classePrecisionReactive: "2.0",
    rapportTC: "1600/5",
    rapportTT: "1/1",
    dateDernierEtalonnage: "2026-02-10",
    periodiciteEtalonnageMois: 24,
    statut: "COMMUNICANT",
    modbus: {
      ipAddress: "192.168.12.22",
      port: 502,
      unitId: 2,
      pollingIntervalMs: 2000,
      timeoutMs: 1500,
      status: "CONNECTED",
      derniereCommunication: new Date().toISOString()
    }
  },
  {
    id: "CMP-P2-003",
    numeroSerie: "MM-AGD-26-006",
    designation: "Sous-comptage Cavaliers & Éclairage Parc",
    posteId: "P2",
    classePrecisionActive: "0.5S",
    classePrecisionReactive: "2.0",
    rapportTC: "1000/5",
    rapportTT: "1/1",
    dateDernierEtalonnage: "2026-02-10",
    periodiciteEtalonnageMois: 24,
    statut: "COMMUNICANT",
    modbus: {
      ipAddress: "192.168.12.23",
      port: 502,
      unitId: 3,
      pollingIntervalMs: 2000,
      timeoutMs: 1500,
      status: "CONNECTED",
      derniereCommunication: new Date().toISOString()
    }
  },
  {
    id: "CMP-P3-001",
    numeroSerie: "MM-AGD-26-007",
    designation: "Compteur Général P3 Arrivée TR3",
    posteId: "P3",
    classePrecisionActive: "0.2S",
    classePrecisionReactive: "2.0",
    rapportTC: "1250/5",
    rapportTT: "1/1",
    dateDernierEtalonnage: "2026-01-20",
    periodiciteEtalonnageMois: 24,
    statut: "COMMUNICANT",
    modbus: {
      ipAddress: "192.168.12.31",
      port: 502,
      unitId: 1,
      pollingIntervalMs: 2000,
      timeoutMs: 1500,
      status: "CONNECTED",
      derniereCommunication: new Date().toISOString()
    }
  },
  {
    id: "CMP-P3-002",
    numeroSerie: "MM-AGD-26-008",
    designation: "Sous-comptage Passerelles Ro-Ro",
    posteId: "P3",
    classePrecisionActive: "0.5S",
    classePrecisionReactive: "2.0",
    rapportTC: "800/5",
    rapportTT: "1/1",
    dateDernierEtalonnage: "2026-01-20",
    periodiciteEtalonnageMois: 24,
    statut: "COMMUNICANT",
    modbus: {
      ipAddress: "192.168.12.32",
      port: 502,
      unitId: 2,
      pollingIntervalMs: 2000,
      timeoutMs: 1500,
      status: "CONNECTED",
      derniereCommunication: new Date().toISOString()
    }
  },
  {
    id: "CMP-P4-001",
    numeroSerie: "MM-AGD-26-009",
    designation: "Compteur Général P4 Arrivée TR4",
    posteId: "P4",
    classePrecisionActive: "0.2S",
    classePrecisionReactive: "2.0",
    rapportTC: "1500/5",
    rapportTT: "1/1",
    dateDernierEtalonnage: "2026-03-01",
    periodiciteEtalonnageMois: 24,
    statut: "COMMUNICANT",
    modbus: {
      ipAddress: "192.168.12.41",
      port: 502,
      unitId: 1,
      pollingIntervalMs: 2000,
      timeoutMs: 1500,
      status: "CONNECTED",
      derniereCommunication: new Date().toISOString()
    }
  },
  {
    id: "CMP-P4-002",
    numeroSerie: "MM-AGD-26-010",
    designation: "Sous-comptage Convoyeurs & Trémies",
    posteId: "P4",
    classePrecisionActive: "0.5S",
    classePrecisionReactive: "2.0",
    rapportTC: "1000/5",
    rapportTT: "1/1",
    dateDernierEtalonnage: "2026-03-01",
    periodiciteEtalonnageMois: 24,
    statut: "COMMUNICANT",
    modbus: {
      ipAddress: "192.168.12.42",
      port: 502,
      unitId: 2,
      pollingIntervalMs: 2000,
      timeoutMs: 1500,
      status: "CONNECTED",
      derniereCommunication: new Date().toISOString()
    }
  },
  {
    id: "CMP-P5-001",
    numeroSerie: "MM-AGD-26-011",
    designation: "Compteur Général P5 Arrivée TR5",
    posteId: "P5",
    classePrecisionActive: "0.2S",
    classePrecisionReactive: "2.0",
    rapportTC: "2000/5",
    rapportTT: "1/1",
    dateDernierEtalonnage: "2026-01-10",
    periodiciteEtalonnageMois: 24,
    statut: "COMMUNICANT",
    modbus: {
      ipAddress: "192.168.12.51",
      port: 502,
      unitId: 1,
      pollingIntervalMs: 2000,
      timeoutMs: 1500,
      status: "CONNECTED",
      derniereCommunication: new Date().toISOString()
    }
  },
  {
    id: "CMP-P5-002",
    numeroSerie: "MM-AGD-26-012",
    designation: "Sous-comptage Centrale Frigorifique",
    posteId: "P5",
    classePrecisionActive: "0.5S",
    classePrecisionReactive: "2.0",
    rapportTC: "1600/5",
    rapportTT: "1/1",
    dateDernierEtalonnage: "2026-01-10",
    periodiciteEtalonnageMois: 24,
    statut: "COMMUNICANT",
    modbus: {
      ipAddress: "192.168.12.52",
      port: 502,
      unitId: 2,
      pollingIntervalMs: 2000,
      timeoutMs: 1500,
      status: "CONNECTED",
      derniereCommunication: new Date().toISOString()
    }
  },
  {
    id: "CMP-P6-001",
    numeroSerie: "MM-AGD-26-013",
    designation: "Compteur Général P6 Arrivée TR6",
    posteId: "P6",
    classePrecisionActive: "0.2S",
    classePrecisionReactive: "2.0",
    rapportTC: "1000/5",
    rapportTT: "1/1",
    dateDernierEtalonnage: "2026-02-15",
    periodiciteEtalonnageMois: 24,
    statut: "COMMUNICANT",
    modbus: {
      ipAddress: "192.168.12.61",
      port: 502,
      unitId: 1,
      pollingIntervalMs: 2000,
      timeoutMs: 1500,
      status: "CONNECTED",
      derniereCommunication: new Date().toISOString()
    }
  },
  {
    id: "CMP-P6-002",
    numeroSerie: "MM-AGD-26-014",
    designation: "Sous-comptage Éclairage Public Terre-pleins",
    posteId: "P6",
    classePrecisionActive: "0.5S",
    classePrecisionReactive: "2.0",
    rapportTC: "600/5",
    rapportTT: "1/1",
    dateDernierEtalonnage: "2026-02-15",
    periodiciteEtalonnageMois: 24,
    statut: "COMMUNICANT",
    modbus: {
      ipAddress: "192.168.12.62",
      port: 502,
      unitId: 2,
      pollingIntervalMs: 2000,
      timeoutMs: 1500,
      status: "CONNECTED",
      derniereCommunication: new Date().toISOString()
    }
  }
];

export const DEFAULT_IPES = [
  {
    id: "IPE-01",
    code: "IPE_EVP",
    nom: "Consommation spécifique conteneurs (kWh / EVP)",
    description: "Ratio entre l'énergie consommée par les postes 1 et 2 et le volume d'EVP manutentionnés",
    mention: "Exemple illustratif — à valider avec la DEPA",
    perimetre: ["P1", "P2"],
    unite: "kWh / EVP",
    formule: "(E_P1 + E_P2) / Volume_EVP",
    periodeAgregation: "JOURNALIER",
    gestionDonneesManquantes: "INTERPOLATION_LINEAIRE",
    seuilCible: 18.5,
    seuilAlerte: 22.0,
    valeurActuelle: 19.4,
    dateEntreeVigueur: "2026-01-01",
    versions: [
      { version: "1.0", date: "2026-01-01", auteur: "Resp. Énergie DEPA", motif: "Mise en service initiale" }
    ]
  },
  {
    id: "IPE-02",
    code: "IPE_TONNE",
    nom: "Consommation spécifique vrac & manutention (kWh / Tonne)",
    description: "Ratio d'énergie consommée au Poste 4 par rapport aux tonnes de vrac traitées",
    mention: "Exemple illustratif — à valider avec la DEPA",
    perimetre: ["P4"],
    unite: "kWh / Tonne",
    formule: "E_P4 / Tonnage_Vrac",
    periodeAgregation: "JOURNALIER",
    gestionDonneesManquantes: "DERNIERE_VALEUR_CONNUE",
    seuilCible: 2.1,
    seuilAlerte: 2.8,
    valeurActuelle: 2.25,
    dateEntreeVigueur: "2026-01-01",
    versions: [
      { version: "1.0", date: "2026-01-01", auteur: "Resp. Énergie DEPA", motif: "Mise en service initiale" }
    ]
  },
  {
    id: "IPE-03",
    code: "IPE_FROID",
    nom: "Efficacité énergétique des quais & froid (kWh / EVP-jour froid)",
    description: "Consommation spécifique des prises frigorifiques rapportée au parc conteneurs reefer sous tension",
    mention: "Exemple illustratif — à valider avec la DEPA",
    perimetre: ["P1", "P5"],
    unite: "kWh / EVP-jour",
    formule: "(E_Reefer_P1 + E_Froid_P5) / Conteneurs_Froid_Jour",
    periodeAgregation: "JOURNALIER",
    gestionDonneesManquantes: "INTERPOLATION_LINEAIRE",
    seuilCible: 32.0,
    seuilAlerte: 38.0,
    valeurActuelle: 34.2,
    dateEntreeVigueur: "2026-01-01",
    versions: [
      { version: "1.0", date: "2026-01-01", auteur: "Resp. Énergie DEPA", motif: "Mise en service initiale" }
    ]
  }
];

export const DEFAULT_SER = {
  id: "SER-2025",
  nom: "Situation Énergétique de Référence — Port d'Agadir 2025",
  statut: "APPROUVEE",
  mention: "Méthode illustrative — à valider avec la DEPA",
  periodeDebut: "2025-01-01",
  periodeFin: "2025-12-31",
  consoReference_MWh: 14250.0,
  formuleRegression: "Conso_kWh/j = 18500 + (14.2 × EVP) + (0.85 × Tonnes_Vrac)",
  parametres: {
    termeFixe_kWh_jour: 18500,
    coefEVP: 14.2,
    coefTonne: 0.85
  },
  donneesActiviteReference: {
    totalEVP_an: 215000,
    totalTonnage_an: 3200000
  },
  versions: [
    { version: "v1.0", date: "2025-12-15", motif: "Baseline pré-audit ISO 50001", auteur: "Comité Énergie Marsa Maroc" }
  ]
};

export const DEFAULT_ALERTES = [
  {
    id: "ALT-2026-001",
    compteurId: "CMP-P2-001",
    posteId: "P2",
    type: "DEPASSEMENT_PUISSANCE",
    severite: "CRITIQUE",
    message: "Dépassement du seuil d'alerte de puissance active sur Poste 2 : 1380 kW (Seuil 1350 kW)",
    statut: "NOUVELLE", // "NOUVELLE" | "PRISE_EN_CHARGE" | "CLOTUREE"
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    historique: [
      { timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), user: "SYSTÈME", action: "Déclenchement automatique seuil dépassé" }
    ]
  },
  {
    id: "ALT-2026-002",
    compteurId: "CMP-P1-002",
    posteId: "P1",
    type: "COS_PHI_BAS",
    severite: "MAJEURE",
    message: "Facteur de puissance bas sur les grues Quai Nord : cos φ = 0.82 (< 0.90)",
    statut: "PRISE_EN_CHARGE",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    historique: [
      { timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), user: "SYSTÈME", action: "Déclenchement automatique dégradation cos φ" },
      { timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), user: "exploitant.port", action: "Prise en charge : contrôle batterie condensateurs TGBT-P1" }
    ]
  }
];

export const DEFAULT_RECETTE_TESTS = [
  { id: "T01", titre: "Communication Modbus TCP/IP (port 502)", statut: "CONFORME", date: "2026-10-15", commentaire: "Temps de réponse moyen < 45 ms sur les 6 postes" },
  { id: "T02", titre: "Exactitude lecture registres & facteurs d'échelle", statut: "CONFORME", date: "2026-10-15", commentaire: "Cohérence float32/uint32 vérifiée" },
  { id: "T03", titre: "Horodatage des mesures & synchronisation horaire", statut: "CONFORME", date: "2026-10-16", commentaire: "Dérive horloge < 100 ms" },
  { id: "T04", titre: "Contrôle strict anti-double comptage", statut: "CONFORME", date: "2026-10-16", commentaire: "Seules les arrivées générales sont agrégées dans Total Site" },
  { id: "T05", titre: "Détection coupure communication Modbus", statut: "CONFORME", date: "2026-10-17", commentaire: "Alarme levée après 3 cycles infructueux" },
  { id: "T06", titre: "Calcul dynamique des IPE (ISO 50001)", statut: "CONFORME", date: "2026-10-17", commentaire: "Formules kWh/EVP et kWh/Tonne validées" },
  { id: "T07", titre: "Suivi SER & calcul dérive CUSUM", statut: "CONFORME", date: "2026-10-18", commentaire: "Écart réel vs référence calculé en continu" },
  { id: "T08", titre: "Gestion du cycle d'alertes & seuils", statut: "CONFORME", date: "2026-10-18", commentaire: "Cycle Nouvelle > Prise en charge > Clôturée validé" },
  { id: "T09", titre: "Journal d'audit RBAC inaltérable", statut: "CONFORME", date: "2026-10-19", commentaire: "Traçabilité avant/après sur changements de seuils" },
  { id: "T10", titre: "Génération exports CSV & impression PDF", statut: "CONFORME", date: "2026-10-19", commentaire: "Mise en page propre et intégrité des valeurs" },
  { id: "T11", titre: "Sauvegarde & Restauration configuration JSON", statut: "CONFORME", date: "2026-10-20", commentaire: "Restauration d'état vérifiée sans perte de données" },
  { id: "T12", titre: "Résilience après coupure & reprise sans doublons", statut: "CONFORME", date: "2026-10-20", commentaire: "Index cumulés protégés contre réinitialisation" },
  { id: "T13", titre: "Cloisonnement des 4 profils utilisateurs (RBAC)", statut: "CONFORME", date: "2026-10-21", commentaire: "Droits de modification limités à l'Admin et Resp. Énergie" },
  { id: "T14", titre: "Signalement dynamique de fraîcheur des mesures", statut: "CONFORME", date: "2026-10-21", commentaire: "Badges temps réel / différé / périmé vérifiés" },
  { id: "T15", titre: "Filtrage et rejet des valeurs aberrantes", statut: "CONFORME", date: "2026-10-22", commentaire: "Rejet des pics hors plage physique (U, I, f)" }
];

export const DEFAULT_GANTT = [
  { id: "G01", jalon: "T0 : Visite et inventaire technique des 6 postes", dureeJours: 10, debutJour: 1, finJour: 10, progression: 100, responsable: "DEPA & Prestataire" },
  { id: "G02", jalon: "T1 : Validation architecture détaillée & plan réseau", dureeJours: 7, debutJour: 11, finJour: 17, progression: 100, responsable: "Chef Projet DEPA" },
  { id: "G03", jalon: "T2 : Fourniture & pose compteurs / tores TC", dureeJours: 20, debutJour: 18, finJour: 37, progression: 90, responsable: "Électricien agréé" },
  { id: "G04", jalon: "T3 : Câblage & raccordement réseau Modbus TCP", dureeJours: 15, debutJour: 30, finJour: 44, progression: 85, responsable: "Réseau & Câblage" },
  { id: "G05", jalon: "T4 : Configuration plateforme logicielle SME", dureeJours: 14, debutJour: 40, finJour: 53, progression: 90, responsable: "Ingénieur Supervision" },
  { id: "G06", jalon: "T5 : Intégration de l'existant & contrôle anti-doublon", dureeJours: 10, debutJour: 50, finJour: 59, progression: 80, responsable: "Expert Métrologie" },
  { id: "G07", jalon: "T6 : Campagne d'essais SAT (Tests T01 à T15)", dureeJours: 12, debutJour: 58, finJour: 69, progression: 75, responsable: "Commission Mixte" },
  { id: "G08", jalon: "T7 : Formation des exploitants & énergéticiens", dureeJours: 6, debutJour: 68, finJour: 73, progression: 50, responsable: "Formateur Spécialisé" },
  { id: "G09", jalon: "T8 : Mise en service industrielle & Réception provisoire", dureeJours: 7, debutJour: 74, finJour: 80, progression: 20, responsable: "Direction Port Agadir" }
];

export const DEFAULT_QUIZ = [
  {
    id: 1,
    question: "Dans le cadre de la norme ISO 50001, quelle est la définition d'un IPE (EnPI) ?",
    options: [
      "Un indicateur mesurable de performance énergétique (ex: kWh par conteneur EVP manutentionné)",
      "Le tarif horaire hors taxes appliqué par le fournisseur d'énergie",
      "Le calibre maximal du disjoncteur général du poste 22 kV",
      "Un protocole propriétaire de transmission de trames Modbus"
    ],
    reponseCorrecte: 0,
    explication: "Un IPE (Indicateur de Performance Énergétique) permet d'évaluer l'efficacité énergétique en rapportant la consommation aux variables d'activité portuaire réelles."
  },
  {
    id: 2,
    question: "Pour éviter tout double comptage dans le bilan global du Port d'Agadir, quelle règle métrologique s'applique ?",
    options: [
      "Sommer tous les compteurs sans exception",
      "Sommer uniquement les arrivées générales (TR) et exclure les départs divisionnaires déjà mesurés en amont",
      "Diviser la somme globale par le nombre de compteurs",
      "Prendre uniquement le compteur du poste le plus consommateur"
    ],
    reponseCorrecte: 1,
    explication: "Les sous-comptages (grues, reefers) servent à l'analyse fine et aux IPE, mais ne doivent jamais être ré-additionnés à l'arrivée générale du transformateur."
  },
  {
    id: 3,
    question: "Quelle est la pénalité principale si le facteur de puissance moyen d'un poste chute en dessous de 0.90 ?",
    options: [
      "Une coupure d'urgence de la ligne 22 kV",
      "Des facturations de pénalités pour consommation d'énergie réactive par le distributeur",
      "L'obligation de changer immédiatement tous les compteurs de classe 0.2S",
      "Une saturation du bus Modbus TCP/IP sur le port 502"
    ],
    reponseCorrecte: 1,
    explication: "Un facteur de puissance faible (cos φ < 0.90) entraîne des pertes Joule en ligne et des majorations tarifaires pour dépassement d'énergie réactive (kVARh)."
  },
  {
    id: 4,
    question: "Pourquoi le port 502 Modbus TCP/IP ne doit-il pas être exposé directement sur le réseau administratif/Internet ?",
    options: [
      "Parce que Modbus TCP ne comporte nativement ni chiffrement ni authentification",
      "Parce que la vitesse est limitée à 1 kbit/s",
      "Parce que le câble réseau Ethernet n'est pas blindé",
      "Parce que la norme ISO 50001 interdit l'utilisation d'adresses IP privées"
    ],
    reponseCorrecte: 0,
    explication: "Le protocole Modbus standard transmet les trames en clair. Il doit impérativement être cloisonné dans un VLAN industriel étanche avec pare-feu."
  }
];

export const DEFAULT_AUDIT_LOG = [
  {
    id: "LOG-001",
    timestamp: "2026-11-02T10:14:22Z",
    utilisateur: "admin.technique",
    role: "Administrateur technique",
    action: "CONFIGURATION_RESEAU",
    details: "Modification période d'interrogation Modbus CMP-P1-001 : 3000 ms -> 2000 ms"
  },
  {
    id: "LOG-002",
    timestamp: "2026-11-02T11:45:00Z",
    utilisateur: "resp.energie",
    role: "Responsable énergie",
    action: "AJUSTEMENT_SEUIL",
    details: "Mise à jour seuil alerte P1 : 1000 kW -> 1050 kW (accord chef exploitation)"
  },
  {
    id: "LOG-003",
    timestamp: "2026-11-02T14:30:15Z",
    utilisateur: "exploitant.port",
    role: "Exploitant",
    action: "ACQUITTEMENT_ALARME",
    details: "Prise en charge alarme ALT-2026-002 (cos φ bas Poste 1)"
  }
];
