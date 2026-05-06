/* ════════════════════════════════════════════════════
   CONFIG
════════════════════════════════════════════════════ */
const CONFIG = {
  AUTO_TICK_MS:           50,
  HOLD_DURATION_MS:     2500,
  HOLD_INTERVAL_MIN:   12000,
  HOLD_INTERVAL_MAX:   25000,
  HOLD_BONUS_MULT:        25,
  COMBO_RESET_MS:       2500,
  COMBO_TIERS: [
    { at:  3, mult:   4,  label: '×4'   },
    { at:  8, mult:  10,  label: '×10'  },
    { at: 15, mult:  25,  label: '×25'  },
    { at: 25, mult:  60,  label: '×60'  },
    { at: 40, mult: 120,  label: '×120' },
    { at: 60, mult: 250,  label: '×250' },
    { at:100, mult: 500,  label: '×500' },
  ],
  COMBO_CRIT_THRESHOLD:   15,
  COMBO_CRIT_CHANCE:    0.20,
  COMBO_CRIT_MULT:         2,
  HEAT_PER_TAP:            8,
  HEAT_DECAY_RATE:        60,
  HEAT_OVERHEAT:         100,
  HEAT_COOLDOWN_MS:     7000,
  PRESTIGE_BASE:       10000,
  PRESTIGE_SCALE:          2,
  PRESTIGE_BONUS_STEP:   0.5,
  PRESTIGE_DIAMONDS:      10,
  PRESTIGE_MAX:           10,
  AWARD_DIAMONDS:          1,
  MINIGAME_SPEED:          1.3,
  MINIGAME_PERFECT:       0.10,
  MINIGAME_SWEET:         0.20,
  MINIGAME_PERFECT_MULT:   1.5,
  MINIGAME_GOOD_MULT:      1.0,
  MINIGAME_MISS_MULT:      0.25,
  HOT_SPOT_VISIBLE_MS:    600,
  HOT_SPOT_PAUSE_MS:       80,
  HOT_SPOT_HIT_RADIUS:   0.24,
};

/* ════════════════════════════════════════════════════
   UPGRADE DEFINITIONS
════════════════════════════════════════════════════ */
const SKILL_DEFS = [
  { id:'sk-0', icon:'🏀', name:'Better Ball',    desc:'+2 taps per click',   cost:500,     clickAdd:2,  isMulti:false, multiVal:1, unlocks:'sk-1' },
  { id:'sk-1', icon:'💪', name:'Strong Arm',     desc:'+8 taps per click',   cost:5000,    clickAdd:8,  isMulti:false, multiVal:1, unlocks:'sk-2' },
  { id:'sk-2', icon:'⚡', name:'Lightning Tap',  desc:'+20 taps per click',  cost:30000,   clickAdd:20, isMulti:false, multiVal:1, unlocks:'sk-3' },
  { id:'sk-3', icon:'🔥', name:'On Fire',        desc:'×2 multiplier',       cost:150000,  clickAdd:0,  isMulti:true,  multiVal:2, unlocks:'sk-4' },
  { id:'sk-4', icon:'👑', name:'MVP',            desc:'×3 multiplier',       cost:1000000, clickAdd:0,  isMulti:true,  multiVal:3, unlocks:null   },
];

const AUTO_DEFS = [
  { id:'au-0', icon:'🤖', name:'Auto Dribble',   desc:'+1 tap/s — first step',  cost:5000,    autoAdd:1,   unlocks:'au-1' },
  { id:'au-1', icon:'🏟️', name:'Stadium',        desc:'+8 taps/s',              cost:50000,   autoAdd:8,   unlocks:'au-2' },
  { id:'au-2', icon:'🛸', name:'Hyperdrive',     desc:'+50 taps/s',             cost:300000,  autoAdd:50,  unlocks:'au-3' },
  { id:'au-3', icon:'🌌', name:'Galaxy Bot',     desc:'+200 taps/s',            cost:1500000, autoAdd:200, unlocks:null   },
];

/* Awards */
const AWARD_DEFS = [
  { id:'aw-100',    goal:100,       icon:'🏀', name:'First Steps',    desc:'Reach 100 taps'        },
  { id:'aw-1k',     goal:1000,      icon:'⭐', name:'Getting Serious', desc:'Reach 1,000 taps'     },
  { id:'aw-10k',    goal:10000,     icon:'🔥', name:'Heating Up',     desc:'Reach 10,000 taps'     },
  { id:'aw-50k',    goal:50000,     icon:'💯', name:'Dedicated',      desc:'Reach 50,000 taps'     },
  { id:'aw-250k',   goal:250000,    icon:'🏆', name:'Contender',      desc:'Reach 250,000 taps'   },
  { id:'aw-1m',     goal:1000000,   icon:'👑', name:'Legend',         desc:'Reach 1,000,000 taps' },
  { id:'aw-10m',    goal:10000000,  icon:'🌟', name:'NBA Star',       desc:'Reach 10M taps'       },
  { id:'aw-100m',   goal:100000000, icon:'🚀', name:'Hall of Fame',   desc:'Reach 100M taps'      },
];

/* Daily quest pool */
const QUEST_POOL = [
  { id:'qt1', type:'taps',  goal:1000,   desc:'Tap 1,000 times today',   reward:2  },
  { id:'qt2', type:'taps',  goal:5000,   desc:'Tap 5,000 times today',   reward:5  },
  { id:'qt3', type:'taps',  goal:25000,  desc:'Tap 25,000 times today',  reward:10 },
  { id:'qt4', type:'combo', goal:15,     desc:'Reach 15× combo',         reward:3  },
  { id:'qt5', type:'combo', goal:40,     desc:'Reach 40× combo',         reward:7  },
  { id:'qt6', type:'combo', goal:80,     desc:'Reach 80× combo',         reward:14 },
  { id:'qt7', type:'holds', goal:2,      desc:'Complete 2 hold events',  reward:3  },
  { id:'qt8', type:'holds', goal:5,      desc:'Complete 5 hold events',  reward:8  },
  { id:'qt9', type:'holds', goal:10,     desc:'Complete 10 hold events', reward:14 },
];

/* ════════════════════════════════════════════════════
   STATE — single source of truth
════════════════════════════════════════════════════ */
const state = {
  taps:        0,
  clickPower:  1,
  autoTps:     0,
  multi:       1,
  record:      0,
  diamonds:    0,
  lifetimeTaps:0,
  skillBought: {},
  autoBought:  {},
  awardClaimed:{},
  combo:       0,
  comboTimer:  null,
  heat:        0,
  overheated:  false,
  lastTapTime: 0,
  holdEventActive: false,
  holdInProgress:  false,
  holdStartTime:   null,
  holdRafId:       null,
  comboPausedAt:   null,
  minigameActive:    false,
  minigameStartTime: null,
  minigameMarkerPos: 0.5,
  minigameRafId:     null,
  prestigeLevel:   0,
  prestigeBonus:   1,
  sessionStart:    Date.now(),
  openSheetPanel:  null,
  hotSpot:    { nx: 0.5, ny: 0.5, active: false },
  questDate:     '',
  questSlots:    [],
  questTaps:     0,
  questMaxCombo: 0,
  questHolds:    0,
};

