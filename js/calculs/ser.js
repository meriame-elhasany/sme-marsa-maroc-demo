/**
 * SITUATION ÉNERGÉTIQUE DE RÉFÉRENCE (SER / BASELINE) — ISO 50001
 * Évaluation des écarts entre consommation observée et référence théorique.
 * Calcul de la courbe de somme cumulée des écarts (CUSUM).
 */

export const SEREngine = {
  PRIX_KWH_MAD: 1.15, // Tarif indicatif moyen HT en Dirhams marocains (à valider avec DEPA)

  /**
   * Calcule la consommation théorique de référence pour une journée donnée.
   */
  calculateTheoreticalDay(serConfig, evpCount, tonnageVrac) {
    const { termeFixe_kWh_jour, coefEVP, coefTonne } = serConfig.parametres;
    return termeFixe_kWh_jour + (coefEVP * evpCount) + (coefTonne * tonnageVrac);
  },

  /**
   * Génère la série historique (30 derniers jours) comparant Réel vs Baseline & CUSUM.
   */
  generateMonthlyComparison(serConfig) {
    const data = [];
    let cumulativeSavings_kWh = 0;
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400 * 1000);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;

      const evp = Math.round(isWeekend ? 350 + Math.random() * 80 : 580 + Math.random() * 100);
      const tonnes = Math.round(isWeekend ? 4500 + Math.random() * 1000 : 8500 + Math.random() * 1500);

      const baseline_kWh = this.calculateTheoreticalDay(serConfig, evp, tonnes);
      
      // La consommation réelle oscille autour de la baseline (actions d'efficacité énergétique)
      // Légère économie moyenne de -3.5 % (démontrant la performance énergétique)
      const efficiencyGainFactor = 0.965 + (Math.random() - 0.5) * 0.05;
      const observed_kWh = Math.round(baseline_kWh * efficiencyGainFactor);

      const delta_kWh = baseline_kWh - observed_kWh; // > 0 si économie réalisée
      cumulativeSavings_kWh += delta_kWh;

      data.push({
        date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        evp,
        tonnes,
        baseline_kWh: Math.round(baseline_kWh),
        observed_kWh,
        delta_kWh,
        cusum_kWh: Math.round(cumulativeSavings_kWh),
        cusum_MAD: Math.round(cumulativeSavings_kWh * this.PRIX_KWH_MAD)
      });
    }

    return {
      history: data,
      totalBaseline_kWh: data.reduce((acc, p) => acc + p.baseline_kWh, 0),
      totalObserved_kWh: data.reduce((acc, p) => acc + p.observed_kWh, 0),
      totalSavings_kWh: Math.round(cumulativeSavings_kWh),
      totalSavings_MAD: Math.round(cumulativeSavings_kWh * this.PRIX_KWH_MAD)
    };
  }
};
