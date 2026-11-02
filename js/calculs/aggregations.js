/**
 * MOTEUR D'AGRÉGATION ÉNERGÉTIQUE — PORT D'AGADIR
 * Règle d'or : Contrôle strict anti-double comptage.
 * Seules les arrivées générales marquées isAggregateMaster entrent dans le total site.
 */

export const Aggregations = {
  /**
   * Calcule la puissance et l'énergie totale du site sans double comptage.
   */
  calculateSiteTotals(postes, latestReadings) {
    let totalPower_kW = 0;
    let totalReactive_kVAR = 0;
    let masterPointsCount = 0;
    let subPointsCount = 0;
    let sumAllMetersRaw_kW = 0; // Somme naïve (avec doublons) pour démonstration du contrôle

    const substationsData = [];

    postes.forEach(poste => {
      let posteMasterPower_kW = 0;
      let posteSubPower_kW = 0;
      let posteReactive_kVAR = 0;
      let isCommunicating = true;

      poste.tableaux.forEach(tableau => {
        tableau.departs.forEach(depart => {
          const reading = latestReadings.get(depart.compteurId);
          if (!reading || reading.qualite !== 'OK') {
            if (depart.isAggregateMaster) isCommunicating = false;
            return;
          }

          const kw = reading.valeurs.puissanceActive_kW || 0;
          const kvar = reading.valeurs.puissanceReactive_kVAR || 0;
          sumAllMetersRaw_kW += kw;

          if (depart.isAggregateMaster) {
            masterPointsCount++;
            posteMasterPower_kW += kw;
            posteReactive_kVAR += kvar;
            totalPower_kW += kw;
            totalReactive_kVAR += kvar;
          } else {
            subPointsCount++;
            posteSubPower_kW += kw;
          }
        });
      });

      const cosPhi = posteMasterPower_kW > 0
        ? posteMasterPower_kW / Math.sqrt(posteMasterPower_kW * posteMasterPower_kW + posteReactive_kVAR * posteReactive_kVAR)
        : 0.95;

      // Statut visuel du poste
      let status = "OK";
      if (!isCommunicating) status = "OFFLINE";
      else if (posteMasterPower_kW > poste.seuilPuissance_kW) status = "CRITICAL";
      else if (cosPhi < 0.90) status = "WARNING";

      substationsData.push({
        id: poste.id,
        nom: poste.nom,
        zone: poste.zone,
        puissance_kW: Math.round(posteMasterPower_kW * 10) / 10,
        puissanceSouscrite_kVA: poste.puissanceSouscrite_kVA,
        seuilPuissance_kW: poste.seuilPuissance_kW,
        tauxChargePct: Math.round((posteMasterPower_kW / poste.puissanceSouscrite_kVA) * 100),
        cosPhi: Math.round(cosPhi * 1000) / 1000,
        status,
        subMetersPower_kW: Math.round(posteSubPower_kW * 10) / 10
      });
    });

    const siteCosPhi = totalPower_kW > 0
      ? totalPower_kW / Math.sqrt(totalPower_kW * totalPower_kW + totalReactive_kVAR * totalReactive_kVAR)
      : 0.95;

    return {
      totalPower_kW: Math.round(totalPower_kW * 10) / 10,
      totalReactive_kVAR: Math.round(totalReactive_kVAR * 10) / 10,
      cosPhi: Math.round(siteCosPhi * 1000) / 1000,
      substations: substationsData,
      antiDoubleCountProof: {
        masterCount: masterPointsCount,
        subCount: subPointsCount,
        validatedTotal_kW: Math.round(totalPower_kW * 10) / 10,
        naiveSumWithDoubles_kW: Math.round(sumAllMetersRaw_kW * 10) / 10,
        avoidedDuplicatePower_kW: Math.round((sumAllMetersRaw_kW - totalPower_kW) * 10) / 10
      }
    };
  }
};