/* ════════════════════════════════════════════════════
   DOM REFS
════════════════════════════════════════════════════ */
const dom = {
  tapNumber:      document.getElementById('tap-number'),
  recordVal:      document.getElementById('record-val'),
  clickPowerD:    document.getElementById('click-power-display'),
  diamondDisplay: document.getElementById('diamond-display'),
  statTps:        document.getElementById('stat-tps'),
  statMulti:      document.getElementById('stat-multi'),
  hoopWrap:       document.getElementById('hoop-wrap'),
  holdBackdrop:   document.getElementById('hold-backdrop'),
  ball:           document.getElementById('ball'),
  ballWrap:       document.getElementById('ball-wrap'),
  ringSvg:        document.getElementById('ring-svg'),
  ringProgress:   document.getElementById('ring-progress'),
  holdPrompt:     document.getElementById('hold-prompt'),
  holdBarWrap:    document.getElementById('hold-bar-wrap'),
  holdBar:        document.getElementById('hold-bar'),
  comboDisplay:   document.getElementById('combo-display'),
  heatBar:        document.getElementById('heat-bar'),
  heatVal:        document.getElementById('heat-val'),
  centerEl:       document.getElementById('center-el'),
  skillCards:     document.getElementById('skill-cards'),
  autoCards:      document.getElementById('auto-cards'),
  awardsList:     document.getElementById('awards-list'),
  prestigeContent:document.getElementById('prestige-content'),
  questsContent:  document.getElementById('quest-cards'),
  hotSpotEl:      document.getElementById('hot-spot'),
  bottomSheet:    document.getElementById('bottom-sheet'),
  sheetBackdrop:  document.getElementById('sheet-backdrop'),
  sheetContent:   document.getElementById('sheet-content'),
  sheetTitle:     document.getElementById('sheet-title'),
  prestigeOverlay:document.getElementById('prestige-overlay'),
  prestigeModalBody:document.getElementById('prestige-modal-body'),
  timingBarWrap:  document.getElementById('timing-bar-wrap'),
  timingMarker:   document.getElementById('timing-marker'),
};

/* ════════════════════════════════════════════════════
   PANEL SWITCHING (desktop)
════════════════════════════════════════════════════ */
function showPanel(name, btnEl) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.icon-nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  btnEl.classList.add('active');
}

/* ════════════════════════════════════════════════════
   MOBILE BOTTOM SHEET
════════════════════════════════════════════════════ */
const SHEET_LABELS = { skills:'Skills', auto:'Automation', awards:'Awards', quests:'📋 Quests', prestige:'👑 Prestige' };

function openSheet(panelId, btnEl) {
  document.querySelectorAll('.mob-btn[data-sheet]').forEach(b => b.classList.remove('active','p-active'));
  if (btnEl) btnEl.classList.add(panelId === 'prestige' ? 'p-active' : 'active');

  state.openSheetPanel = panelId;
  dom.sheetTitle.textContent = SHEET_LABELS[panelId] || panelId;
  renderSheetContent();

  dom.bottomSheet.classList.add('open');
  dom.sheetBackdrop.classList.add('open');
}

function closeSheet() {
  dom.bottomSheet.classList.remove('open');
  dom.sheetBackdrop.classList.remove('open');
  document.querySelectorAll('.mob-btn').forEach(b => b.classList.remove('active','p-active'));
  state.openSheetPanel = null;
}

function renderSheetContent() {
  if (!state.openSheetPanel) return;
  dom.sheetContent.innerHTML = buildPanelHTML(state.openSheetPanel);
}

/* ════════════════════════════════════════════════════
   HTML BUILDERS
════════════════════════════════════════════════════ */
function buildPanelHTML(panelId) {
  if (panelId === 'skills')   return buildSkillCardsHTML();
  if (panelId === 'auto')     return buildAutoHTML();
  if (panelId === 'awards')   return buildAwardsHTML();
  if (panelId === 'quests')   return buildQuestsHTML();
  if (panelId === 'prestige') return buildPrestigeHTML();
  return '';
}

function buildSkillCardsHTML() {
  const tier  = getComboMultiplier();
  const nextT = CONFIG.COMBO_TIERS.find(t => t.at > state.combo);

  const comboInfo = `
    <div class="stat-row" style="margin-bottom:6px">
      <div class="stat-label">Combo boost</div>
      <div class="stat-value">${tier.label}</div>
    </div>
    <div class="stat-row" style="margin-bottom:10px">
      <div class="stat-label">${nextT ? `Next tier at ${nextT.at}× combo` : 'MAX tier reached!'}</div>
      <div class="stat-value" style="font-size:14px;color:var(--muted)">${state.combo > 0 ? state.combo + '× streak' : '—'}</div>
    </div>`;

  const cards = SKILL_DEFS.map((def, i) => {
    const bought    = !!state.skillBought[def.id];
    const locked    = i > 0 && !state.skillBought[SKILL_DEFS[i - 1].id];
    const canAfford = state.taps >= def.cost;
    const cls       = bought ? 'bought' : locked ? 'locked' : '';
    const attr      = (!bought && !locked) ? `data-id="${def.id}"` : '';
    const connector = i < SKILL_DEFS.length - 1 ? '<div class="tree-connector"></div>' : '';

    return `
      <div class="card ${cls}" ${attr}>
        <div class="card-icon">${def.icon}</div>
        <div class="card-body">
          <div class="card-name">${def.name}${bought ? ' ✓' : ''}</div>
          <div class="card-desc">${def.desc}</div>
        </div>
        <div class="card-cost ${canAfford || bought || locked ? '' : 'dim'}">${fmt(def.cost)}</div>
      </div>${connector}`;
  }).join('');

  return comboInfo + '<div class="panel-title" style="margin-top:4px">Skill Tree</div>' + cards;
}

function buildAutoHTML() {
  const cards = AUTO_DEFS.map((def, i) => {
    const bought  = !!state.autoBought[def.id];
    const locked  = i > 0 && !state.autoBought[AUTO_DEFS[i-1].id];
    const cls = bought ? 'bought' : locked ? 'locked' : '';
    const attr = (!bought && !locked) ? `data-id="${def.id}"` : '';
    const connector = i < AUTO_DEFS.length - 1 ? '<div class="tree-connector"></div>' : '';

    return `
      <div class="card ${cls}" ${attr}>
        <div class="card-icon">${def.icon}</div>
        <div class="card-body">
          <div class="card-name">${def.name}${bought ? ' ✓' : ''}</div>
          <div class="card-desc">${def.desc}</div>
        </div>
        <div class="card-cost">${fmtBig(def.cost)}</div>
      </div>${connector}`;
  }).join('');

  return `
    <div class="stat-row"><div class="stat-label">Taps / sec</div><div class="stat-value">${(state.autoTps*state.multi).toFixed(1)}</div></div>
    <div class="stat-row"><div class="stat-label">Multiplier</div><div class="stat-value">×${state.multi}</div></div>
    <div style="height:10px"></div>
    ${cards}`;
}

