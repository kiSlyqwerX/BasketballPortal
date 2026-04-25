/* ════════════════════════════════════════════════════
   CONFIG
════════════════════════════════════════════════════ */
const CONFIG = {
  AUTO_TICK_MS:           50,
  HOLD_DURATION_MS:     2500,
  HOLD_INTERVAL_MIN:   12000,
  HOLD_INTERVAL_MAX:   25000,
  HOLD_BONUS_MULT:        25,
  COMBO_RESET_MS:       2500,   // generous window — easier to maintain streak
  // Combo gives a real ×multiplier on manual taps (NOT auto).
  // First tier at combo 3 so players feel it immediately.
  COMBO_TIERS: [
    { at:  3, mult:  2,  label: '×2'  },
    { at:  8, mult:  4,  label: '×4'  },
    { at: 15, mult:  8,  label: '×8'  },
    { at: 25, mult: 15,  label: '×15' },
    { at: 40, mult: 25,  label: '×25' },
    { at: 60, mult: 50,  label: '×50' },
    { at:100, mult:100,  label: '×100'},
  ],
  // Crit: chance to double the combo-boosted tap
  COMBO_CRIT_THRESHOLD:   15,   // need combo ≥ this for crits
  COMBO_CRIT_CHANCE:    0.20,
  COMBO_CRIT_MULT:         2,   // crit doubles the combo-boosted value
  HEAT_PER_TAP:            8,    // heat added per click
  HEAT_DECAY_RATE:        60,    // heat lost per 100ms tick (÷10 = 6/tick = 60/sec → cools in ~1.7s)
  HEAT_OVERHEAT:         100,
  HEAT_COOLDOWN_MS:     7000,    // harsh penalty when overheated
  PRESTIGE_BASE:       50000,   // first prestige needs 50k taps
  PRESTIGE_SCALE:          4,   // each next prestige costs ×4 more
  PRESTIGE_BONUS_STEP:   0.5,   // +×0.5 per prestige level
  PRESTIGE_DIAMONDS:      10,   // diamonds per prestige
  AWARD_DIAMONDS:          1,   // diamonds per award unlocked
};

/* ════════════════════════════════════════════════════
   UPGRADE DEFINITIONS
   Automation is expensive — it's a prestige-tier feature.
════════════════════════════════════════════════════ */
const SKILL_DEFS = [
  { id:'sk-0', icon:'🏀', name:'Better Ball',    desc:'+2 taps per click',   cost:500,     clickAdd:2,  isMulti:false, multiVal:1, unlocks:'sk-1' },
  { id:'sk-1', icon:'💪', name:'Strong Arm',     desc:'+8 taps per click',   cost:5000,    clickAdd:8,  isMulti:false, multiVal:1, unlocks:'sk-2' },
  { id:'sk-2', icon:'⚡', name:'Lightning Tap',  desc:'+20 taps per click',  cost:30000,   clickAdd:20, isMulti:false, multiVal:1, unlocks:'sk-3' },
  { id:'sk-3', icon:'🔥', name:'On Fire',        desc:'×2 multiplier',       cost:150000,  clickAdd:0,  isMulti:true,  multiVal:2, unlocks:'sk-4' },
  { id:'sk-4', icon:'👑', name:'MVP',            desc:'×3 multiplier',       cost:1000000, clickAdd:0,  isMulti:true,  multiVal:3, unlocks:null   },
];

const AUTO_DEFS = [
  { id:'au-0', icon:'🤖', name:'Auto Dribble',   desc:'+1 tap/s — first step',  cost:10000,   autoAdd:1,  isPremium:true, unlocks:'au-1' },
  { id:'au-1', icon:'🏟️', name:'Stadium',        desc:'+8 taps/s',              cost:200000,  autoAdd:8,  isPremium:true, unlocks:'au-2' },
  { id:'au-2', icon:'🛸', name:'Hyperdrive',     desc:'+50 taps/s',             cost:2000000, autoAdd:50, isPremium:true, unlocks:'au-3' },
  { id:'au-3', icon:'🌌', name:'Galaxy Bot',     desc:'+200 taps/s',            cost:20000000,autoAdd:200,isPremium:true, unlocks:null   },
];

