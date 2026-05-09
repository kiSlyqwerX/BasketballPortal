document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('share-btn');
  const copied = document.getElementById('share-copied');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const url = location.href;
    const title = document.title;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        copied.classList.add('visible');
        setTimeout(() => copied.classList.remove('visible'), 2200);
      } catch (e) {}
    }
  });
});