function buildAwardsHTML() {
  const t = Math.floor(state.lifetimeTaps);
  return AWARD_DEFS.map(def => {
    const claimed = !!state.awardClaimed[def.id];
    const pct     = Math.min(100, (t / def.goal) * 100);
    const cls     = claimed ? 'unlocked' : '';
    return `
      <div class="award-card ${cls}">
        <div class="award-icon">${def.icon}</div>
        <div class="award-body">
          <div class="award-name">${def.name}${claimed ? ' ✓' : ''}</div>
          <div class="award-sub">💎 +1 diamond on unlock</div>
          <div class="award-bar-wrap"><div class="award-bar" style="width:${pct}%"></div></div>
        </div>
        <div class="award-goal">${fmtBig(def.goal)}</div>
      </div>`;
  }).join('');
}

function buildPrestigeHTML() {
  const threshold = nextPrestigeThreshold();
  const maxed     = state.prestigeLevel >= CONFIG.PRESTIGE_MAX;
  const canP      = !maxed && state.taps >= threshold;
  const nextBonus = (1 + (state.prestigeLevel + 1) * CONFIG.PRESTIGE_BONUS_STEP).toFixed(1);
  return `
    <div class="prestige-stat"><div class="prestige-stat-label">Prestige level</div><div class="prestige-stat-value">${state.prestigeLevel} / ${CONFIG.PRESTIGE_MAX}</div></div>
    <div class="prestige-stat"><div class="prestige-stat-label">Bonus multiplier</div><div class="prestige-stat-value">×${state.prestigeBonus.toFixed(1)}</div></div>
    <div class="prestige-stat"><div class="prestige-stat-label">Diamonds</div><div class="prestige-stat-value diamond">💎 ${state.diamonds}</div></div>
    <div class="prestige-stat"><div class="prestige-stat-label">Lifetime taps</div><div class="prestige-stat-value">${fmtBig(Math.floor(state.lifetimeTaps))}</div></div>
    ${maxed
      ? '<div class="prestige-requirement" style="color:var(--yellow)">👑 MAX PRESTIGE REACHED</div>'
      : `<button class="prestige-btn" ${canP ? '' : 'disabled'}>👑 Prestige</button>
         ${!canP ? `<div class="prestige-requirement">Need <b>${fmtBig(threshold)}</b> taps · +<b>10 💎</b> on prestige</div>` : ''}`
    }`;
}

/* ════════════════════════════════════════════════════
   DAILY QUESTS
════════════════════════════════════════════════════ */
function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getDailyQuestCount() {
  const p = state.prestigeLevel;
  if (p >= 8) return 5;
  if (p >= 6) return 4;
  if (p >= 4) return 3;
  if (p >= 2) return 2;
  return 1;
}

function selectDailyQuests(dateStr, count) {
  let s = dateStr.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
  const picked = [];
  while (picked.length < count && picked.length < QUEST_POOL.length) {
    s = Math.imul(s, 1664525) + 1013904223 | 0;
    const idx = Math.abs(s) % QUEST_POOL.length;
    if (!picked.includes(idx)) picked.push(idx);
  }
  return picked.map(i => QUEST_POOL[i]);
}

function initQuests() {
  const today = getTodayStr();
  if (state.questDate === today && state.questSlots.length > 0) return;
  const count    = getDailyQuestCount();
  const selected = selectDailyQuests(today, count);
  state.questDate     = today;
  state.questTaps     = 0;
  state.questMaxCombo = 0;
  state.questHolds    = 0;
  state.questSlots    = selected.map(q => ({ id: q.id, progress: 0, claimed: false }));
}

function syncQuestProgress() {
  state.questSlots.forEach(slot => {
    if (slot.claimed) return;
    const def = QUEST_POOL.find(q => q.id === slot.id);
    if (!def) return;
    if (def.type === 'taps')  slot.progress = Math.min(state.questTaps,     def.goal);
    if (def.type === 'combo') slot.progress = Math.min(state.questMaxCombo, def.goal);
    if (def.type === 'holds') slot.progress = Math.min(state.questHolds,    def.goal);
  });
}

function claimQuest(id) {
  const slot = state.questSlots.find(s => s.id === id);
  const def  = QUEST_POOL.find(q => q.id === id);
  if (!slot || !def || slot.claimed || slot.progress < def.goal) return;
  slot.claimed    = true;
  state.diamonds += def.reward;
  showDiamondNotify(`+${def.reward} 💎 — Quest complete!`);
  render();
  saveGame();
}

