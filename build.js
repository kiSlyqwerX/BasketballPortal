const fs   = require('fs');
const path = require('path');

// Load .env
if (fs.existsSync('./.env')) {
  fs.readFileSync('./.env', 'utf-8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^([^#=\s][^=]*)=(.*)/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

const { fetchAllNews }    = require('./src/service/fetchNews');
const { renderTemplate }  = require('./src/service/renderTemplate');
const {
  generateCards,
  generateImageBlock,
  generateDateBlock,
  generateExtLinkBlock,
  esc,
  CAT_LABELS,
} = require('./src/service/generatePages');

const config = JSON.parse(fs.readFileSync('./build-config.json', 'utf-8'));

/* ─── UTILS ──────────────────────────────────────────────────────── */

function copyDir(from, to, ignoreList = []) {
  if (!fs.existsSync(from)) return;
  const entries = fs.readdirSync(from, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath  = path.join(from, entry.name);
    const destPath = path.join(to,   entry.name);
    const rel      = path.relative('.', srcPath).replace(/\\/g, '/');

    if (ignoreList.includes(rel)) continue;

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath, ignoreList);
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

function activeFlags(activeSlug) {
  return {
    activeCategoryAll:        !activeSlug         ? 'active' : '',
    activeCategoryNba:        activeSlug === 'nba'        ? 'active' : '',
    activeCategoryEuroleague: activeSlug === 'euroleague' ? 'active' : '',
    activeCategoryTransfers:  activeSlug === 'transfers'  ? 'active' : '',
    activeCategoryTraining:   activeSlug === 'training'   ? 'active' : '',
  };
}

/* ─── BUILD ──────────────────────────────────────────────────────── */

async function build() {
  // 1. Clean dist
  fs.rmSync('./dist', { recursive: true, force: true });
  fs.mkdirSync('./dist');

  // 2. Copy public/ → dist/
  copyDir('./public', './dist', []);

  // 3. Copy src/ → dist/ (styles, scripts — pages/templates/service excluded)
  copyDir('./src', './dist', config.ignore);

  // 4. Place each page at its clean URL path
  for (const file of fs.readdirSync('./src/pages')) {
    if (!file.endsWith('.html')) continue;
    const base = path.basename(file, '.html');
    const dest = base === 'index'
      ? './dist/index.html'
      : `./dist/${base}/index.html`;
    writeFile(dest, fs.readFileSync(path.join('./src/pages', file), 'utf-8'));
  }

  // 5. Fetch news
  const allNews = await fetchAllNews();
  console.log(`   Fetched ${allNews.length} articles`);

  // 6. Render /news/
  writeFile('./dist/news/index.html', renderTemplate('./src/templates/news.html', {
    pageTitle:    'Latest Basketball News',
    canonicalUrl: 'https://basketball-portal-seven.vercel.app/news/',
    articleCards: generateCards(allNews),
    ...activeFlags(null),
  }));

  // 7. Render /news/[category]/ and /news/[category]/[article]/
  for (const cat of config.newsCategories) {
    const filtered = allNews.filter(a => a.category === cat.slug);

    writeFile(`./dist/news/${cat.slug}/index.html`, renderTemplate('./src/templates/news.html', {
      pageTitle:    `${cat.label} News`,
      canonicalUrl: `https://basketball-portal-seven.vercel.app/news/${cat.slug}/`,
      articleCards: generateCards(filtered),
      ...activeFlags(cat.slug),
    }));

    for (const article of filtered) {
      writeFile(
        `./dist/news/${article.category}/${article.slug}/index.html`,
        renderTemplate('./src/templates/article.html', {
          canonicalUrl:        `https://basketball-portal-seven.vercel.app/news/${article.category}/${article.slug}/`,
          articleTitle:        esc(article.title),
          articleDescription:  esc(article.description),
          articleImageBlock:   generateImageBlock(article.urlToImage, article.title),
          articleBadgeClass:   article.category,
          articleBadgeLabel:   CAT_LABELS[article.category] || 'NBA',
          articleDateBlock:    generateDateBlock(article.date),
          articleBody:         esc(article.body),
          articleExtLinkBlock: generateExtLinkBlock(article.url),
          articleCategory:     article.category,
          articleCategoryLabel: cat.label,
        })
      );
    }
  }

  console.log('✅ Build complete');
  console.log('   dist/index.html      →  /');
  console.log('   dist/game/index.html →  /game/');
  console.log('   dist/news/index.html →  /news/');
}

build().catch(err => {
  console.error('❌ Build failed:', err.message);
  process.exit(1);
});
