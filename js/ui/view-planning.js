/**
 * VUE PLANNING D'EXÉCUTION — DIAGRAMME DE GANTT INTERACTIF
 * Jalons clés du déploiement : inventaire, pose, Modbus, plateforme, recette et formation.
 */

import { DB } from '../storage/db.js';

export const ViewPlanning = {
  render(container) {
    const gantt = DB.get(DB.keys.GANTT, []);
    const totalJours = 85;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Planning Prévisionnel de Déploiement (Gantt)</h1>
          <div class="page-subtitle">Découpage méthodologique en 9 jalons contractuels — Port d'Agadir (12/DEPA/2026)</div>
        </div>
        <div class="badge-ref" style="font-size:11px;">Durée estimée : 80 Jours Ouvrés</div>
      </div>

      <!-- BANDEAU MENTION DURÉES EXEMPLES -->
      <div style="background-color:rgba(234, 179, 8, 0.1); border:1px solid rgba(234, 179, 8, 0.3); border-radius:var(--radius-md); padding:0.75rem 1rem; margin-bottom:1.5rem; display:flex; align-items:center; gap:0.75rem;">
        <span style="font-size:1.2rem;">📅</span>
        <span style="font-size:12px; color:#fef08a;">
          <strong>Durées indicatives :</strong> Les délais ci-dessous sont des <em>exemples illustratifs à ajuster avec la DEPA Marsa Maroc</em> selon les contraintes de disponibilité des coupures électriques sur les quais.
        </span>
      </div>

      <!-- DIAGRAMME DE GANTT -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-title">
          <span>Chronogramme des Jalons de Déploiement</span>
          <span style="font-size:11px; color:var(--text-muted);">Progression globale : ~80 %</span>
        </div>

        <div class="gantt-chart">
          ${gantt.map(item => {
            const leftPct = Math.round((item.debutJour / totalJours) * 100);
            const widthPct = Math.round((item.dureeJours / totalJours) * 100);

            return `
              <div class="gantt-row">
                <div>
                  <div style="font-size:12px; font-weight:700; color:var(--text-primary);">${item.jalon}</div>
                  <div style="font-size:10px; color:var(--text-muted);">${item.responsable} • ${item.dureeJours} jours</div>
                </div>

                <div class="gantt-bar-track">
                  <div class="gantt-bar-fill" style="left:${leftPct}%; width:${widthPct}%;">
                    ${item.progression}%
                  </div>
                </div>

                <div style="text-align:right;">
                  <span class="badge-ref" style="font-size:10px;">${item.progression === 100 ? 'ACHEVÉ' : 'EN COURS'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- SYNTHÈSE DES ENGAGEMENTS MÉTHODOLOGIQUES -->
      <div class="grid-cards">
        <div class="card">
          <div class="card-title">Visite Terrain Préalable</div>
          <p style="font-size:12px; color:var(--text-secondary); line-height:1.6;">
            Reconnaissance détaillée des 6 postes (encombrement TGBT, calibres tores TC existants, longueurs de câblage) afin de figer le schéma d'implantation sans arrêt non planifié d'exploitation portuaire.
          </p>
        </div>

        <div class="card">
          <div class="card-title">Continuité d'Exploitation</div>
          <p style="font-size:12px; color:var(--text-secondary); line-height:1.6;">
            Raccordement des tores TC ouvrants sous tension ou lors des créneaux de maintenance programmée des quais pour préserver les opérations de chargement/déchargement navires.
          </p>
        </div>

        <div class="card">
          <div class="card-title">Recette Mixte & Clés en Main</div>
          <p style="font-size:12px; color:var(--text-secondary); line-height:1.6;">
            Exécution conjointe des 15 tests SAT (T01 à T15) avec signature contradictoire des procès-verbaux avant délivrance de la réception provisoire.
          </p>
        </div>
      </div>
    `;
  }
};