function getNextMidnightStr() {
  const now  = new Date();
  const diff = new Date(now).setHours(24, 0, 0, 0) - now;
  const h    = Math.floor(diff / 3600000);
  const m    = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function buildQuestsHTML() {
  const today = getTodayStr();
  if (state.questDate !== today) initQuests();
  syncQuestProgress();

  const icon = { taps:'🏀', combo:'🔥', holds:'⚡' };

  const questsHtml = state.questSlots.map(slot => {
    const def  = QUEST_POOL.find(q => q.id === slot.id);
    if (!def) return '';
    const pct     = Math.min(100, (slot.progress / def.goal) * 100);
    const done    = slot.progress >= def.goal;
    const cls     = slot.claimed ? 'claimed' : done ? 'done' : '';
    return `
      <div class="quest-card ${cls}">
        <div class="quest-icon">${icon[def.type] || '📋'}</div>
        <div class="quest-body">
          <div class="quest-name">${def.desc}</div>
          <div class="quest-bar-wrap"><div class="quest-bar" style="width:${pct}%"></div></div>
          <div class="quest-sub">${slot.progress.toLocaleString()} / ${def.goal.toLocaleString()}</div>
        </div>
        <div class="quest-right">
          <div class="quest-reward">💎 ${def.reward}</div>
          ${done && !slot.claimed ? `<button class="quest-claim-btn" data-qid="${def.id}">Claim</button>` : ''}
          ${slot.claimed ? '<div class="quest-done-mark">✓</div>' : ''}
        </div>
      </div>`;
  }).join('');

  return `
    <div class="quest-header-row">
      <div class="quest-count-label">Daily Quests (${state.questSlots.length})</div>
      <div class="quest-reset-label">Resets in ${getNextMidnightStr()}</div>
    </div>
    ${questsHtml}`;
}

/* ════════════════════════════════════════════════════
   RENDER
════════════════════════════════════════════════════ */
function renderCounters() {
  const t   = Math.floor(state.taps);
  const tps = (state.autoTps * state.multi * state.prestigeBonus).toFixed(1);
  const pw  = Math.floor(state.clickPower * state.multi * state.prestigeBonus);
  dom.tapNumber.textContent      = fmt(t);
  dom.recordVal.textContent      = fmtBig(state.record);
  dom.diamondDisplay.textContent = state.diamonds;
  dom.clickPowerD.textContent    = pw;
  dom.statTps.textContent        = tps;
  dom.statMulti.textContent      = '×' + state.multi;
  updateComboDisplay();
  updateHeatBar();
  checkAwards();
}

function render() {
  renderCounters();
  dom.skillCards.innerHTML      = buildSkillCardsHTML();
  dom.autoCards.innerHTML       = buildAutoHTML().replace(/<div class="stat-row">[\s\S]*?<\/div>\s*<\/div>\s*<div class="stat-row">[\s\S]*?<\/div>\s*<\/div>\s*<div style="height:10px"><\/div>/,'');
  dom.awardsList.innerHTML      = buildAwardsHTML();
  dom.questsContent.innerHTML   = buildQuestsHTML();
  dom.prestigeContent.innerHTML = buildPrestigeHTML();
  const canPrestige = state.prestigeLevel < CONFIG.PRESTIGE_MAX && state.taps >= nextPrestigeThreshold();
  document.querySelector('.icon-nav-btn.prestige-nav')?.classList.toggle('ready', canPrestige);
  document.querySelector('.mob-btn[data-sheet="prestige"]')?.classList.toggle('p-ready', canPrestige);
  renderSheetContent();
}

/* ════════════════════════════════════════════════════
   AWARD CHECK
════════════════════════════════════════════════════ */
function checkAwards() {
  const t = Math.floor(state.lifetimeTaps);
  AWARD_DEFS.forEach(def => {
    if (!state.awardClaimed[def.id] && t >= def.goal) {
      state.awardClaimed[def.id] = true;
      state.diamonds += CONFIG.AWARD_DIAMONDS;
      showDiamondNotify(`🏆 ${def.name} — +${CONFIG.AWARD_DIAMONDS} 💎`);
      saveGame();
    }
  });
}

/* ════════════════════════════════════════════════════
   COMBO
════════════════════════════════════════════════════ */
function getComboMultiplier() {
  const tiers = [...CONFIG.COMBO_TIERS].reverse();
  for (const tier of tiers) {
    if (state.combo >= tier.at) return tier;
  }
  return { mult: 1, label: '×1' };
}

function resetCombo() {
  state.combo = 0;
  dom.comboDisplay.classList.add('hidden');
}

function updateComboDisplay() {
  if (state.combo < 1) { dom.comboDisplay.classList.add('hidden'); return; }
  const tier   = getComboMultiplier();
  const isCrit = state.combo >= CONFIG.COMBO_CRIT_THRESHOLD;
  dom.comboDisplay.classList.remove('hidden');
  dom.comboDisplay.textContent = isCrit
    ? `💥 ${state.combo}× COMBO  ${tier.label}  CRIT READY`
    : `${state.combo}× COMBO  ${tier.label}`;
}

/* ════════════════════════════════════════════════════
   HEAT
════════════════════════════════════════════════════ */
function applyHeat() {
  state.lastTapTime = Date.now();
  state.heat = Math.min(state.heat + CONFIG.HEAT_PER_TAP, CONFIG.HEAT_OVERHEAT);
  if (state.heat >= CONFIG.HEAT_OVERHEAT) triggerOverheat();
}

function triggerOverheat() {
  state.overheated = true;
  resetCombo();
  dom.ball.classList.add('overheated');
  setTimeout(() => {
    state.overheated = false;
    state.heat = 0;
    dom.ball.classList.remove('overheated');
    updateHeatBar();
  }, CONFIG.HEAT_COOLDOWN_MS);
}

function updateHeatBar() {
  const pct    = state.heat;
  const colour = pct < 50 ? '#22c55e' : pct < 80 ? '#ff6a00' : '#ef4444';
  dom.heatBar.style.width           = pct + '%';
  dom.heatBar.style.backgroundColor = colour;
  dom.heatVal.textContent            = Math.round(pct) + '%';
}

/* ════════════════════════════════════════════════════
   HOT SPOT
════════════════════════════════════════════════════ */
let _hotSpotTimer = null;

function scheduleHotSpot() {
  clearTimeout(_hotSpotTimer);
  _hotSpotTimer = setTimeout(showHotSpot, CONFIG.HOT_SPOT_PAUSE_MS);
}

function showHotSpot() {
  if (state.holdEventActive || state.overheated) {
    scheduleHotSpot();
    return;
  }
  const angle = Math.random() * Math.PI * 2;
  const r     = Math.random() * 0.28;
  state.hotSpot.nx = 0.5 + Math.cos(angle) * r;
  state.hotSpot.ny = 0.5 + Math.sin(angle) * r;
  state.hotSpot.active = true;

  dom.hotSpotEl.style.left = (state.hotSpot.nx * 100) + '%';
  dom.hotSpotEl.style.top  = (state.hotSpot.ny * 100) + '%';
  dom.hotSpotEl.classList.add('visible');
  // Spot stays until player clicks it — no auto-hide timer
}

function hideHotSpot() {
  state.hotSpot.active = false;
  dom.hotSpotEl.classList.remove('visible');
}

function isHotSpotHit(e) {
  if (!state.hotSpot.active) return false;
  const rect = dom.ball.getBoundingClientRect();
  const nx = (e.clientX - rect.left) / rect.width;
  const ny = (e.clientY - rect.top)  / rect.height;
  const dx = nx - state.hotSpot.nx;
  const dy = ny - state.hotSpot.ny;
  return Math.sqrt(dx * dx + dy * dy) < CONFIG.HOT_SPOT_HIT_RADIUS;
}

/* ════════════════════════════════════════════════════
   HOLD EVENT
════════════════════════════════════════════════════ */
const RING_CIRC = 2 * Math.PI * 120;

function scheduleNextHoldEvent() {
  const delay = CONFIG.HOLD_INTERVAL_MIN + Math.random() * (CONFIG.HOLD_INTERVAL_MAX - CONFIG.HOLD_INTERVAL_MIN);
  setTimeout(activateHoldEvent, delay);
}

function activateHoldEvent() {
  state.holdEventActive = true;

  clearTimeout(state.comboTimer);
  state.comboPausedAt = state.combo > 0 ? Date.now() : null;

  clearTimeout(_hotSpotTimer);
  hideHotSpot();

  dom.holdPrompt.classList.add('visible');
  dom.holdBarWrap.classList.add('visible');
  dom.holdBackdrop.classList.add('active');
  dom.centerEl.classList.add('hold-mode');
  dom.hoopWrap.classList.add('visible');
}

function startHold() {
  if (!state.holdEventActive || state.holdInProgress) return;
  state.holdInProgress = true;
  state.holdStartTime  = performance.now();
  dom.ringSvg.classList.add('visible');
  dom.ball.classList.add('pressed');
  state.holdRafId = requestAnimationFrame(animateHoldRing);
}

function animateHoldRing() {
  if (!state.holdInProgress) return;
  const progress = Math.min((performance.now() - state.holdStartTime) / CONFIG.HOLD_DURATION_MS, 1);
  dom.ringProgress.style.strokeDashoffset = RING_CIRC * (1 - progress);
  dom.holdBar.style.width = (progress * 100) + '%';
  if (progress >= 1) startMinigame();
  else state.holdRafId = requestAnimationFrame(animateHoldRing);
}

function startMinigame() {
  state.minigameActive    = true;
  state.minigameStartTime = performance.now();
  state.minigameMarkerPos = 0.5;
  dom.holdBar.style.width      = '100%';
  dom.holdBar.style.background = 'var(--orange)';
  dom.holdPrompt.textContent   = '🎯 Release!';
  dom.timingBarWrap.classList.add('visible');
  state.minigameRafId = requestAnimationFrame(animateMinigame);
}

function animateMinigame() {
  if (!state.minigameActive) return;
  const t   = (performance.now() - state.minigameStartTime) / 1000;
  const pos = 0.5 + 0.5 * Math.sin(t * CONFIG.MINIGAME_SPEED * Math.PI * 2);
  state.minigameMarkerPos = pos;
  dom.timingMarker.style.left = (pos * 100) + '%';
  state.minigameRafId = requestAnimationFrame(animateMinigame);
}

function resolveMinigame() {
  cancelAnimationFrame(state.minigameRafId);
  state.minigameActive = false;
  dom.timingBarWrap.classList.remove('visible');
  dom.holdPrompt.textContent   = '⚡ Hold!';
  dom.holdBar.style.background = '';

  const dist = Math.abs(state.minigameMarkerPos - 0.5);
  let mult, cls, label;
  if (dist <= CONFIG.MINIGAME_PERFECT) {
    mult = CONFIG.MINIGAME_PERFECT_MULT; cls = 'perfect'; label = '🎯 PERFECT!';
  } else if (dist <= CONFIG.MINIGAME_SWEET) {
    mult = CONFIG.MINIGAME_GOOD_MULT;   cls = 'good';    label = '✓ GOOD!';
  } else {
    mult = CONFIG.MINIGAME_MISS_MULT;   cls = 'miss';    label = 'MISS';
  }

  const fb = document.createElement('div');
  fb.className = `timing-feedback ${cls}`;
  fb.textContent = label;
  fb.style.cssText = 'position:fixed;left:50%;top:46%;z-index:70;pointer-events:none;';
  document.body.appendChild(fb);
  setTimeout(() => fb.remove(), 1000);

  state.holdInProgress = false;
  cancelAnimationFrame(state.holdRafId);
  dom.ball.classList.remove('pressed');
  dom.ringSvg.classList.remove('visible');
  dom.ringProgress.style.strokeDashoffset = RING_CIRC;
  dom.holdBar.style.width = '0%';
  claimHoldBonus(mult, cls === 'miss');
}

function claimHoldBonus(mult = 1, isMiss = false) {
  const bonus = state.clickPower * state.multi * state.prestigeBonus * CONFIG.HOLD_BONUS_MULT * mult;
  addTaps(bonus);
  animateCounterBump();
  resetHoldEvent(true);
  if (isMiss) shootMissAnimation(); else shootHoopAnimation(Math.floor(bonus));

  state.questHolds++;
  syncQuestProgress();

  render();
  scheduleNextHoldEvent();
  scheduleHotSpot();
}

function endHold() {
  if (!state.holdInProgress) return;
  if (state.minigameActive) { resolveMinigame(); return; }
  state.holdInProgress = false;
  cancelAnimationFrame(state.holdRafId);
  dom.ball.classList.remove('pressed');
  dom.ringSvg.classList.remove('visible');
  dom.ringProgress.style.strokeDashoffset = RING_CIRC;
  dom.holdBar.style.width = '0%';
}

function resetHoldEvent(keepHoop = false) {
  state.holdEventActive = false;
  state.holdInProgress  = false;
  cancelAnimationFrame(state.holdRafId);
  if (state.minigameActive) {
    cancelAnimationFrame(state.minigameRafId);
    state.minigameActive = false;
    dom.timingBarWrap.classList.remove('visible');
    dom.holdPrompt.textContent   = '⚡ Hold!';
    dom.holdBar.style.background = '';
  }
  dom.ball.classList.remove('pressed');
  dom.ringSvg.classList.remove('visible');
  dom.ringProgress.style.strokeDashoffset = RING_CIRC;
  dom.holdBar.style.width   = '0%';
  dom.holdBarWrap.classList.remove('visible');
  dom.holdPrompt.classList.remove('visible');
  if (!keepHoop) {
    dom.hoopWrap.classList.remove('visible');
    dom.holdBackdrop.classList.remove('active');
    dom.centerEl.classList.remove('hold-mode');
  }
  if (state.combo > 0 && state.comboPausedAt) {
    state.comboTimer = setTimeout(resetCombo, CONFIG.COMBO_RESET_MS);
  }
  state.comboPausedAt = null;
}

/* ════════════════════════════════════════════════════
   INPUT — tap + hold
════════════════════════════════════════════════════ */
let _mouseDownPos = null;

dom.ball.addEventListener('mousedown', e => {
  _mouseDownPos = { x: e.clientX, y: e.clientY };
  startHold();
});

dom.ball.addEventListener('mouseup', e => {
  const wasMinigame = state.minigameActive;
  endHold();
  if (_mouseDownPos) {
    const dx = e.clientX - _mouseDownPos.x;
    const dy = e.clientY - _mouseDownPos.y;
    if (!wasMinigame && Math.sqrt(dx*dx + dy*dy) < 10) {
      handleTap({ clientX: e.clientX, clientY: e.clientY });
    }
    _mouseDownPos = null;
  }
});

dom.ball.addEventListener('mouseleave', () => {
  endHold();
  _mouseDownPos = null;
});

dom.ball.addEventListener('touchstart', e => {
  e.preventDefault();
  startHold();
}, { passive: false });

dom.ball.addEventListener('touchend', e => {
  e.preventDefault();
  const wasMinigame = state.minigameActive;
  endHold();
  if (!wasMinigame) {
    const t = e.changedTouches[0];
    handleTap({ clientX: t.clientX, clientY: t.clientY });
  }
}, { passive: false });

document.addEventListener('keydown', e => {
  if (e.code !== 'Space' || e.repeat) return;
  e.preventDefault();
  startHold();
});

document.addEventListener('keyup', e => {
  if (e.code !== 'Space') return;
  e.preventDefault();
  const wasMinigame = state.minigameActive;
  endHold();
  if (!wasMinigame) {
    const r = dom.ballWrap.getBoundingClientRect();
    handleTap({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, true);
  }
});

/* ════════════════════════════════════════════════════
   TAP HANDLER
════════════════════════════════════════════════════ */
function handleTap(e, fromKeyboard = false) {
  if (state.overheated)      { spawnFloater(e, 'COOLING DOWN!', 'heat'); return; }
  if (state.holdEventActive) { return; }

  const hitSpot = !fromKeyboard && isHotSpotHit(e);

  if (hitSpot) {
    hideHotSpot();
    clearTimeout(state.comboTimer);
    state.combo++;
    state.comboTimer = setTimeout(resetCombo, CONFIG.COMBO_RESET_MS);
    if (state.combo > state.questMaxCombo) state.questMaxCombo = state.combo;
    syncQuestProgress();
    scheduleHotSpot();
  } else if (state.hotSpot.active) {
    // Missed the glowing spot — reset combo, reposition spot immediately
    resetCombo();
    showHotSpot();
  }

  state.questTaps++;
  syncQuestProgress();

  const tier   = getComboMultiplier();
  const isCrit = hitSpot && state.combo >= CONFIG.COMBO_CRIT_THRESHOLD
              && Math.random() < CONFIG.COMBO_CRIT_CHANCE;

  const base  = state.clickPower * state.multi * state.prestigeBonus;
  const value = Math.floor(base * (hitSpot ? tier.mult : 1) * (isCrit ? CONFIG.COMBO_CRIT_MULT : 1));

  addTaps(value);
  applyHeat();
  animateBallPress();
  animateCounterBump();
  spawnFloater(e, '+' + fmtBig(value), isCrit ? 'crit' : hitSpot ? 'combo' : '');
  if (hitSpot && (isCrit || state.combo >= 3)) spawnParticles(e, isCrit);
  renderCounters();
}

/* ════════════════════════════════════════════════════
   PURCHASES
════════════════════════════════════════════════════ */
function buySkill(id) {
  const def = SKILL_DEFS.find(d => d.id === id);
  if (!def || state.skillBought[id]) return;
  if (state.taps < def.cost) { flashCurrentCard(id); return; }
  state.taps -= def.cost;
  state.skillBought[id] = true;
  if (def.isMulti) state.multi      *= def.multiVal;
  else             state.clickPower += def.clickAdd;
  render();
  saveGame();
}

function buyAutoById(id) {
  const def = AUTO_DEFS.find(d => d.id === id);
  if (!def || state.autoBought[id]) return;
  if (state.taps < def.cost) { flashCurrentCard(id); return; }
  state.taps -= def.cost;
  state.autoBought[id] = true;
  state.autoTps += def.autoAdd;
  render();
  saveGame();
}

function flashCurrentCard(id) {
  document.querySelectorAll(`.card[data-id="${id}"]`).forEach(card => {
    card.classList.add('flash');
    setTimeout(() => card.classList.remove('flash'), 420);
  });
}

/* ════════════════════════════════════════════════════
   PRESTIGE
════════════════════════════════════════════════════ */
function nextPrestigeThreshold() {
  return CONFIG.PRESTIGE_BASE * Math.pow(CONFIG.PRESTIGE_SCALE, state.prestigeLevel);
}

function openPrestigeModal() {
  if (state.prestigeLevel >= CONFIG.PRESTIGE_MAX) return;
  if (state.taps < nextPrestigeThreshold()) return;
  const nextBonus = (1 + (state.prestigeLevel + 1) * CONFIG.PRESTIGE_BONUS_STEP).toFixed(1);
  dom.prestigeModalBody.innerHTML = `
    Reset this run in exchange for a permanent<br>
    <b>×${nextBonus} total multiplier</b> on all future taps.<br><br>
    <span class="diamond-reward">💎 +${CONFIG.PRESTIGE_DIAMONDS} diamonds</span> will be added.<br><br>
    Your record, lifetime taps and diamonds are kept.`;
  dom.prestigeOverlay.classList.add('visible');
}

function closePrestigeModal() {
  dom.prestigeOverlay.classList.remove('visible');
}

function confirmPrestige() {
  if (state.prestigeLevel >= CONFIG.PRESTIGE_MAX) return;
  closePrestigeModal();
  closeSheet();

  state.prestigeLevel++;
  state.prestigeBonus = 1 + state.prestigeLevel * CONFIG.PRESTIGE_BONUS_STEP;
  state.diamonds     += CONFIG.PRESTIGE_DIAMONDS;

  state.taps        = 0;
  state.clickPower  = 1;
  state.autoTps     = 0;
  state.multi       = 1;
  state.combo       = 0;
  state.heat        = 0;
  state.overheated  = false;
  state.skillBought = {};
  state.autoBought  = {};

  clearTimeout(state.comboTimer);
  dom.ball.classList.remove('overheated');
  resetHoldEvent();

  initQuests();

  showDiamondNotify(`+${CONFIG.PRESTIGE_DIAMONDS} 💎 — Prestige ${state.prestigeLevel}!`);
  render();
  saveGame();
}

/* ════════════════════════════════════════════════════
   DIAMOND NOTIFICATION
════════════════════════════════════════════════════ */
function showDiamondNotify(text) {
  const el = document.createElement('div');
  el.className   = 'diamond-notify';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

/* ════════════════════════════════════════════════════
   ANIMATION HELPERS
════════════════════════════════════════════════════ */
function animateBallPress() {
  dom.ball.classList.add('pressed');
  setTimeout(() => dom.ball.classList.remove('pressed'), 95);
}

function animateCounterBump() {
  dom.tapNumber.classList.remove('bump');
  void dom.tapNumber.offsetWidth;
  dom.tapNumber.classList.add('bump');
}

function spawnFloater(e, text, type = '') {
  const rect = dom.ballWrap.getBoundingClientRect();
  const el   = document.createElement('div');
  el.className   = type ? `floater ${type}` : 'floater';
  el.textContent = text;
  el.style.left  = (e.clientX - rect.left - 22 + (Math.random() * 30 - 15)) + 'px';
  el.style.top   = (e.clientY - rect.top  - 10) + 'px';
  dom.ballWrap.appendChild(el);
  setTimeout(() => el.remove(), 870);
}

function spawnParticles(e, isBig = false) {
  const rect    = dom.ballWrap.getBoundingClientRect();
  const count   = isBig ? 12 : 6;
  const colours = ['#ffc060','#ff8c00','#cc5500','#ff6a00'];
  for (let i = 0; i < count; i++) {
    const angle  = (360 / count) * i + Math.random() * 30;
    const dist   = 40 + Math.random() * 60;
    const rad    = (angle * Math.PI) / 180;
    const el     = document.createElement('div');
    el.className = 'particle';
    el.style.background = colours[Math.floor(Math.random() * colours.length)];
    el.style.width  = (isBig ? 8 : 5) + 'px';
    el.style.height = (isBig ? 8 : 5) + 'px';
    el.style.setProperty('--dx', Math.cos(rad) * dist + 'px');
    el.style.setProperty('--dy', Math.sin(rad) * dist + 'px');
    el.style.left = (e.clientX - rect.left - 4) + 'px';
    el.style.top  = (e.clientY - rect.top  - 4) + 'px';
    dom.ballWrap.appendChild(el);
    setTimeout(() => el.remove(), 620);
  }
}

function shakeCenter() {
  dom.centerEl.classList.remove('shake');
  void dom.centerEl.offsetWidth;
  dom.centerEl.classList.add('shake');
  setTimeout(() => dom.centerEl.classList.remove('shake'), 350);
}

/* ════════════════════════════════════════════════════
   HOOP SHOT ANIMATION
════════════════════════════════════════════════════ */
function shootHoopAnimation(bonus) {
  const hoopWrap = dom.hoopWrap;
  const ballRect = dom.ballWrap.getBoundingClientRect();
  const hoopRect = hoopWrap.getBoundingClientRect();

  const ballCX = ballRect.left + ballRect.width  / 2;
  const ballCY = ballRect.top  + ballRect.height / 2;
  const hoopCX = hoopRect.left + hoopRect.width  / 2;
  const hoopCY = hoopRect.top  + hoopRect.height * 0.54;

  const sb = document.createElement('div');
  sb.className = 'shot-ball';
  sb.style.left      = ballCX + 'px';
  sb.style.top       = ballCY + 'px';
  sb.style.transform = 'translate(-50%,-50%)';
  sb.innerHTML = `<svg viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 2 Q29 11 29 21 Q29 31 21 40" stroke="rgba(50,12,0,.55)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M21 2 Q13 11 13 21 Q13 31 21 40" stroke="rgba(50,12,0,.55)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M2 21 Q11 16 21 16 Q31 16 40 21"  stroke="rgba(50,12,0,.55)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M2 21 Q11 26 21 26 Q31 26 40 21"  stroke="rgba(50,12,0,.55)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  </svg>`;
  document.body.appendChild(sb);

  const dx = hoopCX - ballCX;
  const dy = hoopCY - ballCY;
  const arcDx = dx * 0.28 - 35;
  const arcDy = dy - 230;

  const anim = sb.animate([
    { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)',      opacity: 1 },
    { transform: `translate(calc(-50% + ${arcDx}px), calc(-50% + ${arcDy}px)) scale(0.88) rotate(310deg)`, opacity: 1, offset: 0.42 },
    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy - 4}px)) scale(0.72) rotate(570deg)`,   opacity: 1, offset: 0.82 },
    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 55}px)) scale(0) rotate(700deg)`,      opacity: 0 }
  ], { duration: 870, easing: 'cubic-bezier(0.3,0,0.45,1)', fill: 'forwards' });

  anim.onfinish = () => sb.remove();

  setTimeout(() => {
    hoopWrap.style.animation = 'none';
    hoopWrap.style.filter    = 'drop-shadow(0 0 40px rgba(255,200,60,0.90))';

    const net = hoopWrap.querySelector('.hoop-net');
    const rim = hoopWrap.querySelector('.hoop-rim');
    if (net) { net.classList.add('bounce');  setTimeout(() => net.classList.remove('bounce'), 700); }
    if (rim) { rim.classList.add('flash');   setTimeout(() => rim.classList.remove('flash'),  600); }

    const flash = document.createElement('div');
    flash.className = 'hoop-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 650);

    spawnHoopConfetti(hoopCX, hoopCY);

    const scoreEl = document.createElement('div');
    scoreEl.className = 'hoop-score';
    scoreEl.textContent = '+' + fmtBig(bonus);
    scoreEl.style.cssText += `left:${hoopCX}px; top:${hoopCY - 40}px; font-size:clamp(38px,7vw,66px);`;
    document.body.appendChild(scoreEl);
    setTimeout(() => scoreEl.remove(), 1950);

    shakeCenter();

    setTimeout(() => {
      hoopWrap.classList.remove('visible');
      dom.holdBackdrop.classList.remove('active');
      dom.centerEl.classList.remove('hold-mode');
      setTimeout(() => { hoopWrap.style.animation = ''; hoopWrap.style.filter = ''; }, 500);
    }, 1400);
  }, 700);
}

