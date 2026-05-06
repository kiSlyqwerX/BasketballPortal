window.addEventListener('scroll', () => {
  document.getElementById('back-to-top').classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

const _save = JSON.parse(localStorage.getItem('baskettap_v3') || '{}');
try {
  if (_save.diamonds != null) document.getElementById('diamond-display').textContent = _save.diamonds;
  if (_save.record   != null) document.getElementById('record-val').textContent = fmtBig(_save.record);
} catch(e) {}

document.getElementById('back-to-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
