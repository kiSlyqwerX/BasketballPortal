const CAT_LABELS = {
  nba:        'NBA',
  euroleague: 'EuroLeague',
  transfers:  'Transfers',
  training:   'Training',
};

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch(e) { return ''; }
}

function generateCard(article) {
  const cat   = article.category;
  const label = CAT_LABELS[cat] || 'NBA';
  const date  = fmtDate(article.date);
  const img   = article.urlToImage;

  return `<a class="news-card" href="/news/${esc(cat)}/${esc(article.slug)}/">
  <div class="card-img-wrap">
    ${img
      ? `<img src="${esc(img)}" alt="${esc(article.title)}" loading="lazy" />`
      : `<div class="no-img">🏀</div>`}
    <span class="card-badge ${esc(cat)}">${label}</span>
  </div>
  <div class="card-body">
    <div class="card-title">${esc(article.title)}</div>
    <div class="card-desc">${esc(article.description)}</div>
    <div class="card-footer">
      ${date ? `<div class="card-meta">${esc(date)}</div>` : '<div></div>'}
      <span class="card-read">Read →</span>
    </div>
  </div>
</a>`;
}

function generateCards(articles) {
  if (!articles.length) {
    return `<div style="padding:60px 0;text-align:center;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.4);">No articles in this category</div>`;
  }
  return articles.map(generateCard).join('\n');
}

function generateImageBlock(urlToImage, title) {
  if (urlToImage) {
    return `<div class="art-img-wrap"><img src="${esc(urlToImage)}" alt="${esc(title)}" /></div>`;
  }
  return `<div class="art-img-wrap"><div class="no-img-big">🏀</div></div>`;
}

function generateDateBlock(iso) {
  const date = fmtDate(iso);
  return date ? `<div class="art-date">${esc(date)}</div>` : '';
}

function generateExtLinkBlock(url) {
  if (!url) return '';
  return `<div class="art-full-hint">Full article available on the source site</div>
<a class="art-ext-btn" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Read Full Article <span class="art-ext-arrow">→</span></a>`;
}

module.exports = { generateCards, generateImageBlock, generateDateBlock, generateExtLinkBlock, esc, CAT_LABELS };