function shootMissAnimation() {
  const hoopWrap = dom.hoopWrap;
  const ballRect = dom.ballWrap.getBoundingClientRect();
  const hoopRect = hoopWrap.getBoundingClientRect();
  const ballCX = ballRect.left + ballRect.width  / 2;
  const ballCY = ballRect.top  + ballRect.height / 2;
  const hoopCX = hoopRect.left + hoopRect.width  / 2;
  const hoopCY = hoopRect.top  + hoopRect.height * 0.54;

  const sb = document.createElement('div');
  sb.className = 'shot-ball';
  sb.style.left = ballCX + 'px'; sb.style.top = ballCY + 'px';
  sb.style.transform = 'translate(-50%,-50%)';
  sb.innerHTML = `<svg viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 2 Q29 11 29 21 Q29 31 21 40" stroke="rgba(50,12,0,.55)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M21 2 Q13 11 13 21 Q13 31 21 40" stroke="rgba(50,12,0,.55)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M2 21 Q11 16 21 16 Q31 16 40 21"  stroke="rgba(50,12,0,.55)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M2 21 Q11 26 21 26 Q31 26 40 21"  stroke="rgba(50,12,0,.55)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  </svg>`;
  document.body.appendChild(sb);

  const dx   = hoopCX - ballCX;
  const dy   = hoopCY - ballCY;
  const side = Math.random() > 0.5 ? 1 : -1;
  const missX = dx + side * (55 + Math.random() * 35);

  const anim = sb.animate([
    { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)',   opacity: 1 },
    { transform: `translate(calc(-50% + ${dx * 0.52}px), calc(-50% + ${dy * 0.60 - 60}px)) scale(0.86) rotate(230deg)`, opacity: 1, offset: 0.48 },
    { transform: `translate(calc(-50% + ${missX}px), calc(-50% + ${dy + 90}px)) scale(0.35) rotate(540deg)`, opacity: 0 },
  ], { duration: 680, easing: 'ease-in', fill: 'forwards' });
  anim.onfinish = () => sb.remove();

  setTimeout(() => {
    const rim = hoopWrap.querySelector('.hoop-rim');
    if (rim) { rim.classList.add('miss-flash'); setTimeout(() => rim.classList.remove('miss-flash'), 520); }
    hoopWrap.style.filter = 'drop-shadow(0 0 20px rgba(239,68,68,0.70))';
    shakeCenter();
    setTimeout(() => {
      hoopWrap.classList.remove('visible');
      dom.holdBackdrop.classList.remove('active');
      dom.centerEl.classList.remove('hold-mode');
      setTimeout(() => { hoopWrap.style.filter = ''; }, 400);
    }, 750);
  }, 360);
}