/* Awards: goal = taps needed, reward = diamonds given */
const AWARD_DEFS = [
  { id:'aw-100',    goal:100,      icon:'🏀', name:'First Steps',    desc:'Reach 100 taps'        },
  { id:'aw-1k',     goal:1000,     icon:'⭐', name:'Getting Serious', desc:'Reach 1,000 taps'     },
  { id:'aw-10k',    goal:10000,    icon:'🔥', name:'Heating Up',     desc:'Reach 10,000 taps'     },
  { id:'aw-50k',    goal:50000,    icon:'💯', name:'Dedicated',      desc:'Reach 50,000 taps'     },
  { id:'aw-250k',   goal:250000,   icon:'🏆', name:'Contender',      desc:'Reach 250,000 taps'   },
  { id:'aw-1m',     goal:1000000,  icon:'👑', name:'Legend',         desc:'Reach 1,000,000 taps' },
  { id:'aw-10m',    goal:10000000, icon:'🌟', name:'NBA Star',       desc:'Reach 10M taps'       },
  { id:'aw-100m',   goal:100000000,icon:'🚀', name:'Hall of Fame',   desc:'Reach 100M taps'      },
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
  skillBought: {},   // { 'sk-0': true, ... }
  autoBought:  {},
  awardClaimed:{},   // { 'aw-100': true, ... }
  combo:       0,
  comboTimer:  null,
  heat:        0,
  overheated:  false,
  lastTapTime: 0,
  holdEventActive: false,
  holdInProgress:  false,
  holdStartTime:   null,
  holdRafId:       null,
  comboPausedAt:   null,  // timestamp when combo timer was paused for a hold event
  prestigeLevel:   0,
  prestigeBonus:   1,
  sessionStart:    Date.now(),
  openSheetPanel:  null,  // track which sheet panel is open for live updates
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
  bottomSheet:    document.getElementById('bottom-sheet'),
  sheetBackdrop:  document.getElementById('sheet-backdrop'),
  sheetContent:   document.getElementById('sheet-content'),
  sheetTitle:     document.getElementById('sheet-title'),
  prestigeOverlay:document.getElementById('prestige-overlay'),
  prestigeModalBody:document.getElementById('prestige-modal-body'),
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
   Key fix: we store which panel is open and re-render
   the sheet content inside updateUI() so it always
   stays in sync with state after every purchase.
════════════════════════════════════════════════════ */
const SHEET_LABELS = { skills:'Skills', auto:'Automation', awards:'Awards', prestige:'👑 Prestige' };

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

/* Renders (or re-renders) the open sheet's content from current state */
function renderSheetContent() {
  if (!state.openSheetPanel) return;
  dom.sheetContent.innerHTML = buildPanelHTML(state.openSheetPanel);
}

/* ════════════════════════════════════════════════════
   HTML BUILDERS — one source of truth for all panels.
   Both desktop sidebar and mobile sheet call these,
   so the UI is always consistent with state.
════════════════════════════════════════════════════ */
function buildPanelHTML(panelId) {
  if (panelId === 'skills')  return buildSkillCardsHTML();
  if (panelId === 'auto')    return buildAutoHTML();
  if (panelId === 'awards')  return buildAwardsHTML();
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
    const onclick   = (!bought && !locked) ? `onclick="buySkill('${def.id}')"` : '';
    const connector = i < SKILL_DEFS.length - 1 ? '<div class="tree-connector"></div>' : '';

    return `
      <div class="card ${cls}" ${onclick}>
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
    const cls = bought ? 'bought premium' : locked ? 'locked premium' : 'premium';
    const onclick = (!bought && !locked) ? `onclick="buyAutoById('${def.id}')"` : '';
    const connector = i < AUTO_DEFS.length - 1 ? '<div class="tree-connector"></div>' : '';

    return `
      <div class="card ${cls}" ${onclick}>
        <div class="card-icon">${def.icon}</div>
        <div class="card-body">
          <div class="card-name">${def.name}${bought ? ' ✓' : ''}</div>
          <div class="card-desc">${def.desc}</div>
        </div>
        <div class="card-cost diamond-cost">${fmtBig(def.cost)}</div>
      </div>${connector}`;
  }).join('');

  return `
    <div class="stat-row"><div class="stat-label">Taps / sec</div><div class="stat-value">${(state.autoTps*state.multi).toFixed(1)}</div></div>
    <div class="stat-row"><div class="stat-label">Multiplier</div><div class="stat-value">×${state.multi}</div></div>
    <div style="height:10px"></div>
    ${cards}`;
}

function buildAwardsHTML() {
  const t = Math.floor(state.lifetimeTaps); // awards track lifetime, not current
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
  const canP      = state.taps >= threshold;
  const nextBonus = (1 + (state.prestigeLevel + 1) * CONFIG.PRESTIGE_BONUS_STEP).toFixed(1);
  return `
    <div class="prestige-stat"><div class="prestige-stat-label">Prestige level</div><div class="prestige-stat-value">${state.prestigeLevel}</div></div>
    <div class="prestige-stat"><div class="prestige-stat-label">Bonus multiplier</div><div class="prestige-stat-value">×${state.prestigeBonus.toFixed(1)}</div></div>
    <div class="prestige-stat"><div class="prestige-stat-label">Diamonds</div><div class="prestige-stat-value diamond">💎 ${state.diamonds}</div></div>
    <div class="prestige-stat"><div class="prestige-stat-label">Lifetime taps</div><div class="prestige-stat-value">${fmtBig(Math.floor(state.lifetimeTaps))}</div></div>
    <button class="prestige-btn" ${canP ? '' : 'disabled'} onclick="openPrestigeModal()">👑 Prestige</button>
    ${!canP ? `<div class="prestige-requirement">Need <b>${fmtBig(threshold)}</b> taps · +<b>10 💎</b> on prestige</div>` : ''}`;
}

/* ════════════════════════════════════════════════════
   FULL RENDER — called after every state change.
   Rebuilds desktop sidebar panels + re-renders open sheet.
════════════════════════════════════════════════════ */
function render() {
  const t   = Math.floor(state.taps);
  const tps = (state.autoTps * state.multi * state.prestigeBonus).toFixed(1);
  const pw  = Math.floor(state.clickPower * state.multi * state.prestigeBonus);

  // Core counters
  dom.tapNumber.textContent    = fmt(t);
  dom.recordVal.textContent    = fmtBig(state.record);
  dom.diamondDisplay.textContent = state.diamonds;
  dom.clickPowerD.textContent  = pw;
  dom.statTps.textContent      = tps;
  dom.statMulti.textContent    = '×' + state.multi;

  // Rebuild desktop sidebar panels
  dom.skillCards.innerHTML      = buildSkillCardsHTML();
  dom.autoCards.innerHTML       = buildAutoHTML().replace(/<div class="stat-row">[\s\S]*?<\/div>\s*<\/div>\s*<div class="stat-row">[\s\S]*?<\/div>\s*<\/div>\s*<div style="height:10px"><\/div>/,'');
  dom.awardsList.innerHTML      = buildAwardsHTML();
  dom.prestigeContent.innerHTML = buildPrestigeHTML();

  // Re-render open mobile sheet so it reflects the latest state
  renderSheetContent();

  // Combo + heat
  updateComboDisplay();
  updateHeatBar();

  // Check awards on lifetime taps
  checkAwards();
}

/* ════════════════════════════════════════════════════
   AWARD CHECK
   Uses lifetimeTaps so awards never go backward after prestige.
════════════════════════════════════════════════════ */
function checkAwards() {
  const t = state.lifetimeTaps;
  AWARD_DEFS.forEach(def => {
    if (!state.awardClaimed[def.id] && t >= def.goal) {
      state.awardClaimed[def.id] = true;
      state.diamonds += CONFIG.AWARD_DIAMONDS;
      showDiamondNotify(`+1 💎 — ${def.name} unlocked!`);
      saveGame();
    }
  });
}

/* ════════════════════════════════════════════════════
   INPUT EVENTS
   Rule: exactly ONE tap per physical press, NO double-fires.

   Desktop:
     mousedown → startHold (if hold event active) or record tap position
     mouseup   → endHold   + fire tap (if mouse didn't travel far = click)
     We DON'T use the 'click' event to avoid double-fire with mouseup.

   Mobile:
     touchstart → startHold (if hold event active), preventDefault stops
                  the synthetic 'click' the browser would emit later.
     touchend   → endHold + fire tap.
     Again, 'click' is never used so there's no double-fire.

   Keyboard (Space):
     keydown (no repeat) → startHold
     keyup              → endHold + tap
════════════════════════════════════════════════════ */

// Track where mousedown happened so we can distinguish drag from click
let _mouseDownPos = null;

dom.ball.addEventListener('mousedown', e => {
  _mouseDownPos = { x: e.clientX, y: e.clientY };
  startHold();
});

dom.ball.addEventListener('mouseup', e => {
  endHold();
  // Only count as a tap if the mouse barely moved (not a drag)
  if (_mouseDownPos) {
    const dx = e.clientX - _mouseDownPos.x;
    const dy = e.clientY - _mouseDownPos.y;
    if (Math.sqrt(dx*dx + dy*dy) < 10) {
      handleTap({ clientX: e.clientX, clientY: e.clientY });
    }
    _mouseDownPos = null;
  }
});

// mouseleave cancels hold but does NOT fire a tap
dom.ball.addEventListener('mouseleave', () => {
  endHold();
  _mouseDownPos = null;
});

// preventDefault on touchstart stops the browser's synthetic 'click'
dom.ball.addEventListener('touchstart', e => {
  e.preventDefault();
  startHold();
}, { passive: false });

dom.ball.addEventListener('touchend', e => {
  e.preventDefault();
  endHold();
  const t = e.changedTouches[0];
  handleTap({ clientX: t.clientX, clientY: t.clientY });
}, { passive: false });

// Keyboard: Space
document.addEventListener('keydown', e => {
  if (e.code !== 'Space' || e.repeat) return;
  e.preventDefault();
  startHold();
});

document.addEventListener('keyup', e => {
  if (e.code !== 'Space') return;
  e.preventDefault();
  endHold();
  const r = dom.ballWrap.getBoundingClientRect();
  handleTap({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 });
});

/* ════════════════════════════════════════════════════
   TAP HANDLER
   Combo multiplier applies only here (manual taps).
   Auto-tap interval skips this function entirely.
════════════════════════════════════════════════════ */
function handleTap(e) {
  if (state.overheated)      { spawnFloater(e, 'COOLING DOWN!', 'heat'); return; }
  if (state.holdEventActive) { return; }

  // ── Advance combo streak ──
  clearTimeout(state.comboTimer);
  state.combo++;
  state.comboTimer = setTimeout(resetCombo, CONFIG.COMBO_RESET_MS);

  // ── Combo tier multiplier (manual taps only) ──
  const tier  = getComboMultiplier();

  // ── Crit: doubles the already-combo-boosted value ──
  const isCrit = state.combo >= CONFIG.COMBO_CRIT_THRESHOLD
              && Math.random() < CONFIG.COMBO_CRIT_CHANCE;

  const base = state.clickPower * state.multi * state.prestigeBonus;
  const gain = base * tier.mult * (isCrit ? CONFIG.COMBO_CRIT_MULT : 1);

  addTaps(gain);
  applyHeat();
  animateBallPress();
  animateCounterBump();
  spawnParticles(e, isCrit || tier.mult >= 3);
  if (isCrit || tier.mult >= 4) shakeCenter();

  // Floater: always show combo label once streak > 1 so player sees it working
  let label = '+' + fmt(Math.floor(gain));
  if (isCrit)             label = '💥 CRIT  ' + label;
  else if (state.combo > 1) label = tier.label + '  ' + label;

  spawnFloater(e, label, isCrit ? 'crit' : tier.mult >= 2 ? 'bonus' : '');
  render();
}

/* ════════════════════════════════════════════════════
   COMBO
   Returns the current tap multiplier from the combo tier table.
   Auto-taps must NOT pass through this — they call addTaps directly.
════════════════════════════════════════════════════ */
function getComboMultiplier() {
  // Walk tiers from highest to lowest and return the first match
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
   HOLD EVENT
════════════════════════════════════════════════════ */
const RING_CIRC = 2 * Math.PI * 120;

function scheduleNextHoldEvent() {
  const delay = CONFIG.HOLD_INTERVAL_MIN + Math.random() * (CONFIG.HOLD_INTERVAL_MAX - CONFIG.HOLD_INTERVAL_MIN);
  setTimeout(activateHoldEvent, delay);
}

function activateHoldEvent() {
  state.holdEventActive = true;

  // Pause the combo timer so holding doesn't expire the streak.
  // We store how long is left so we can restore it after the hold.
  clearTimeout(state.comboTimer);
  state.comboPausedAt = state.combo > 0 ? Date.now() : null;

  dom.holdPrompt.classList.add('visible');
  dom.holdBarWrap.classList.add('visible');
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
  if (progress >= 1) claimHoldBonus();
  else state.holdRafId = requestAnimationFrame(animateHoldRing);
}

function claimHoldBonus() {
  const bonus  = state.clickPower * state.multi * state.prestigeBonus * CONFIG.HOLD_BONUS_MULT;
  addTaps(bonus);
  const r      = dom.ballWrap.getBoundingClientRect();
  const centre = { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
  spawnFloater(centre, '🔥 +' + fmtBig(Math.floor(bonus)), 'bonus');
  spawnParticles(centre, true);
  shakeCenter();
  animateCounterBump();
  resetHoldEvent();
  // Resume combo timer — the streak survives the hold event
  if (state.combo > 0) {
    state.comboTimer = setTimeout(resetCombo, CONFIG.COMBO_RESET_MS);
  }
  render();
  scheduleNextHoldEvent();
}

function endHold() {
  if (!state.holdInProgress) return;
  state.holdInProgress = false;
  cancelAnimationFrame(state.holdRafId);
  dom.ball.classList.remove('pressed');
  dom.ringSvg.classList.remove('visible');
  dom.ringProgress.style.strokeDashoffset = RING_CIRC;
  dom.holdBar.style.width = '0%';
}

function resetHoldEvent() {
  state.holdEventActive = false;
  state.holdInProgress  = false;
  cancelAnimationFrame(state.holdRafId);
  dom.ball.classList.remove('pressed');
  dom.ringSvg.classList.remove('visible');
  dom.ringProgress.style.strokeDashoffset = RING_CIRC;
  dom.holdBar.style.width   = '0%';
  dom.holdBarWrap.classList.remove('visible');
  dom.holdPrompt.classList.remove('visible');
  // If combo was paused for this hold, resume the decay timer
  if (state.combo > 0 && state.comboPausedAt) {
    state.comboTimer = setTimeout(resetCombo, CONFIG.COMBO_RESET_MS);
  }
  state.comboPausedAt = null;
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

/* Flash the card whether it's in the sidebar or in the sheet */
function flashCurrentCard(id) {
  // Try to find any rendered card element with onclick containing this id
  const allCards = document.querySelectorAll('.card');
  allCards.forEach(card => {
    if (card.getAttribute('onclick') && card.getAttribute('onclick').includes(id)) {
      card.classList.add('flash');
      setTimeout(() => card.classList.remove('flash'), 420);
    }
  });
}

/* ════════════════════════════════════════════════════
   PRESTIGE
════════════════════════════════════════════════════ */
function nextPrestigeThreshold() {
  return CONFIG.PRESTIGE_BASE * Math.pow(CONFIG.PRESTIGE_SCALE, state.prestigeLevel);
}

function openPrestigeModal() {
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
  closePrestigeModal();
  closeSheet();

  state.prestigeLevel++;
  state.prestigeBonus = 1 + state.prestigeLevel * CONFIG.PRESTIGE_BONUS_STEP;
  state.diamonds     += CONFIG.PRESTIGE_DIAMONDS;

  // Wipe run (keep record, lifetimeTaps, diamonds, awardClaimed)
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
   STATE HELPERS
════════════════════════════════════════════════════ */
function addTaps(amount) {
  state.taps        += amount;
  state.lifetimeTaps += amount;
  if (state.taps > state.record) state.record = Math.floor(state.taps);
}

/* Number formatters */
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
   PERSISTENCE  — save to localStorage after every change,
   load on startup so progress survives page reloads.
════════════════════════════════════════════════════ */
const SAVE_KEY = 'baskettap_v1';

// Fields we persist (transient things like heat/combo are excluded)
const SAVE_FIELDS = [
  'taps', 'clickPower', 'autoTps', 'multi', 'record',
  'diamonds', 'lifetimeTaps',
  'skillBought', 'autoBought', 'awardClaimed',
  'prestigeLevel', 'prestigeBonus',
];

function saveGame() {
  const data = {};
  SAVE_FIELDS.forEach(k => data[k] = state[k]);
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); }
  catch(e) { /* storage full or unavailable — silently ignore */ }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    SAVE_FIELDS.forEach(k => {
      if (data[k] !== undefined) state[k] = data[k];
    });
  } catch(e) { /* corrupt save — start fresh */ }
}

/* ════════════════════════════════════════════════════
   INTERVALS
════════════════════════════════════════════════════ */

// Auto-tap
setInterval(() => {
  if (state.autoTps === 0) return;
  addTaps((state.autoTps * state.multi * state.prestigeBonus) / (1000 / CONFIG.AUTO_TICK_MS));
  render();
}, CONFIG.AUTO_TICK_MS);

// Heat decay
setInterval(() => {
  if (state.overheated || state.heat <= 0) return;
  if (Date.now() - state.lastTapTime < 300) return;
  state.heat = Math.max(0, state.heat - CONFIG.HEAT_DECAY_RATE / 10);
  updateHeatBar();
}, 100);

// Auto-save every 5 seconds
setInterval(saveGame, 5000);

// Also save immediately when the tab is closed / navigated away
window.addEventListener('beforeunload', saveGame);


/* ════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════ */
loadGame();
scheduleNextHoldEvent();
render();

dom.ball.classList.add('spin-in');
dom.ball.addEventListener('animationend', () => dom.ball.classList.remove('spin-in'), { once: true });
