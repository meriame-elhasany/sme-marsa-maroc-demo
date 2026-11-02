/**
 * VUE ARCHITECTURE SYSTÈME — SYNOPTIQUE INTERACTIF 7 COUCHES (SVG)
 * Cloisonnement réseau OT/IT, bus Modbus TCP/IP et intégration SCADA/GTC existant.
 */

export const ViewArchitecture = {
  selectedLayerId: 2,

  layers: [
    {
      id: 1,
      titre: "Couche 1 : Terrain & Capteurs Électriques",
      color: "#3b82f6",
      desc: "Comprend les 6 postes 22 kV / 400 V, cellules moyenne tension, transformateurs de puissance, tores de courant (TC ouvrants classe 0.5S) et compteurs multifonctions industriels certifiés MID.",
      protocoles: "Courant secondaire 5A, tensions 400V triphasé",
      securite: "Plombage métrologique, isolation galvanique 4 kV"
    },
    {
      id: 2,
      titre: "Couche 2 : Communication & Bus Modbus TCP/IP",
      color: "#06b6d4",
      desc: "Réseau de communication sur paire torsadée blindée et fibre optique reliant les compteurs via switches Ethernet industriels durcis. Port 502 standard.",
      protocoles: "Modbus TCP/IP, Ethernet 100BASE-TX / 1000BASE-SX",
      securite: "VLAN de mesure dédié étanche (VLAN 12), filtrage par adresses MAC, aucun accès direct depuis Internet"
    },
    {
      id: 3,
      titre: "Couche 3 : Passerelles & Acquisition Locale",
      color: "#10b981",
      desc: "Passerelles de concentration Modbus assurant l'interrogation cyclique des compteurs (polling toutes les 2 secondes) et la mise en mémoire tampon locale (buffer anti-perte de trames en cas de coupure réseau).",
      protocoles: "Modbus TCP Client, NTP (synchronisation horaire)",
      securite: "Horloge temps réel synchronisée NTP, chien de garde logiciel (watchdog)"
    },
    {
      id: 4,
      titre: "Couche 4 : Stockage & Données Brutes",
      color: "#8b5cf6",
      desc: "Base de données horodatée (séries temporelles) stockant chaque mesure avec sa valeur brute, son unité légale, son horodatage source et son indicateur de qualité métrologique (OK / Invalide / Absent).",
      protocoles: "Stockage résilient, index partitionnés par poste",
      securite: "Intégrité des index, sauvegardes automatiques JSON chiffrées"
    },
    {
      id: 5,
      titre: "Couche 5 : Moteur Métier & Calculs ISO 50001",
      color: "#f59e0b",
      desc: "Cœur algorithmique effectuant les agrégations sans double comptage, le calcul des ratios d'intensité énergétique (kWh/EVP, kWh/Tonne), la comparaison à la SER (Baseline 2025) et le calcul CUSUM.",
      protocoles: "Règles mathématiques certifiées, corrélation données d'activité",
      securite: "Formules documentées, traçabilité des versions d'indicateurs"
    },
    {
      id: 6,
      titre: "Couche 6 : Présentation & IHM Web SCADA",
      color: "#ec4899",
      desc: "Interface utilisateur moderne 100 % web statique (Single Page Application responsive), graphiques temps réel, console d'alertes visuelles et assistant de mise en service.",
      protocoles: "HTML5, CSS3, ES Modules, Canvas/Chart.js",
      securite: "Navigation par hash, aucune vulnérabilité d'injection serveur"
    },
    {
      id: 7,
      titre: "Couche 7 : Exploitation & Gouvernance Portuaire",
      color: "#ef4444",
      desc: "Outils de décision pour les énergéticiens et la direction de Marsa Maroc : gestion des droits d'accès (RBAC), journal d'audit inaltérable, génération des rapports d'audit ISO 50001.",
      protocoles: "Exports CSV, impressions PDF officielles",
      securite: "Authentification à moindre privilège, journalisation complète des modifications"
    }
  ],

  render(container) {
    const active = this.layers.find(l => l.id === this.selectedLayerId) || this.layers[1];

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Architecture Système & Cloisonnement Réseau</h1>
          <div class="page-subtitle">Modèle en 7 couches — Système de Monitoring Énergétique (SME Marsa Maroc)</div>
        </div>
        <div class="anti-doublon-badge">
          <span>🔒 Cloisonnement OT/IT : PARE-FEU INDUSTRIEL</span>
        </div>
      </div>

      <!-- SYNOPTIQUE INTERACTIF SVG -->
      <div class="architecture-svg-container">
        <svg viewBox="0 0 900 480" width="100%" height="auto" style="display:block; max-height:480px;">
          <defs>
            <linearGradient id="grad-ot" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#0f172a" />
              <stop offset="100%" stop-color="#1e293b" />
            </linearGradient>
            <linearGradient id="grad-firewall" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ef4444" />
              <stop offset="100%" stop-color="#991b1b" />
            </linearGradient>
          </defs>

          <!-- Zone Réseau Opérationnel (OT) -->
          <rect x="20" y="20" width="410" height="440" rx="10" fill="url(#grad-ot)" stroke="#334155" stroke-width="2" />
          <text x="40" y="50" fill="#94a3b8" font-size="14" font-weight="bold">RÉSEAU INDUSTRIEL (OT) — VLAN MESURE 12</text>
          <text x="40" y="70" fill="#64748b" font-size="11">Sous-réseau étanche 192.168.12.0/24 (Portes et armoires TGBT)</text>

          <!-- Zone Réseau Tertiaire / Exploitation (IT) -->
          <rect x="470" y="20" width="410" height="440" rx="10" fill="url(#grad-ot)" stroke="#334155" stroke-width="2" />
          <text x="490" y="50" fill="#94a3b8" font-size="14" font-weight="bold">RÉSEAU UTILISATEURS / DÉCISION (IT)</text>
          <text x="490" y="70" fill="#64748b" font-size="11">Réseau d'exploitation Marsa Maroc — Postes clients & Navigateurs</text>

          <!-- Pare-feu Industriel (Séparation OT/IT) -->
          <rect x="437" y="30" width="26" height="420" rx="4" fill="url(#grad-firewall)" />
          <text x="454" y="240" fill="#ffffff" font-size="12" font-weight="bold" transform="rotate(-90 454 240)" text-anchor="middle" letter-spacing="3">PARE-FEU DMZ INDUSTRIELLE</text>

          <!-- Les 7 Couches Empilées (Clicables) -->
          <!-- Couche 1 : Terrain -->
          <g class="arch-layer" data-layer="1" transform="translate(40, 90)">
            <rect width="370" height="44" rx="6" fill="#1e3a8a" stroke="${this.selectedLayerId === 1 ? '#60a5fa' : '#3b82f6'}" stroke-width="${this.selectedLayerId === 1 ? '3' : '1'}" />
            <text x="15" y="26" fill="#ffffff" font-size="12" font-weight="bold">Couche 1 : Terrain (Postes 1-6, TC 0.5S, 22kV/400V)</text>
          </g>

          <!-- Couche 2 : Modbus TCP -->
          <g class="arch-layer" data-layer="2" transform="translate(40, 145)">
            <rect width="370" height="44" rx="6" fill="#083344" stroke="${this.selectedLayerId === 2 ? '#22d3ee' : '#06b6d4'}" stroke-width="${this.selectedLayerId === 2 ? '3' : '1'}" />
            <text x="15" y="26" fill="#ffffff" font-size="12" font-weight="bold">Couche 2 : Communication Modbus TCP/IP (Port 502)</text>
          </g>

          <!-- Couche 3 : Passerelles -->
          <g class="arch-layer" data-layer="3" transform="translate(40, 200)">
            <rect width="370" height="44" rx="6" fill="#064e3b" stroke="${this.selectedLayerId === 3 ? '#34d399' : '#10b981'}" stroke-width="${this.selectedLayerId === 3 ? '3' : '1'}" />
            <text x="15" y="26" fill="#ffffff" font-size="12" font-weight="bold">Couche 3 : Passerelles & Acquisition (Polling 2s, Buffer)</text>
          </g>

          <!-- Couche 4 : Stockage -->
          <g class="arch-layer" data-layer="4" transform="translate(40, 255)">
            <rect width="370" height="44" rx="6" fill="#4c1d95" stroke="${this.selectedLayerId === 4 ? '#a78bfa' : '#8b5cf6'}" stroke-width="${this.selectedLayerId === 4 ? '3' : '1'}" />
            <text x="15" y="26" fill="#ffffff" font-size="12" font-weight="bold">Couche 4 : Stockage Données Brutes & Qualité (NTP)</text>
          </g>

          <!-- Couche 5 : Moteur Métier ISO 50001 (Traverse pare-feu) -->
          <g class="arch-layer" data-layer="5" transform="translate(490, 145)">
            <rect width="370" height="55" rx="6" fill="#78350f" stroke="${this.selectedLayerId === 5 ? '#fcd34d' : '#f59e0b'}" stroke-width="${this.selectedLayerId === 5 ? '3' : '1'}" />
            <text x="15" y="24" fill="#ffffff" font-size="12" font-weight="bold">Couche 5 : Métier Énergétique (ISO 50001)</text>
            <text x="15" y="42" fill="#fde68a" font-size="10">Contrôle anti-doublon, calcul IPE (kWh/EVP), SER, CUSUM</text>
          </g>

          <!-- Couche 6 : Présentation IHM -->
          <g class="arch-layer" data-layer="6" transform="translate(490, 220)">
            <rect width="370" height="55" rx="6" fill="#831843" stroke="${this.selectedLayerId === 6 ? '#f472b6' : '#ec4899'}" stroke-width="${this.selectedLayerId === 6 ? '3' : '1'}" />
            <text x="15" y="24" fill="#ffffff" font-size="12" font-weight="bold">Couche 6 : Présentation & IHM Web (SCADA Responsive)</text>
            <text x="15" y="42" fill="#fbcfe8" font-size="10">Tableau de bord site, courbes Chart.js, fraîcheur mesures</text>
          </g>

          <!-- Couche 7 : Exploitation & Gouvernance -->
          <g class="arch-layer" data-layer="7" transform="translate(490, 295)">
            <rect width="370" height="55" rx="6" fill="#7f1d1d" stroke="${this.selectedLayerId === 7 ? '#fca5a5' : '#ef4444'}" stroke-width="${this.selectedLayerId === 7 ? '3' : '1'}" />
            <text x="15" y="24" fill="#ffffff" font-size="12" font-weight="bold">Couche 7 : Exploitation & Décision (RBAC & Audit)</text>
            <text x="15" y="42" fill="#fecaca" font-size="10">4 profils utilisateurs, gestion alertes, export CSV, PV essai</text>
          </g>

          <!-- Passerelle SCADA / GTC existant -->
          <g transform="translate(40, 320)">
            <rect width="370" height="50" rx="6" fill="#1e293b" stroke="#64748b" stroke-dasharray="4" />
            <text x="15" y="22" fill="#cbd5e1" font-size="11" font-weight="bold">Liaison GTC / SCADA Portuaire Existant</text>
            <text x="15" y="38" fill="#94a3b8" font-size="10">Récupération des états disjoncteurs sans perturber l'exploitation</text>
          </g>

          <!-- Légende en bas -->
          <text x="40" y="435" fill="#64748b" font-size="11">💡 Cliquez sur une couche pour afficher ses caractéristiques techniques détaillées</text>
        </svg>
      </div>

      <!-- FICHE TECHNIQUE DE LA COUCHE SÉLECTIONNÉE -->
      <div class="card" id="layer-details-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h2 style="font-size:1.15rem; font-weight:700; color:${active.color}; margin:0;">
            ${active.titre}
          </h2>
          <span class="badge-ref" style="background-color:rgba(255,255,255,0.1);">Couche ${active.id} sur 7</span>
        </div>

        <p style="font-size:13px; color:var(--text-secondary); line-height:1.6; margin-bottom:1rem;">
          ${active.desc}
        </p>

        <div class="grid-cards" style="margin-bottom:0;">
          <div style="padding:0.75rem 1rem; background-color:var(--bg-input); border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <div class="scada-metric-label">Protocoles & Normes Appliqués</div>
            <div style="font-size:12px; font-weight:600; color:var(--text-primary); margin-top:2px;">${active.protocoles}</div>
          </div>
          <div style="padding:0.75rem 1rem; background-color:var(--bg-input); border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <div class="scada-metric-label">Mesures de Sécurité & Fiabilité</div>
            <div style="font-size:12px; font-weight:600; color:var(--status-ok); margin-top:2px;">${active.securite}</div>
          </div>
        </div>
      </div>
    `;

    this._bindEvents(container);
  },

  _bindEvents(container) {
    container.querySelectorAll('.arch-layer').forEach(layer => {
      layer.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-layer'), 10);
        this.selectedLayerId = id;
        this.render(container);
      });
    });
  }
};