function spawnHoopConfetti(cx, cy) {
  const colors = ['#ffc060','#ff8c00','#ff6a00','#ffffff','#67e8f9','#facc15','#a855f7'];
  for (let i = 0; i < 32; i++) {
    const el    = document.createElement('div');
    el.className = 'confetti-p';
    const angle = (Math.PI * 2 / 32) * i + (Math.random() - 0.5) * 0.5;
    const dist  = 70 + Math.random() * 160;
    const dur   = (0.65 + Math.random() * 0.55).toFixed(2);
    const w     = 4 + Math.random() * 7;
    const h     = 4 + Math.random() * 7;
    el.style.cssText = `
      left:${cx}px; top:${cy}px;
      width:${w}px; height:${h}px;
      border-radius:${Math.random() > 0.45 ? '50%' : '2px'};
      background:${colors[i % colors.length]};
      --dx:${(Math.cos(angle) * dist).toFixed(1)}px;
      --dy:${(Math.sin(angle) * dist).toFixed(1)}px;
      --rot:${(Math.random() * 800 - 400).toFixed(0)}deg;
      --dur:${dur}s;
      transform:translate(-50%,-50%);
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), parseFloat(dur) * 1000 + 50);
  }
}

/* ════════════════════════════════════════════════════
   STATE HELPERS
════════════════════════════════════════════════════ */
function addTaps(amount) {
  state.taps        += amount;
  state.lifetimeTaps += amount;
  if (state.taps > state.record) state.record = Math.floor(state.taps);
}

function fmt(n) {
  return Math.floor(n).toLocaleString();
}

function fmtBig(n) {
  if (n >= 1e9)  return (n / 1e9).toFixed(1)  + 'B';
  if (n >= 1e6)  return (n / 1e6).toFixed(1)  + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(Math.floor(n));
}

/* ════════════════════════════════════════════════════
   PERSISTENCE
════════════════════════════════════════════════════ */
const SAVE_KEY = 'baskettap_v3';

const SAVE_FIELDS = [
  'taps', 'clickPower', 'autoTps', 'multi', 'record',
  'diamonds', 'lifetimeTaps',
  'skillBought', 'autoBought', 'awardClaimed',
  'prestigeLevel', 'prestigeBonus',
  'questDate', 'questSlots', 'questTaps', 'questMaxCombo', 'questHolds',
];

function saveGame() {
  const data = { lastSave: Date.now() };
  SAVE_FIELDS.forEach(k => data[k] = state[k]);
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); }
  catch(e) {}
}

let offlineNotice = null;

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    SAVE_FIELDS.forEach(k => {
      if (data[k] !== undefined) state[k] = data[k];
    });
    if (data.lastSave && state.autoTps > 0) {
      const away = (Date.now() - data.lastSave) / 1000;
      if (away > 15) {
        const seconds = Math.min(away, 8 * 3600);
        const income  = Math.floor(state.autoTps * state.multi * state.prestigeBonus * seconds);
        if (income > 0) {
          state.taps        += income;
          state.lifetimeTaps += income;
          if (state.taps > state.record) state.record = Math.floor(state.taps);
          offlineNotice = { income, away };
        }
      }
    }
  } catch(e) {}
}

/* ════════════════════════════════════════════════════
   INTERVALS
════════════════════════════════════════════════════ */
setInterval(() => {
  if (state.autoTps === 0) return;
  addTaps((state.autoTps * state.multi * state.prestigeBonus) / (1000 / CONFIG.AUTO_TICK_MS));
  renderCounters();
}, CONFIG.AUTO_TICK_MS);

setInterval(() => {
  if (state.overheated || state.heat <= 0) return;
  if (Date.now() - state.lastTapTime < 300) return;
  state.heat = Math.max(0, state.heat - CONFIG.HEAT_DECAY_RATE / 10);
  updateHeatBar();
}, 100);

setInterval(saveGame, 5000);

window.addEventListener('beforeunload', saveGame);

/* ════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════ */
loadGame();
initQuests();

if (offlineNotice) {
  const mins = Math.round(offlineNotice.away / 60);
  const timeStr = mins < 60 ? `${mins}m` : `${(mins / 60).toFixed(1)}h`;
  setTimeout(() => showDiamondNotify(`⏰ +${fmtBig(offlineNotice.income)} taps (${timeStr} away)`), 500);
}

scheduleNextHoldEvent();
scheduleHotSpot();
render();

dom.ball.classList.add('spin-in');
dom.ball.addEventListener('animationend', () => dom.ball.classList.remove('spin-in'), { once: true });

/* ════════════════════════════════════════════════════
   TUTORIAL
════════════════════════════════════════════════════ */
function toggleTutorial() {
  const panel = document.getElementById('tutorial-panel');
  const btn   = document.getElementById('tut-toggle');
  const open  = panel.classList.toggle('hidden');
  btn.classList.toggle('active', !open);
}

function closeTutorial() {
  document.getElementById('tutorial-panel').classList.add('hidden');
  document.getElementById('tut-toggle').classList.remove('active');
}

/* ════════════════════════════════════════════════════
   EVENT WIRING
════════════════════════════════════════════════════ */
document.getElementById('tut-toggle').addEventListener('click', toggleTutorial);
document.querySelector('.tut-close').addEventListener('click', closeTutorial);

document.querySelectorAll('.icon-nav-btn[data-panel]').forEach(btn => {
  btn.addEventListener('click', () => showPanel(btn.dataset.panel, btn));
});

document.querySelectorAll('.mob-btn[data-sheet]').forEach(btn => {
  btn.addEventListener('click', () => openSheet(btn.dataset.sheet, btn));
});

dom.sheetBackdrop.addEventListener('click', closeSheet);
document.querySelector('.sheet-close').addEventListener('click', closeSheet);

document.querySelector('.prestige-confirm-btn').addEventListener('click', confirmPrestige);
document.querySelector('.prestige-cancel-btn').addEventListener('click', closePrestigeModal);

document.addEventListener('click', e => {
  const card = e.target.closest('.card[data-id]');
  if (!card || card.classList.contains('bought') || card.classList.contains('locked')) return;
  const id = card.dataset.id;
  if (id.startsWith('sk-')) buySkill(id);
  else if (id.startsWith('au-')) buyAutoById(id);
});

document.addEventListener('click', e => {
  if (e.target.matches('.prestige-btn:not([disabled])')) openPrestigeModal();
});

document.addEventListener('click', e => {
  if (e.target.matches('.quest-claim-btn[data-qid]')) claimQuest(e.target.dataset.qid);
});
