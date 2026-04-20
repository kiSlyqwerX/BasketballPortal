
  /* ══════════════════════════════════════════════════
     CONFIG — all tuneable values in one place
  ══════════════════════════════════════════════════ */
  const CONFIG = {
    AUTO_TICK_MS:           50,
    HOLD_DURATION_MS:     2000,
    HOLD_INTERVAL_MIN:   10000,
    HOLD_INTERVAL_MAX:   20000,
    HOLD_BONUS_MULT:        20,
    COMBO_RESET_MS:       1500,
    COMBO_CRIT_THRESHOLD:   10,
    COMBO_CRIT_CHANCE:    0.25,
    COMBO_CRIT_MULT:         5,
    HEAT_PER_TAP:            8,
    HEAT_DECAY_RATE:         6,
    HEAT_OVERHEAT:         100,
    HEAT_COOLDOWN_MS:     3000,
    SESSION_TICK_MS:      1000,
    PRESTIGE_BASE:       10000,
    PRESTIGE_SCALE:          3,   // next threshold = prev × this
    PRESTIGE_BONUS_STEP:   0.5,   // permanent ×0.5 per prestige
  };
 
  /* ══════════════════════════════════════════════════
     UPGRADE DEFINITIONS
  ══════════════════════════════════════════════════ */
  const SKILL_DEFS = [
    { id:'sk-0', icon:'🏀', name:'Better Ball',    desc:'+2 taps per click',      cost:50,    clickAdd:2,  isMulti:false, multiVal:1, unlocks:'sk-1' },
    { id:'sk-1', icon:'💪', name:'Strong Arm',     desc:'+5 taps per click',      cost:400,   clickAdd:5,  isMulti:false, multiVal:1, unlocks:'sk-2' },
    { id:'sk-2', icon:'⚡', name:'Lightning Tap',  desc:'+15 taps per click',     cost:2000,  clickAdd:15, isMulti:false, multiVal:1, unlocks:'sk-3' },
    { id:'sk-3', icon:'🔥', name:'On Fire',        desc:'×2 multiplier',          cost:8000,  clickAdd:0,  isMulti:true,  multiVal:2, unlocks:'sk-4' },
    { id:'sk-4', icon:'👑', name:'MVP',            desc:'×3 multiplier',          cost:30000, clickAdd:0,  isMulti:true,  multiVal:3, unlocks:null   },
  ];
 
  const AUTO_DEFS = [
    { id:'au-0', icon:'🤖', name:'Auto Dribble',   desc:'+1 tap / sec',  cost:200,   autoAdd:1,  unlocks:'au-1' },
    { id:'au-1', icon:'🏟️', name:'Stadium',        desc:'+5 taps / sec', cost:1500,  autoAdd:5,  unlocks:'au-2' },
    { id:'au-2', icon:'🌐', name:'Global Network', desc:'+25 taps / sec',cost:10000, autoAdd:25, unlocks:null   },
  ];
 
  const AWARD_MILESTONES = [
    { goal:1,     icon:'🏀', name:'First Tap'    },
    { goal:25,    icon:'⭐', name:'Warm Up'       },
    { goal:100,   icon:'🔥', name:'Heating Up'   },
    { goal:500,   icon:'💯', name:'On a Roll'     },
    { goal:2000,  icon:'🏆', name:'Contender'    },
    { goal:5000,  icon:'👑', name:'Legend'        },
    { goal:20000, icon:'🌟', name:'NBA Star'      },
    { goal:50000, icon:'🚀', name:'Hall of Fame'  },
  ];
 
  /* ══════════════════════════════════════════════════
     GAME STATE
  ══════════════════════════════════════════════════ */
  const state = {
    taps:        0,
    clickPower:  1,
    autoTps:     0,
    multi:       1,
    record:      0,
    skillBought: {},
    autoBought:  {},
    combo:       0,
    comboTimer:  null,
    heat:        0,
    overheated:  false,
    lastTapTime: 0,
    holdEventActive: false,
    holdInProgress:  false,
    holdStartTime:   null,
    holdRafId:       null,
    prestigeLevel:   0,
    prestigeBonus:   1,
    lifetimeTaps:    0,
    sessionStart:    Date.now(),
  };
 
  /* ══════════════════════════════════════════════════
     DOM REFS
  ══════════════════════════════════════════════════ */
  const dom = {
    tapNumber:     document.getElementById('tap-number'),
    recordVal:     document.getElementById('record-val'),
    clickPowerD:   document.getElementById('click-power-display'),
    statTps:       document.getElementById('stat-tps'),
    statMulti:     document.getElementById('stat-multi'),
    footerAuto:    document.getElementById('footer-auto'),
    sessionD:      document.getElementById('session-display'),
    ball:          document.getElementById('ball'),
    ballWrap:      document.getElementById('ball-wrap'),
    ringSvg:       document.getElementById('ring-svg'),
    ringProgress:  document.getElementById('ring-progress'),
    holdPrompt:    document.getElementById('hold-prompt'),
    holdBarWrap:   document.getElementById('hold-bar-wrap'),
    holdBar:       document.getElementById('hold-bar'),
    holdDot:       document.getElementById('hold-dot'),
    holdBadge:     document.getElementById('hold-badge'),
    holdLabel:     document.getElementById('hold-label'),
    comboDisplay:  document.getElementById('combo-display'),
    heatBar:       document.getElementById('heat-bar'),
    heatVal:       document.getElementById('heat-val'),
    centerEl:      document.getElementById('center-el'),
    awardsList:    document.getElementById('awards-list'),
    skillCards:    document.getElementById('skill-cards'),
    autoCards:     document.getElementById('auto-cards'),
    prestigeContent:document.getElementById('prestige-content'),
    prestigeOverlay:document.getElementById('prestige-overlay'),
    modalBonusText: document.getElementById('modal-bonus-text'),
    sheetContent:  document.getElementById('sheet-content'),
    sheetTitle:    document.getElementById('sheet-title'),
    bottomSheet:   document.getElementById('bottom-sheet'),
    sheetBackdrop: document.getElementById('sheet-backdrop'),
  };
 
  /* ══════════════════════════════════════════════════
     PANEL SWITCHING  (desktop sidebar)
  ══════════════════════════════════════════════════ */
  function showPanel(name, btnEl) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.icon-nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('panel-' + name).classList.add('active');
    btnEl.classList.add('active');
  }
 
  /* ══════════════════════════════════════════════════
     MOBILE BOTTOM SHEET
  ══════════════════════════════════════════════════ */
  const SHEET_LABELS = { skills:'Skills', auto:'Automation', awards:'Awards', prestige:'Prestige' };
 
  function openSheet(panelId, btnEl) {
    // Mark active nav button
    document.querySelectorAll('.mob-btn[data-sheet]').forEach(b => {
      b.classList.remove('active', 'p-active');
    });
    if (btnEl) {
      btnEl.classList.add(panelId === 'prestige' ? 'p-active' : 'active');
    }
 
    // Fill sheet with a fresh copy of the relevant panel's HTML
    dom.sheetContent.innerHTML = buildPanelHTML(panelId);
    dom.sheetTitle.textContent = SHEET_LABELS[panelId] || panelId;
 
    dom.bottomSheet.classList.add('open');
    dom.sheetBackdrop.classList.add('open');
  }
 
  function closeSheet() {
    dom.bottomSheet.classList.remove('open');
    dom.sheetBackdrop.classList.remove('open');
    document.querySelectorAll('.mob-btn').forEach(b => b.classList.remove('active','p-active'));
  }
 
  /**
   * Build the inner HTML for a given panel id.
   * We render fresh HTML from state so the sheet always shows current data.
   */
  function buildPanelHTML(panelId) {
    if (panelId === 'skills')  return buildCardsHTML(SKILL_DEFS, state.skillBought, 'buySkill');
    if (panelId === 'auto')    return buildAutoHTML();
    if (panelId === 'awards')  return buildAwardsHTML();
    if (panelId === 'prestige') return buildPrestigeHTML();
    return '';
  }
 
  function buildCardsHTML(defs, boughtMap, buyFn) {
    return defs.map((d, i) => {
      const bought  = boughtMap[d.id];
      const locked  = i > 0 && !boughtMap[defs[i-1].id];
      const cls     = bought ? 'bought' : locked ? 'locked' : '';
      const onclick = (bought || locked) ? '' : `onclick="${buyFn}('${d.id}')"`;
      const connector = i < defs.length - 1 ? '<div class="tree-connector"></div>' : '';
      return `
        <div class="card ${cls}" id="m-${d.id}" ${onclick}>
          <div class="card-icon">${d.icon}</div>
          <div class="card-body">
            <div class="card-name">${d.name}</div>
            <div class="card-desc">${d.desc}</div>
          </div>
          <div class="card-cost">${d.cost.toLocaleString()}</div>
        </div>${connector}`;
    }).join('');
  }
 
  function buildAutoHTML() {
    const tps   = (state.autoTps * state.multi).toFixed(1);
    const multi = '×' + state.multi;
    return `
      <div class="stat-row"><div class="stat-label">Taps / sec</div><div class="stat-value">${tps}</div></div>
      <div class="stat-row"><div class="stat-label">Multiplier</div><div class="stat-value">${multi}</div></div>
      <div style="height:10px"></div>
      ${buildCardsHTML(AUTO_DEFS, state.autoBought, 'buyAutoById')}`;
  }
 
  function buildAwardsHTML() {
    const t = Math.floor(state.taps);
    return AWARD_MILESTONES.map(({ goal, icon, name }) => {
      const pct = Math.min(100, (t / goal) * 100);
      const cls = t >= goal ? 'unlocked' : '';
      return `
        <div class="award-card ${cls}">
          <div class="award-icon">${icon}</div>
          <div class="award-body">
            <div class="award-name">${name}</div>
            <div class="award-bar-wrap"><div class="award-bar" style="width:${pct}%"></div></div>
          </div>
          <div class="award-goal">${goal.toLocaleString()}</div>
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
      <div class="prestige-stat"><div class="prestige-stat-label">Lifetime taps</div><div class="prestige-stat-value">${Math.floor(state.lifetimeTaps).toLocaleString()}</div></div>
      <button class="prestige-btn" ${canP ? '' : 'disabled'} onclick="openPrestigeModal()">✦ Prestige</button>
      ${!canP ? `<div class="prestige-requirement">Reach <b>${threshold.toLocaleString()}</b> taps to unlock</div>` : ''}`;
  }
 
  /* ══════════════════════════════════════════════════
     KEYBOARD SUPPORT  (one tap per keypress via keyup)
  ══════════════════════════════════════════════════ */
  document.addEventListener('keyup', e => {
    if (e.code !== 'Space') return;
    e.preventDefault();
    const r = dom.ballWrap.getBoundingClientRect();
    handleTap({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 });
  });
 
  document.addEventListener('keydown', e => { if (e.code === 'Space' && !e.repeat) startHold(); });
  document.addEventListener('keyup',   e => { if (e.code === 'Space') endHold(); });
 
  /* ══════════════════════════════════════════════════
     BALL EVENTS  — mouse + touch
  ══════════════════════════════════════════════════ */
  dom.ball.addEventListener('click',      handleTap);
  dom.ball.addEventListener('mousedown',  () => startHold());
  dom.ball.addEventListener('mouseup',    () => endHold());
  dom.ball.addEventListener('mouseleave', () => endHold());
 
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
 
  /* ══════════════════════════════════════════════════
     TAP HANDLER
  ══════════════════════════════════════════════════ */
  function handleTap(e) {
    if (state.overheated)      { spawnFloater(e, 'TOO HOT!', 'heat'); return; }
    if (state.holdEventActive) { return; }
 
    // Combo
    clearTimeout(state.comboTimer);
    state.combo++;
    state.comboTimer = setTimeout(resetCombo, CONFIG.COMBO_RESET_MS);
 
    // Crit
    const isCrit = state.combo >= CONFIG.COMBO_CRIT_THRESHOLD
                && Math.random() < CONFIG.COMBO_CRIT_CHANCE;
 
    const base = state.clickPower * state.multi * state.prestigeBonus;
    const gain = isCrit ? base * CONFIG.COMBO_CRIT_MULT : base;
 
    addTaps(gain);
    applyHeat();
    animateBallPress();
    animateCounterBump();
    spawnParticles(e, isCrit);
    if (isCrit) shakeCenter();
    spawnFloater(e, (isCrit ? '🔥 ' : '+') + Math.floor(gain), isCrit ? 'crit' : '');
    updateUI();
  }
 
  /* ══════════════════════════════════════════════════
     COMBO
  ══════════════════════════════════════════════════ */
  function resetCombo() {
    state.combo = 0;
    dom.comboDisplay.classList.add('hidden');
  }
 
  function updateComboDisplay() {
    if (state.combo <= 1) { dom.comboDisplay.classList.add('hidden'); return; }
    dom.comboDisplay.classList.remove('hidden');
    dom.comboDisplay.textContent = state.combo >= CONFIG.COMBO_CRIT_THRESHOLD
      ? `🔥 ${state.combo}× COMBO — CRITS ACTIVE`
      : `${state.combo}× COMBO`;
  }
 
  /* ══════════════════════════════════════════════════
     HEAT
  ══════════════════════════════════════════════════ */
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
 
  /* ══════════════════════════════════════════════════
     HOLD EVENT
  ══════════════════════════════════════════════════ */
  const RING_CIRCUMFERENCE = 2 * Math.PI * 120; // ≈ 753.98
 
  function scheduleNextHoldEvent() {
    const delay = CONFIG.HOLD_INTERVAL_MIN
                + Math.random() * (CONFIG.HOLD_INTERVAL_MAX - CONFIG.HOLD_INTERVAL_MIN);
    setTimeout(activateHoldEvent, delay);
  }
 
  function activateHoldEvent() {
    state.holdEventActive = true;
    dom.holdDot.classList.add('active');
    dom.holdBadge.classList.add('active');
    dom.holdLabel.textContent = '⚡ Hold now!';
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
    const progress = Math.min(
      (performance.now() - state.holdStartTime) / CONFIG.HOLD_DURATION_MS,
      1
    );
    dom.ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);
    dom.holdBar.style.width = (progress * 100) + '%';
    if (progress >= 1) claimHoldBonus();
    else state.holdRafId = requestAnimationFrame(animateHoldRing);
  }
 
  function claimHoldBonus() {
    const bonus  = state.clickPower * state.multi * state.prestigeBonus * CONFIG.HOLD_BONUS_MULT;
    addTaps(bonus);
    const r      = dom.ballWrap.getBoundingClientRect();
    const centre = { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
    spawnFloater(centre, '🔥 +' + Math.floor(bonus), 'bonus');
    spawnParticles(centre, true);
    shakeCenter();
    animateCounterBump();
    resetHoldEvent();
    updateUI();
    scheduleNextHoldEvent();
  }
 
  function endHold() {
    if (!state.holdInProgress) return;
    state.holdInProgress = false;
    cancelAnimationFrame(state.holdRafId);
    dom.ball.classList.remove('pressed');
    dom.ringSvg.classList.remove('visible');
    dom.ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE;
    dom.holdBar.style.width = '0%';
  }
 
  function resetHoldEvent() {
    state.holdEventActive = false;
    state.holdInProgress  = false;
    cancelAnimationFrame(state.holdRafId);
    dom.ball.classList.remove('pressed');
    dom.ringSvg.classList.remove('visible');
    dom.ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE;
    dom.holdBar.style.width   = '0%';
    dom.holdBarWrap.classList.remove('visible');
    dom.holdPrompt.classList.remove('visible');
    dom.holdDot.classList.remove('active');
    dom.holdBadge.classList.remove('active');
    dom.holdLabel.textContent = 'Hold ready';
  }
 
  /* ══════════════════════════════════════════════════
     PURCHASES
     buySkill / buyAuto accept an id string ('sk-0' etc.)
     so they work both from desktop sidebar and mobile sheet.
  ══════════════════════════════════════════════════ */
  function buySkill(id) {
    const def = SKILL_DEFS.find(d => d.id === id);
    if (!def || state.skillBought[id]) return;
    if (state.taps < def.cost) { flashCard(id); return; }
 
    state.taps -= def.cost;
    state.skillBought[id] = true;
 
    if (def.isMulti) state.multi      *= def.multiVal;
    else             state.clickPower += def.clickAdd;
 
    rebuildSidebarCards();
    updateUI();
  }
 
  function buyAutoById(id) {
    const def = AUTO_DEFS.find(d => d.id === id);
    if (!def || state.autoBought[id]) return;
    if (state.taps < def.cost) { flashCard(id); return; }
 
    state.taps -= def.cost;
    state.autoBought[id] = true;
    state.autoTps += def.autoAdd;
 
    rebuildSidebarCards();
    updateUI();
  }
 
  /* Flash red border briefly when player can't afford */
  function flashCard(id) {
    // Try desktop sidebar card first, then sheet card
    const el = document.getElementById(id) || document.getElementById('m-' + id);
    if (!el) return;
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 420);
  }
 
  /* Rebuild only the static sidebar card containers (desktop) */
  function rebuildSidebarCards() {
    dom.skillCards.innerHTML = buildCardsHTML(SKILL_DEFS, state.skillBought, 'buySkill');
    dom.autoCards.innerHTML  = buildCardsHTML(AUTO_DEFS,  state.autoBought,  'buyAutoById');
    dom.prestigeContent.innerHTML = buildPrestigeHTML();
  }
 
  /* ══════════════════════════════════════════════════
     ANIMATION HELPERS
  ══════════════════════════════════════════════════ */
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
    const colours = ['#ffc060', '#ff8c00', '#cc5500', '#ff6a00'];
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
 
  /* ══════════════════════════════════════════════════
     PRESTIGE
  ══════════════════════════════════════════════════ */
  function nextPrestigeThreshold() {
    return CONFIG.PRESTIGE_BASE * Math.pow(CONFIG.PRESTIGE_SCALE, state.prestigeLevel);
  }
 
  function openPrestigeModal() {
    if (state.taps < nextPrestigeThreshold()) return;
    const nextBonus = 1 + (state.prestigeLevel + 1) * CONFIG.PRESTIGE_BONUS_STEP;
    dom.modalBonusText.textContent = '×' + nextBonus.toFixed(1) + ' total multiplier';
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
 
    // Reset run (keep record + lifetimeTaps)
    state.taps       = 0;
    state.clickPower = 1;
    state.autoTps    = 0;
    state.multi      = 1;
    state.combo      = 0;
    state.heat       = 0;
    state.overheated = false;
    state.skillBought = {};
    state.autoBought  = {};
 
    clearTimeout(state.comboTimer);
    dom.ball.classList.remove('overheated');
    resetHoldEvent();
    rebuildSidebarCards();
    updateUI();
  }
 
  /* ══════════════════════════════════════════════════
     STATE HELPER
  ══════════════════════════════════════════════════ */
  function addTaps(amount) {
    state.taps        += amount;
    state.lifetimeTaps += amount;
    if (state.taps > state.record) state.record = Math.floor(state.taps);
  }
 
  /* ══════════════════════════════════════════════════
     UI UPDATE
  ══════════════════════════════════════════════════ */
  function updateUI() {
    const t   = Math.floor(state.taps);
    const tps = (state.autoTps * state.multi).toFixed(1);
 
    dom.tapNumber.textContent   = t.toLocaleString();
    dom.recordVal.textContent   = state.record.toLocaleString();
    dom.clickPowerD.textContent = Math.floor(state.clickPower * state.multi * state.prestigeBonus);
    dom.statTps.textContent     = tps;
    dom.statMulti.textContent   = '×' + state.multi;
    dom.footerAuto.textContent  = tps;
 
    updateComboDisplay();
    updateHeatBar();
 
    // Update desktop award bars
    AWARD_MILESTONES.forEach(({ goal }) => {
      const card = document.getElementById('aw-' + goal);
      const bar  = document.getElementById('awb-' + goal);
      if (!card || !bar) return;
      bar.style.width = Math.min(100, (t / goal) * 100) + '%';
      if (t >= goal) card.classList.add('unlocked');
    });
 
    // Update prestige button in desktop sidebar
    const pb = document.getElementById('prestige-btn');
    if (pb) pb.disabled = state.taps < nextPrestigeThreshold();
    const pr = document.getElementById('prestige-threshold-display');
    if (pr) pr.textContent = nextPrestigeThreshold().toLocaleString();
  }
 
  /* ══════════════════════════════════════════════════
     BUILD STATIC DOM  (desktop sidebar + award cards)
  ══════════════════════════════════════════════════ */
  function buildStaticDOM() {
    // Sidebar skill + auto cards
    rebuildSidebarCards();
 
    // Desktop awards
    dom.awardsList.innerHTML = AWARD_MILESTONES.map(({ goal, icon, name }) => `
      <div class="award-card" id="aw-${goal}">
        <div class="award-icon">${icon}</div>
        <div class="award-body">
          <div class="award-name">${name}</div>
          <div class="award-bar-wrap"><div class="award-bar" id="awb-${goal}" style="width:0%"></div></div>
        </div>
        <div class="award-goal">${goal.toLocaleString()}</div>
      </div>`).join('');
 
    // Prestige sidebar
    dom.prestigeContent.innerHTML = buildPrestigeHTML();
  }
 
  /* ══════════════════════════════════════════════════
     INTERVALS
  ══════════════════════════════════════════════════ */
 
  // Auto-tap
  setInterval(() => {
    if (state.autoTps === 0) return;
    addTaps((state.autoTps * state.multi) / (1000 / CONFIG.AUTO_TICK_MS));
    updateUI();
  }, CONFIG.AUTO_TICK_MS);
 
  // Heat decay
  setInterval(() => {
    if (state.overheated || state.heat <= 0) return;
    if ((Date.now() - state.lastTapTime) < 300) return; // grace period
    state.heat = Math.max(0, state.heat - CONFIG.HEAT_DECAY_RATE / 10);
    updateHeatBar();
  }, 100);
 
  // Session timer
  setInterval(() => {
    const s = Math.floor((Date.now() - state.sessionStart) / 1000);
    dom.sessionD.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }, CONFIG.SESSION_TICK_MS);
 
  /* ══════════════════════════════════════════════════
     RESET
  ══════════════════════════════════════════════════ */
  function resetGame() {
    if (!confirm('Reset ALL progress including prestige?')) return;
 
    state.taps         = 0;
    state.clickPower   = 1;
    state.autoTps      = 0;
    state.multi        = 1;
    state.record       = 0;
    state.combo        = 0;
    state.heat         = 0;
    state.overheated   = false;
    state.skillBought  = {};
    state.autoBought   = {};
    state.prestigeLevel = 0;
    state.prestigeBonus = 1;
    state.lifetimeTaps  = 0;
 
    clearTimeout(state.comboTimer);
    dom.ball.classList.remove('overheated');
    resetHoldEvent();
    closeSheet();
    rebuildSidebarCards();
    updateUI();
  }
 
  /* ══════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════ */
  buildStaticDOM();
  scheduleNextHoldEvent();
  updateUI();
