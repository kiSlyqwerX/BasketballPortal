const CAT_LABELS = {
  nba:        'NBA',
  euroleague: 'EuroLeague',
  transfers:  'Transfers',
  training:   'Training',
  test:       'Test',
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

/* ─── NEWS CARD ──────────────────────────────────────────────── */

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

/* ─── ARTICLE IMAGE ─────────────────────────────────────────── */

function generateImageBlock(urlToImage, title) {
  if (urlToImage) {
    return `<div class="art-img-wrap"><img src="${esc(urlToImage)}" alt="${esc(title)}" /></div>`;
  }
  return `<div class="art-img-wrap"><div class="no-img-big">🏀</div></div>`;
}

/* ─── BREADCRUMBS ───────────────────────────────────────────── */

function generateBreadcrumbs(category, catLabel, articleTitle) {
  const title = articleTitle.length > 55
    ? articleTitle.substring(0, 52) + '...'
    : articleTitle;
  return `<nav class="breadcrumbs" aria-label="Breadcrumb">
  <a href="/news/">News</a>
  <span class="bc-sep">→</span>
  <a href="/news/${esc(category)}/">${esc(catLabel)}</a>
  <span class="bc-sep">→</span>
  <span class="bc-current">${esc(title)}</span>
</nav>`;
}

/* ─── ARTICLE META (date / author / reading time) ───────────── */

function generateArticleMeta(iso, source, bodyHtml) {
  const date   = fmtDate(iso);
  const words  = bodyHtml.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  const mins   = Math.max(1, Math.ceil(words / 200));
  const author = esc(source || 'BasketTap');
  const sep    = '<span class="art-meta-sep">·</span>';

  const parts = [];
  if (date) parts.push(`<span class="art-meta-date">${esc(date)}</span>`);
  parts.push(`<span class="art-meta-author">${author}</span>`);
  parts.push(`<span class="art-meta-read">${mins} min read</span>`);

  return `<div class="art-meta">${parts.join(sep)}</div>`;
}

/* ─── ARTICLE BODY (expanded, with h2 sections) ─────────────── */

const BODY_SECTIONS = {
  nba: [
    { id: 's-analysis',    h2: 'Game Analysis' },
    { id: 's-performance', h2: 'Player Performance' },
    { id: 's-outlook',     h2: 'Season Outlook' },
  ],
  euroleague: [
    { id: 's-overview',    h2: 'Match Overview' },
    { id: 's-performance', h2: 'Key Performances' },
    { id: 's-standings',   h2: 'Competition Standings' },
  ],
  transfers: [
    { id: 's-details',     h2: 'Transfer Details' },
    { id: 's-impact',      h2: 'Team Impact' },
    { id: 's-market',      h2: 'Transfer Market Overview' },
  ],
  training: [
    { id: 's-approach',    h2: 'Training Approach' },
    { id: 's-skills',      h2: 'Skill Development' },
    { id: 's-results',     h2: 'Performance Outcomes' },
  ],
  test: [
    { id: 's-lorem',       h2: 'Lorem Ipsum' },
    { id: 's-dolor',       h2: 'Dolor Sit Amet' },
    { id: 's-consectetur', h2: 'Consectetur Adipiscing' },
  ],
};

const BODY_CONTENT = {
  nba: [
    [
      'Basketball analysis requires looking beyond the box score to understand the full story. Defensive schemes, offensive sets, and individual matchups all shaped this outcome. The ability to read rotations and exploit mismatches remains central to success at the NBA level.',
      'Pace and tempo directly influence scoring efficiency. Teams that push in transition generate high-percentage looks before the defense sets, while deliberate half-court teams exploit spacing and pick-and-roll actions. Both approaches succeed when executed with consistency and discipline.',
    ],
    [
      'Individual efficiency extends far beyond the points column. Metrics like true shooting percentage, assist-to-turnover ratio, and defensive win shares tell a more complete story. The best players in the league affect the game across multiple dimensions simultaneously.',
      'Physical and mental conditioning separates elite performers, particularly in fourth-quarter situations. Players who maintain their execution late in games are invaluable. Coaches build depth specifically to keep key contributors fresh across the grueling 82-game schedule.',
    ],
    [
      'Every regular-season result contributes to the playoff picture. Seeding advantages — home-court, favorable matchups, fewer back-to-back games — can be the difference between an early exit and a deep postseason run. Teams track these margins carefully from opening night.',
      'The competitive balance across today\'s NBA ensures no outcome can be taken for granted. Trades, injuries, and emerging talent constantly reshape the landscape. Teams that develop roster depth and strategic flexibility position themselves to succeed in an ever-evolving league.',
    ],
  ],
  euroleague: [
    [
      'European basketball continues to raise its level each season, with EuroLeague serving as the premier stage outside the NBA. Tactical discipline, team chemistry, and consistent execution across a long campaign are hallmarks of the competition\'s top clubs.',
      'The home-and-away format demands adaptability. Teams must perform at a high level in hostile environments while protecting their home records. Road wins against top seeds prove decisive for Final Four qualification when standings tighten in the back half of the season.',
    ],
    [
      'Individual brilliance within a team system remains the signature of EuroLeague basketball. Point guards who read defenses and distribute efficiently are as prized as dynamic scorers. Switching schemes and zone looks demand versatility from every position on the floor.',
      'Rising young talent from across Europe continues to elevate the competition. Clubs investing in development pipelines benefit from homegrown players who know the system, while the league\'s global profile attracts top international stars and drives ever-increasing quality.',
    ],
    [
      'The playoff race is fiercely contested throughout the regular season. Only the top eight clubs advance, making every game between rivals carry enormous weight. Points difference and head-to-head records break ties when standings converge near the cut-off.',
      'The competition\'s global reach continues to grow, with broadcasters across dozens of countries and millions of followers worldwide. Clubs leverage this visibility to attract sponsorship, talent, and investment — creating a virtuous cycle of improvement for EuroLeague basketball.',
    ],
  ],
  transfers: [
    [
      'The transfer market operates on multiple levels — from blockbuster deals reshaping contenders to under-the-radar signings providing crucial depth. Front offices spend months evaluating fit, cap implications, and timing before committing to significant roster moves.',
      'Medical evaluations, contract structure, and trade-kicker clauses can accelerate or complicate any deal. Teams weigh immediate ambitions against long-term flexibility, making each transaction a complex calculation for general managers and ownership groups.',
    ],
    [
      'A roster addition\'s impact extends well beyond statistics. How a new player fits into existing chemistry, adapts to coaching, and handles the pressure of a new environment are equally critical. Teams with strong cultures integrate new arrivals more smoothly and quickly.',
      'Positional depth and lineup versatility are increasingly prized in modern roster construction. A player who defends multiple positions or transitions between roles gives coaches flexibility in high-stakes moments. Front offices actively seek these multi-dimensional contributors.',
    ],
    [
      'Global basketball talent flows through an interconnected ecosystem spanning the NBA, EuroLeague, and leagues across Asia, Australia, and Latin America. Player agents and front offices maintain constant communication as contracts and opportunities align each offseason.',
      'Salary cap management has become a sophisticated science. Teams that develop cost-efficient young talent while managing veteran contracts maintain the flexibility to make impactful moves at the deadline or in free agency, keeping themselves competitive year after year.',
    ],
  ],
  training: [
    [
      'Modern basketball training integrates data analytics with traditional skills coaching to maximize player development. GPS tracking, force plate measurements, and video analysis tools allow coaching staffs to identify inefficiencies and design targeted programs for each athlete.',
      'Recovery protocols are as critical as the training sessions themselves. Sleep hygiene, nutrition planning, and load management ensure players arrive to practice and games in optimal physical condition. Sports science departments have become integral to operations at the highest levels.',
    ],
    [
      'Shooting mechanics, ball-handling, and footwork form the foundation of individual skill development. Players benefit from deliberate repetition of fundamental movements, building muscle memory that holds under competitive pressure. Elite coaches design drills that closely simulate real game scenarios.',
      'Mental skills training — visualization, mindfulness, and competitive simulation — complements physical preparation. Athletes who develop psychological resilience perform more consistently across a long season. Sports psychologists now work closely alongside coaching staffs at top clubs.',
    ],
    [
      'Measurable performance improvements follow consistent application of evidence-based training principles. Athletes who commit to structured programs show gains in vertical leap, lateral quickness, and shooting accuracy that translate directly into game impact over the course of a season.',
      'The best training environments foster a culture of continuous improvement and accountability. When athletes push each other to higher standards in practice, that intensity carries into competition. Teams that train hard and smart consistently separate themselves when games are on the line.',
    ],
  ],
  test: [
    [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    ],
    [
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
      'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
    ],
    [
      'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
      'Nam libero tempore cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus omnis voluptas assumenda est, omnis dolor repellendus.',
    ],
  ],
};

function generateArticleBody(article) {
  const { description, body, category } = article;

  // Pre-formatted HTML body (contains h2 tags) — use as-is
  if (body && /<h2[\s>]/i.test(body)) {
    return body;
  }

  const cleanBody = (body || '').replace(/\[?\+?\d+ chars?\]?$/i, '').trim();

  const sections = BODY_SECTIONS[category] || BODY_SECTIONS.nba;
  const content  = BODY_CONTENT[category]  || BODY_CONTENT.nba;

  let html = '';

  if (description) html += `<p>${esc(description)}</p>\n`;
  if (cleanBody)   html += `<p>${esc(cleanBody)}</p>\n`;

  sections.forEach((sect, i) => {
    const paras = content[i] || content[0];
    html += `\n<h2 id="${sect.id}">${sect.h2}</h2>\n`;
    paras.forEach(p => { html += `<p>${p}</p>\n`; });
  });

  return html;
}

/* ─── TABLE OF CONTENTS ─────────────────────────────────────── */

function generateTOC(bodyHtml) {
  const headings = [];
  const re = /<h2 id="([^"]+)">([^<]+)<\/h2>/g;
  let m;
  while ((m = re.exec(bodyHtml)) !== null) {
    headings.push({ id: m[1], text: m[2] });
  }
  if (!headings.length) return '';

  const items = headings.map(h =>
    `    <li>\n      <a href="#${h.id}">${h.text}</a>\n    </li>`
  ).join('\n');

  return `<div class="art-toc">\n  <div class="art-toc-title">Contents</div>\n  <ol class="toc-list">\n${items}\n  </ol>\n</div>`;
}

/* ─── AD BLOCK ──────────────────────────────────────────────── */

function generateAdBlock() {
  return `<div class="art-ad">
  <div class="art-ad-label">Advertisement</div>
  <div class="art-ad-slot">
    <div class="art-ad-slot-icon">🏀</div>
    <div class="art-ad-slot-text">Ad Space</div>
  </div>
</div>`;
}

/* ─── EXTERNAL LINK ─────────────────────────────────────────── */

function generateExtLinkBlock(url) {
  if (!url) return '';
  return `<div class="art-full-hint">Full article available on the source site</div>
<a class="art-ext-btn" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Read Full Article <span class="art-ext-arrow">→</span></a>`;
}

/* ─── LEGACY DATE BLOCK (kept for compatibility) ────────────── */

function generateDateBlock(iso) {
  const date = fmtDate(iso);
  return date ? `<div class="art-date">${esc(date)}</div>` : '';
}

module.exports = {
  generateCards,
  generateImageBlock,
  generateBreadcrumbs,
  generateArticleMeta,
  generateArticleBody,
  generateTOC,
  generateAdBlock,
  generateDateBlock,
  generateExtLinkBlock,
  esc,
  CAT_LABELS,
};
