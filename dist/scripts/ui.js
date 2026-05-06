(function(){
  var d = sessionStorage.getItem('bt_dir');
  sessionStorage.removeItem('bt_dir');
  if (d === 'back') document.body.classList.add('back');
})();

function navigate(e, href, dir) {
  if (e) e.preventDefault();
  sessionStorage.setItem('bt_dir', dir || 'forward');
  document.body.classList.add('exit');
  if (dir === 'back') document.body.classList.add('back');
  setTimeout(() => { window.location.href = href; }, 270);
}

function fmtBig(n) {
  if (n >= 1e9)  return (n / 1e9).toFixed(1)  + 'B';
  if (n >= 1e6)  return (n / 1e6).toFixed(1)  + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(Math.floor(n || 0));
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-dir]').forEach(el => {
    el.addEventListener('click', e => navigate(e, el.dataset.href || el.href, el.dataset.dir));
  });
});
