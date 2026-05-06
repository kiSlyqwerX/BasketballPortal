const _save = JSON.parse(localStorage.getItem('baskettap_v3') || '{}');
try {
  if (_save.diamonds != null) document.getElementById('diamond-display').textContent = _save.diamonds;
  if (_save.record   != null) document.getElementById('record-val').textContent = fmtBig(_save.record);
} catch(e) {}

document.addEventListener('click', e => {
  const card = e.target.closest('.news-card');
  if (card) navigate(e, card.href, 'forward');
});
