/**
 * INDICATEURS DE PERFORMANCE ÉNERGÉTIQUE (IPE / EnPI) — ISO 50001
 * Formules documentées et suivi des dérives par rapport aux seuils cibles.
 */

export const IPEEngine = {
  // Données simulées d'activité portuaire journalière
  PORT_ACTIVITY: {
    volumeEVP_jour: 580,          // EVP manutentionnés / jour
    tonnageVrac_jour: 8400,        // Tonnes de vrac / jour
    conteneursReefer_jour: 140     // Conteneurs frigo sous tension / jour
  },

  calculateAll(ipes, latestReadings) {
    return ipes.map(ipe => this.evaluate(ipe, latestReadings));
  },

  evaluate(ipe, latestReadings) {
    let resultValue = 0;
    let energieTotale_kWh = 0;

    switch (ipe.code) {
      case 'IPE_EVP': {
        // (E_P1 + E_P2) / Volume_EVP
        // On estime l'énergie journalière des postes 1 et 2
        const p1 = latestReadings.get('CMP-P1-001');
        const p2 = latestReadings.get('CMP-P2-001');
        const kw1 = (p1 && p1.qualite === 'OK') ? p1.valeurs.puissanceActive_kW : 350;
        const kw2 = (p2 && p2.qualite === 'OK') ? p2.valeurs.puissanceActive_kW : 550;
        
        // Consommation estimée sur 12h d'activité quai
        energieTotale_kWh = (kw1 + kw2) * 12;
        resultValue = energieTotale_kWh / this.PORT_ACTIVITY.volumeEVP_jour;
        break;
      }

      case 'IPE_TONNE': {
        // E_P4 / Tonnage_Vrac
        const p4 = latestReadings.get('CMP-P4-001');
        const kw4 = (p4 && p4.qualite === 'OK') ? p4.valeurs.puissanceActive_kW : 320;
        energieTotale_kWh = kw4 * 16;
        resultValue = energieTotale_kWh / this.PORT_ACTIVITY.tonnageVrac_jour;
        break;
      }

      case 'IPE_FROID': {
        // (E_Reefer_P1 + E_Froid_P5) / Conteneurs_Froid_Jour
        const reefer = latestReadings.get('CMP-P1-003');
        const p5 = latestReadings.get('CMP-P5-001');
        const kwReefer = (reefer && reefer.qualite === 'OK') ? reefer.valeurs.puissanceActive_kW : 120;
        const kwP5 = (p5 && p5.qualite === 'OK') ? p5.valeurs.puissanceActive_kW : 520;
        energieTotale_kWh = (kwReefer + kwP5 * 0.4) * 24;
        resultValue = energieTotale_kWh / this.PORT_ACTIVITY.conteneursReefer_jour;
        break;
      }

      default:
        resultValue = ipe.valeurActuelle || ipe.seuilCible;
    }

    const rounded = Math.round(resultValue * 100) / 100;
    const ecartSeuilPct = Math.round(((rounded - ipe.seuilCible) / ipe.seuilCible) * 1000) / 10;
    
    let statut = "OPTIMAL";
    if (rounded > ipe.seuilAlerte) statut = "ALERTE";
    else if (rounded > ipe.seuilCible) statut = "ATTENTION";

    return {
      ...ipe,
      valeurCalculee: rounded,
      ecartSeuilPct,
      statut,
      energieAssociee_kWh: Math.round(energieTotale_kWh)
    };
  }
};
