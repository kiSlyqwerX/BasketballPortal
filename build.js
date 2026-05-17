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
  generateBreadcrumbs,
  generateArticleMeta,
  generateArticleBody,
  generateTOC,
  generateAdBlock,
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
    activeCategoryAll:        !activeSlug                  ? 'active' : '',
    activeCategoryNba:        activeSlug === 'nba'        ? 'active' : '',
    activeCategoryEuroleague: activeSlug === 'euroleague' ? 'active' : '',
    activeCategoryTransfers:  activeSlug === 'transfers'  ? 'active' : '',
    activeCategoryTraining:   activeSlug === 'training'   ? 'active' : '',
    activeCategoryTest:       activeSlug === 'test'       ? 'active' : '',
  };
}

const TEST_ARTICLES = [
  {
    slug: 'test-article-one',
    title: "Pistons' Meteoric Rise: Cunningham's Poise, Cleveland's Shooting Frost, and Detroit's Band of Redemption",
    description: "Detroit stand two wins away from the Eastern Conference Finals after a dominant Game 2 victory over Cleveland — a stunning turnaround from a 14-win 2023-24 campaign.",
    body: `<p>The scope of the Detroit Pistons' transformation is genuinely breathtaking when placed in historical context. It was the 2023-24 season when this franchise was an afterthought, stumbling through an 82-game schedule to secure a grand total of 14 wins. That level of futility usually consigns a team to years of obscurity. Yet here they stand on May 7, 2026, not merely participating in the postseason theater, but dominating it. With their second consecutive home victory over the Cleveland Cavaliers, they have planted their flag just two triumphs away from a berth in the Eastern Conference Finals.</p>
<p>The series scoreline of 2-0 does not fully illustrate the control Detroit exerted in Game 2. For the second straight contest, the Pistons exhibited a superior collective composure during high-pressure minutes. Their defensive rotations were sharper, the number of unforced errors was significantly lower, and their offensive execution down the stretch made Cleveland's efforts look chaotic by comparison. The Cavaliers' offensive philosophy is heavily reliant on the individual brilliance of James Harden and Donovan Mitchell. Through the first two games of this semifinal clash, those two central figures produced muted, ineffective performances, while Cleveland's auxiliary pieces failed to pick up the slack.</p>
<p>The post-game demeanor of Cavs coach Kenny Atkinson betrayed a man searching for a schematic escape hatch. He openly admitted his confusion regarding his team's sluggish starts and inability to maintain cohesion, promising a return to the strategic drawing board. However, the solutions feel elusive. Here is an in-depth analysis of the four critical elements that defined Detroit's Game 2 victory.</p>

<h2 id="s-cunningham">The Unfazed Brilliance of Cade Cunningham</h2>
<h3>Command of the Critical Moments</h3>
<p>To understand what Cade Cunningham did to Cleveland in this game, you must appreciate the art of pacing and temperament over sheer athletic explosion. He has earned a burgeoning reputation as the most level-headed star on the floor in tense situations. In a raucous fourth quarter where the Cavaliers were desperately attempting to flip the script, Cunningham completely hijacked the flow of the game. He dropped a dozen of his total 25 points during this final period, effectively neutralizing every counter-punch Cleveland attempted.</p>
<p>He is not a player who relies on superhuman verticality or blinding speed; his game is orchestrated from the ground. Despite a lack of elite explosive bounce, Cunningham possesses an uncanny ability to slither past on-ball defenders and carve out the necessary inches for a clean jumper. What distinguishes him as a burgeoning superstar extends far beyond the bucket tally. His leadership is non-verbal, communicated through his refusal to panic. He exhibits an intrinsic trust in his teammates' spacing, displays exceptional instincts for passing lanes defensively, and never abandons the game plan. His statistical output — averaging 31 points on 55% shooting from distance along with over seven assists across his last five contests — is merely a reflection of a deeper competitive mettle. He is not just putting up numbers; he is engineering victories.</p>
<h3>The Intangibles Behind the Production</h3>
<p>The uniqueness of Cunningham lies in the fact that a standard box score cannot measure his true influence. He executes the hidden mechanics of basketball — decision-making under duress, spatial awareness in the half-court, and a palpable steadiness that radiates through the roster — with veteran precision. Regardless of whether his shot is falling early, or if a defensive rotation forces a difficult pass, his demeanor never shifts toward frustration. There is a total absence of flinching. In Game 2, this manifested as stifling defense to complement his fourth-quarter scoring burst. He is rarely caught out of position on switches, and his size prevents opponents from overpowering him on the drive. This two-way, high-IQ command turns him into a closer who controls the outcome without necessarily dominating the possession count.</p>

<h2 id="s-harden">The Reputation Weight Straining James Harden</h2>
<h3>A Persistent Pattern of Playoff Bleeding</h3>
<p>If James Harden had refused the midseason move from the Clippers, his spring would have concluded without playoff basketball, leaving his legacy in a state of suspended ambiguity. By accepting the trade to Cleveland, he walked straight back into the type of pressurized spotlight that has so often singed his reputation. Regrettably for him and the Cavs, the playoff pattern is not merely repeating itself; it is intensifying. The former MVP, a lock for the Hall of Fame based on his revolutionary scoring and playmaking, continues to be haunted by chronic issues with ball security and inefficiency at the most critical times.</p>
<p>His statistical output in Game 2 was sobering. He converted just three field goals on 13 attempts, finishing with 10 points while handing the ball back to Detroit four times. Perhaps the most damning detail was his vanishing act in the second half, where a player of his shot-creation caliber managed to launch only two shots. This outing marked the fourth instance in the Cavaliers' nine playoff games this season where Harden's turnover count eclipsed the number of shots he successfully put through the net. It is a shocking metric for a primary ball-handler.</p>
<h3>The Clock Ticking on a Finals Return</h3>
<p>The historical backdrop makes this slump even more glaring. Harden has not navigated his way back to the NBA Finals since his role-player days in Oklahoma City over a decade ago. His journey through Houston, Brooklyn, Philadelphia, and the Clippers has consistently ended with a spring collapse rather than a coronation. Now at 36, the sight of him struggling to beat defenders off the bounce or settling for passive possessions signals a potential closing of his championship window. The Cavaliers are now in a 0-2 hole precisely because their offensive engine is malfunctioning. A narrative shift is still technically possible with a powerful Game 3 home performance, but the mountain of evidence suggests that Detroit's length and discipline pose a riddle that this version of Harden simply cannot solve.</p>

<h2 id="s-shooting">The Perimeter Ice Age That Froze Cleveland</h2>
<h3>A Catastrophic Long-Range Collapse</h3>
<p>To describe the Cavaliers' shooting in the final 12 minutes, one might imagine the sound of iron ringing out in a grim, repetitive chorus. The team put up 11 three-point attempts in the fourth quarter and missed every single one. In a league defined by spacing and the mathematics of the three-point line, generating a flat zero from distance in a closeout period is essentially forfeiting the game. These were empty trips that led directly to transition opportunities and high-percentage looks for the Pistons on the other end. Had Cleveland managed to hit at a merely average clip during that stretch, the final margin could have swung in their favor. Instead, the drought created an unbridgeable chasm.</p>
<h3>The Star Duo's Shooting Struggles</h3>
<p>The infection of poor shooting started at the top of the food chain. Mitchell and Harden combined to shoot a dismal 2-for-13 from beyond the arc. For an offense predicated on these guards creating gravity, the inability to hit open looks allowed Detroit's defense to pack the paint and clog passing lanes. The reliability of role players like Max Strus, who missed the bulk of his attempts, could not rescue them, especially with the sharpshooting Sam Merrill sidelined by a hamstring issue. It is bizarrely fortunate for Cleveland that the game remained competitive despite such a glaring offensive hemorrhage. The silver lining is that the law of averages tends to favor shooters on their home floor, but the Pistons have established a defensive tone that suggests these misses are not merely coincidental.</p>

<h2 id="s-harris">The Redemption Tour: Harris and Robinson Reborn</h2>
<h3>The Confounding Revival of Castoffs</h3>
<p>In both South Florida and the city of brotherly love, basketball observers are squinting at their screens in bewilderment. The performances of Tobias Harris and Duncan Robinson in Detroit blues seem to belong to different players than the ones those fanbases remember discarding. Harris, who once closed his Philadelphia tenure with a zero-point playoff stinker over 29 minutes, is currently riding an unprecedented wave of seven consecutive 20-point postseason games. He is methodically brutalizing Cleveland's defenders with a deliberate, floor-bound post game, carving out deep position and executing a turnaround jump shot that has become virtually unguardable.</p>
<p>Coach J.B. Bickerstaff articulated it perfectly by noting Harris possesses zero insecurity regarding his identity. He knows exactly where he is going on the floor — usually the left block — and he systematically gets to that spot regardless of the resistance. Simultaneously, Robinson has transformed back into the lethal floor-spacer that teams once feared during Miami's Finals run. Logging 37 heavy minutes in Game 2, Robinson responded with 17 points, punishing Cleveland's rotations with 10-for-17 three-point shooting in the series. The reliability and consistency of these two revamped veterans are providing the Pistons with a stable floor of production that the Cavaliers' supporting cast simply cannot touch, leaving their former employers to wonder where this version of the players had been hiding.</p>`,
    urlToImage: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Cade_Cunningham_charging_against_T._J._McConnell%2C_2024-11-29.jpg',
    date: '2026-05-07T20:00:00.000Z',
    source: 'BasketTap Editorial',
    category: 'test',
    url: null,
  },
  {
    slug: 'test-article-two',
    title: 'Test Article Two',
    description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    body: '',
    urlToImage: null,
    date: new Date().toISOString(),
    source: 'Test',
    category: 'test',
    url: null,
  },
  {
    slug: 'test-article-three',
    title: 'Test Article Three',
    description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    body: '',
    urlToImage: null,
    date: new Date().toISOString(),
    source: 'Test',
    category: 'test',
    url: null,
  },
  {
    slug: 'test-article-four',
    title: 'Test Article Four',
    description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    body: '',
    urlToImage: null,
    date: new Date().toISOString(),
    source: 'Test',
    category: 'test',
    url: null,
  },
];

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

  // 5. Fetch news + inject test articles
  const allNews = [...(await fetchAllNews()), ...TEST_ARTICLES];
  console.log(`   Fetched ${allNews.length} articles (incl. ${TEST_ARTICLES.length} test)`);

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
      const articleBodyHtml = generateArticleBody(article);
      const articleTOCHtml  = generateTOC(articleBodyHtml);
      const articleMetaHtml = generateArticleMeta(article.date, article.source, articleBodyHtml);

      writeFile(
        `./dist/news/${article.category}/${article.slug}/index.html`,
        renderTemplate('./src/templates/article.html', {
          canonicalUrl:         `https://basketball-portal-seven.vercel.app/news/${article.category}/${article.slug}/`,
          articleTitle:         esc(article.title),
          articleDescription:   esc(article.description),
          articleImageBlock:    generateImageBlock(article.urlToImage, article.title),
          articleBadgeClass:    article.category,
          articleBadgeLabel:    CAT_LABELS[article.category] || 'NBA',
          breadcrumbs:          generateBreadcrumbs(article.category, cat.label, article.title),
          articleMeta:          articleMetaHtml,
          articleBody:          articleBodyHtml,
          articleTOC:           articleTOCHtml,
          articleAd:            generateAdBlock(),
          articleExtLinkBlock:  generateExtLinkBlock(article.url),
          articleCategory:      article.category,
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
