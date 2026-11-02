/**
 * MOTEUR CENTRAL DE SIMULATION TEMPS RÉEL — PORT D'AGADIR
 * Cadence dynamique (x1, x10, x60) — Génération physique & traçabilité
 */

import { DB } from '../storage/db.js';
import { getHarborPowerEstimate } from './harbor-profiles.js';
import { FaultInjector } from './fault-injector.js';

export const SimEngine = {
  speed: 1, // 1 = x1 temps réel, 10 = x10, 60 = x60
  simulatedTime: new Date(),
  timerId: null,
  tickIntervalMs: 1000,
  
  // Cache des dernières mesures par compteur
  latestReadings: new Map(),
  
  // Historique glissant pour les graphiques temps réel (60 points)
  siteHistory: [],
  substationHistory: new Map(), // P1..P6 -> array de { time, kW, cosPhi }

  listeners: new Set(),

  init() {
    this.simulatedTime = new Date();
    this._initCumulativeCounters();
    this.start();
  },

  _initCumulativeCounters() {
    // Initialise des index de compteurs réalistes (en MWh / kWh)
    const compteurs = DB.get(DB.keys.COMPTEURS, []);
    compteurs.forEach(c => {
      if (!this.latestReadings.has(c.id)) {
        const baseIndex = 120000 + Math.random() * 50000;
        this.latestReadings.set(c.id, {
          compteurId: c.id,
          timestampMesure: new Date().toISOString(),
          timestampReception: new Date().toISOString(),
          qualite: "OK",
          valeurs: {
            puissanceActive_kW: 250,
            puissanceReactive_kVAR: 65,
            puissanceApparente_kVA: 258,
            energieActiveImport_kWh: baseIndex,
            energieActiveExport_kWh: 0,
            tensionL1_V: 230.5,
            tensionL2_V: 231.2,
            tensionL3_V: 229.8,
            courantL1_A: 362,
            courantL2_A: 360,
            courantL3_A: 365,
            frequence_Hz: 50.01,
            facteurPuissance: 0.965
          }
        });
      }
    });
  },

  setSpeed(newSpeed) {
    this.speed = newSpeed;
    this.notifyListeners({ type: 'SPEED_CHANGE', speed: newSpeed });
  },

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  },

  notifyListeners(data) {
    this.listeners.forEach(cb => {
      try {
        cb(data);
      } catch (e) {
        console.error("Erreur listener simulation:", e);
      }
    });
  },

  start() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => this.tick(), this.tickIntervalMs);
  },

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  },

  tick() {
    // Avancement de l'horloge simulée selon le facteur de vitesse
    const deltaSeconds = (this.tickIntervalMs / 1000) * this.speed;
    this.simulatedTime = new Date(this.simulatedTime.getTime() + deltaSeconds * 1000);
    
    const hourFloat = this.simulatedTime.getHours() + this.simulatedTime.getMinutes() / 60;
    const isWeekend = this.simulatedTime.getDay() === 0 || this.simulatedTime.getDay() === 6;

    const postes = DB.get(DB.keys.POSTES, []);
    const compteurs = DB.get(DB.keys.COMPTEURS, []);

    let totalSitePower_kW = 0;
    let totalSiteReactive_kVAR = 0;

    // Simulation de chaque poste et de ses compteurs
    postes.forEach(poste => {
      // Puissance totale cible du poste via profil portuaire
      const posteTargetPower = getHarborPowerEstimate(poste.id, hourFloat, isWeekend);
      
      // Répartition entre arrivées et départs
      poste.tableaux.forEach(tableau => {
        tableau.departs.forEach(depart => {
          const compteur = compteurs.find(c => c.id === depart.compteurId);
          if (!compteur) return;

          const isDisconnected = FaultInjector.isDisconnected(compteur.id);
          const isDropped = FaultInjector.isPacketDropped(compteur.id);
          const abnormal = FaultInjector.getAbnormalValue(compteur.id);

          const previousReading = this.latestReadings.get(compteur.id);
          let prevEnergy = previousReading ? previousReading.valeurs.energieActiveImport_kWh : 100000;

          // Détermination de la puissance du départ
          let kw = 0;
          if (depart.isAggregateMaster) {
            kw = posteTargetPower;
          } else {
            // Sous-comptage : fraction du poste
            kw = posteTargetPower * 0.45;
          }

          // Facteur de puissance nominal ~0.94 - 0.98
          let cosPhi = 0.96 + (Math.random() - 0.5) * 0.04;
          if (compteur.id === 'CMP-P1-002') cosPhi = 0.88; // Cas illustratif légèrement dégradé

          let qualite = "OK";

          if (isDisconnected) {
            qualite = "ABSENTE";
            compteur.modbus.status = "TIMEOUT";
          } else if (isDropped) {
            qualite = "ABSENTE";
          } else if (abnormal) {
            qualite = "INVALIDE";
            if (abnormal.field === 'puissanceActive_kW') kw = abnormal.val;
          } else {
            compteur.modbus.status = "CONNECTED";
            compteur.modbus.derniereCommunication = this.simulatedTime.toISOString();
          }

          // Calcul incrémental d'énergie active : ΔE = P(kW) * Δt(h)
          if (qualite === "OK") {
            const deltaEnergy = (kw * deltaSeconds) / 3600;
            prevEnergy += deltaEnergy;
          }

          const kvar = qualite === "OK" ? kw * Math.tan(Math.acos(Math.min(1, Math.max(0.1, cosPhi)))) : 0;
          const kva = qualite === "OK" ? Math.sqrt(kw * kw + kvar * kvar) : 0;
          const vL1 = qualite === "OK" ? 230 + (Math.random() - 0.5) * 4 : 0;
          const iL1 = (qualite === "OK" && vL1 > 0) ? (kw * 1000) / (Math.sqrt(3) * 400 * cosPhi) : 0;
          const freq = qualite === "OK" ? 50.0 + (Math.random() - 0.5) * 0.08 : 0;

          const reading = {
            compteurId: compteur.id,
            timestampMesure: this.simulatedTime.toISOString(),
            timestampReception: new Date().toISOString(),
            qualite,
            valeurs: {
              puissanceActive_kW: Math.round(kw * 10) / 10,
              puissanceReactive_kVAR: Math.round(kvar * 10) / 10,
              puissanceApparente_kVA: Math.round(kva * 10) / 10,
              energieActiveImport_kWh: Math.round(prevEnergy * 10) / 10,
              energieActiveExport_kWh: 0,
              tensionL1_V: Math.round(vL1 * 10) / 10,
              courantL1_A: Math.round(iL1 * 10) / 10,
              frequence_Hz: Math.round(freq * 100) / 100,
              facteurPuissance: Math.round(cosPhi * 1000) / 1000
            }
          };

          this.latestReadings.set(compteur.id, reading);

          // RÈGLE ANTI-DOUBLE COMPTAGE ABSOLUE :
          // Seules les arrivées générales (TR) marquées isAggregateMaster entrent dans le total du site !
          if (depart.isAggregateMaster && qualite === "OK") {
            totalSitePower_kW += kw;
            totalSiteReactive_kVAR += kvar;
          }
        });
      });
    });

    // Sauvegarde de l'état Modbus des compteurs
    DB.set(DB.keys.COMPTEURS, compteurs);

    // Facteur de puissance moyen global du site
    const globalCosPhi = totalSitePower_kW > 0
      ? totalSitePower_kW / Math.sqrt(totalSitePower_kW * totalSitePower_kW + totalSiteReactive_kVAR * totalSiteReactive_kVAR)
      : 0.95;

    // Archivage pour historique temps réel du site
    const timeLabel = this.simulatedTime.toLocaleTimeString();
    this.siteHistory.push({
      time: timeLabel,
      timestamp: this.simulatedTime.getTime(),
      totalPower_kW: Math.round(totalSitePower_kW * 10) / 10,
      totalReactive_kVAR: Math.round(totalSiteReactive_kVAR * 10) / 10,
      cosPhi: Math.round(globalCosPhi * 1000) / 1000
    });

    if (this.siteHistory.length > 60) this.siteHistory.shift();

    // Notification globale aux composants
    this.notifyListeners({
      type: 'TICK',
      simulatedTime: this.simulatedTime,
      siteTotalPower_kW: Math.round(totalSitePower_kW * 10) / 10,
      globalCosPhi: Math.round(globalCosPhi * 1000) / 1000,
      speed: this.speed
    });
  },

  getReading(compteurId) {
    return this.latestReadings.get(compteurId) || null;
  },

  getFreshness(timestampIso) {
    if (!timestampIso) return { status: 'stale', label: 'Inconnu' };
    const ageSeconds = (Date.now() - new Date(timestampIso).getTime()) / 1000;
    if (ageSeconds < 5) {
      return { status: 'realtime', label: 'Temps Réel (<5s)' };
    } else if (ageSeconds < 30) {
      return { status: 'delayed', label: 'Différé' };
    } else {
      return { status: 'stale', label: 'Périmé (>30s)' };
    }
  }
};
