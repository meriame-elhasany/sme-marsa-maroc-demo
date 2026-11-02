/**
 * PROFILS DE CHARGE PORTUAIRE — PORT D'AGADIR
 * Modélisation réaliste des consommations :
 * - Cycles grues bord à quai, portiques conteneurs (STS)
 * - Charge permanente frigorifique (reefers)
 * - Activité diurne vs nocturne, éclairage terre-pleins
 * - Bruit gaussien et variations aléatoires d'accélération
 */

export function getHarborPowerEstimate(posteId, hourFloat, isWeekend = false) {
  // Bruit aléatoire (-3% à +3%)
  const noise = (Math.random() - 0.5) * 0.06;

  switch (posteId) {
    case 'P1': {
      // Poste 1 : Quai Nord (Grues mobiles + Prises reefers)
      // Base reefer : 180 kW continu. Pics de manutention à 9h-12h et 14h-18h
      let base = 220;
      if (hourFloat >= 8 && hourFloat <= 12) {
        base += 380 * Math.sin(((hourFloat - 8) / 4) * Math.PI);
      } else if (hourFloat >= 14 && hourFloat <= 19) {
        base += 420 * Math.sin(((hourFloat - 14) / 5) * Math.PI);
      } else if (hourFloat >= 20 || hourFloat <= 5) {
        base = 190; // Charge talon de nuit
      }
      if (isWeekend) base *= 0.65;
      return Math.max(120, base * (1 + noise));
    }

    case 'P2': {
      // Poste 2 : Terminal Conteneurs (Portiques STS + Cavaliers gerbeurs)
      // Forte demande pendant les escales de porte-conteneurs
      let base = 350;
      if (hourFloat >= 7 && hourFloat <= 13) {
        base += 650 * Math.sin(((hourFloat - 7) / 6) * Math.PI);
      } else if (hourFloat >= 14 && hourFloat <= 21) {
        base += 750 * Math.sin(((hourFloat - 14) / 7) * Math.PI);
      } else {
        base = 280; // Éclairage terre-plein & chargeurs
      }
      if (isWeekend) base *= 0.85; // Le terminal conteneurs tourne aussi le week-end
      return Math.max(200, base * (1 + noise));
    }

    case 'P3': {
      // Poste 3 : Quai Roulier Ro-Ro (Passerelles & navires rouliers)
      // Épisodes d'accostage : 6h-9h et 16h-19h
      let base = 120;
      if ((hourFloat >= 6 && hourFloat <= 9) || (hourFloat >= 16 && hourFloat <= 19)) {
        base += 280;
      }
      return Math.max(90, base * (1 + noise));
    }

    case 'P4': {
      // Poste 4 : Vracs Minéralier & Céréalier (Convoyeurs à bande, trémies)
      // Fonctionnement continu par trains de 4 heures
      let base = 180;
      if (hourFloat >= 8 && hourFloat <= 17) {
        base += 320 * (Math.sin(hourFloat * 1.5) > 0 ? 1 : 0.2);
      }
      return Math.max(110, base * (1 + noise));
    }

    case 'P5': {
      // Poste 5 : Zone Frigorifique & Entrepôts Froid
      // Compresseurs industriels : charge talon élevée avec cycles de régulation
      let base = 520 + 90 * Math.sin(hourFloat * 0.8);
      // Légère hausse l'après-midi avec la température extérieure à Agadir
      if (hourFloat >= 12 && hourFloat <= 16) base += 80;
      return Math.max(380, base * (1 + noise));
    }

    case 'P6': {
      // Poste 6 : Capitainerie, Bâtiments administratifs & Éclairage Port
      // Administratif en journée (8h-18h), Éclairage fort la nuit (19h-6h)
      let base = 90;
      if (hourFloat >= 8 && hourFloat <= 18) {
        base += 110; // Bureaux, climatisation, serveurs
      }
      if (hourFloat >= 19 || hourFloat <= 6) {
        base += 160; // Boucle éclairage haute puissance terre-pleins
      }
      return Math.max(70, base * (1 + noise));
    }

    default:
      return 150 * (1 + noise);
  }
}
