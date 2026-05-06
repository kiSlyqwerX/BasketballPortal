# Basketball Site — Technical Specification

> **Project type:** Static site with a custom Node.js build system (no frameworks, no bundlers like Webpack/Vite)
> **Stack:** Vanilla HTML / CSS / JS + Node.js (build-time only)
> **Output:** Fully pre-rendered static files in `/dist/`

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Structure](#2-project-structure)
3. [Pages & Routing](#3-pages--routing)
4. [Build System](#4-build-system)
5. [build-config.json Reference](#5-build-configjson-reference)
6. [Templating System](#6-templating-system)
7. [News API & Data Fetching](#7-news-api--data-fetching)
8. [Game Page](#8-game-page)
9. [Styling & Scripts Conventions](#9-styling--scripts-conventions)
10. [dist/ Output Structure](#10-dist-output-structure)

---

## 1. Project Overview

This is a basketball-themed website consisting of:

- A **landing page** (static)
- A **clicker mini-game** (static, like Hamster Combat)
- A **news section** with pages pre-rendered at build time using data fetched from a News API

The entire site is built by running:

```bash
node build.js
```

This command reads `build-config.json`, copies static assets, fetches news from the API, injects data into templates, and outputs everything into `/dist/`.

There is **no server-side rendering at runtime**. Everything is pre-built. The `/dist/` folder is the deployable artifact.

---

## 2. Project Structure

```
/project/
│
├── public/                  # Raw static assets — copied as-is to /dist/
│   ├── images/
│   │   └── ball.png
│   ├── fonts/
│   └── favicon.ico
│
├── src/                     # Main working area
│   │
│   ├── styles/              # Global and page-specific CSS
│   │   ├── global.css
│   │   ├── home.css
│   │   ├── game.css
│   │   └── news.css
│   │
│   ├── scripts/             # Client-side JS (runs in the browser)
│   │   ├── game.js          # Clicker logic, upgrades, localStorage
│   │   └── news.js          # Optional: client-side filtering, UI effects
│   │
│   ├── pages/               # Static HTML pages — copied as-is to /dist/
│   │   ├── index.html       # Home /
│   │   └── game.html        # Game /game/index.html
│   │
│   ├── templates/           # HTML templates — NOT copied directly
│   │   ├── news.html        # Template for /news/ and /news/[category]/
│   │   └── article.html     # Template for /news/[category]/[article]/
│   │
│   └── service/             # Build-time JS modules (Node.js, NOT browser)
│       ├── fetchNews.js     # Fetches data from News API
│       ├── renderTemplate.js # Injects data into templates
│       └── generatePages.js  # Creates all news/article files in /dist/
│
├── build.js                 # Entry point: `node build.js`
├── build-config.json        # Build configuration
│
└── dist/                    # OUTPUT — generated after build (do not edit manually)
```

### Key Rules

- `/public/` → copied entirely into `/dist/` without any transformation
- `/src/` → copied into `/dist/` **except** files listed in `"ignore"` in the config
- `/src/templates/` files are listed in `"ignore"` because they are processed separately and must not appear as raw files in `/dist/`
- `/src/service/` files are also ignored (build-time only, not needed in dist)

---

## 3. Pages & Routing

| URL | Source | Type | Description |
|-----|--------|------|-------------|
| `/` | `src/pages/index.html` | Static | Landing page |
| `/game/` | `src/pages/game.html` | Static | Clicker game |
| `/news/` | `src/templates/news.html` | Pre-rendered | All news (latest articles) |
| `/news/[category]/` | `src/templates/news.html` | Generated | News filtered by category |
| `/news/[category]/[article]/` | `src/templates/article.html` | Generated | Single article page |

### Notes on `/news/` and `/news/[category]/`

These two route types share **one single template** (`news.html`). The only difference between them is:

- Which sidebar category link has the `active` CSS class
- Which articles are displayed (all vs. filtered by category)

The build system handles this by passing different data and an `activeCategory` variable when rendering the template.

### Output file paths in `/dist/`

```
dist/
├── index.html
├── game/
│   └── index.html
└── news/
    ├── index.html                        ← /news/
    ├── nba/
    │   ├── index.html                    ← /news/nba/
    │   └── lebron-drops-50-points/
    │       └── index.html                ← /news/nba/lebron-drops-50-points/
    ├── euroleague/
    │   └── index.html
    └── transfers/
        └── index.html
```

Every page is an `index.html` inside a folder so that clean URLs work on any static host (e.g., `/news/nba/` instead of `/news/nba.html`).

---

## 4. Build System

### Entry Point: `build.js`

`build.js` is the main orchestrator. It runs sequentially:

```
1. Read build-config.json
2. Clean /dist/ (delete and recreate)
3. Copy /public/ → /dist/
4. Copy /src/ → /dist/ (excluding ignored paths)
5. Fetch news data from API
6. Render /news/index.html from template (all news)
7. For each category → render /news/[category]/index.html
8. For each article → render /news/[category]/[article]/index.html
9. Done
```

### Example `build.js` skeleton

```js
const fs = require('fs');
const path = require('path');
const { fetchAllNews } = require('./src/service/fetchNews');
const { renderTemplate } = require('./src/service/renderTemplate');

const config = JSON.parse(fs.readFileSync('./build-config.json', 'utf-8'));

async function build() {
  // 1. Clean dist
  fs.rmSync('./dist', { recursive: true, force: true });
  fs.mkdirSync('./dist');

  // 2. Copy public/
  copyDir('./public', './dist', []);

  // 3. Copy src/ (with ignore list)
  copyDir('./src', './dist', config.ignore);

  // 4. Fetch news
  const news = await fetchAllNews();

  // 5. Render /news/
  const newsHtml = renderTemplate('./src/templates/news.html', {
    articles: news,
    activeCategory: null,
    categories: config.newsCategories,
  });
  writeFile('./dist/news/index.html', newsHtml);

  // 6. Render /news/[category]/
  for (const category of config.newsCategories) {
    const filtered = news.filter(a => a.category === category.slug);
    const html = renderTemplate('./src/templates/news.html', {
      articles: filtered,
      activeCategory: category.slug,
      categories: config.newsCategories,
    });
    writeFile(`./dist/news/${category.slug}/index.html`, html);

    // 7. Render /news/[category]/[article]/
    for (const article of filtered) {
      const articleHtml = renderTemplate('./src/templates/article.html', {
        article,
        activeCategory: category.slug,
        categories: config.newsCategories,
      });
      writeFile(`./dist/news/${category.slug}/${article.slug}/index.html`, articleHtml);
    }
  }

  console.log('✅ Build complete');
}

build();
```

### `copyDir(from, to, ignoreList)`

This utility function recursively copies a directory, skipping any path that matches an entry in `ignoreList`. Paths in the ignore list are relative to the project root (e.g., `"src/templates/news.html"`).

```js
function copyDir(from, to, ignoreList = []) {
  const entries = fs.readdirSync(from, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(from, entry.name);
    const destPath = path.join(to, entry.name);

    const relativeSrc = path.relative('.', srcPath).replace(/\\/g, '/');
    if (ignoreList.includes(relativeSrc)) continue;

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath, ignoreList);
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
```

### `writeFile(filePath, content)`

Creates all intermediate directories and writes the file.

```js
function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}
```

---

## 5. build-config.json Reference

```json
{
  "copy": [
    { "from": "public", "to": "dist" },
    { "from": "src",    "to": "dist" }
  ],

  "ignore": [
    "src/templates/news.html",
    "src/templates/article.html",
    "src/service/fetchNews.js",
    "src/service/renderTemplate.js",
    "src/service/generatePages.js"
  ],

  "newsCategories": [
    { "label": "NBA",        "slug": "nba"        },
    { "label": "EuroLeague", "slug": "euroleague"  },
    { "label": "Transfers",  "slug": "transfers"  },
    { "label": "Training",   "slug": "training"   }
  ],

  "newsApi": {
    "baseUrl": "https://newsapi.org/v2",
    "query": "basketball",
    "pageSize": 50
  }
}
```

### Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `copy` | Array | Pairs of `from`/`to` directories to copy |
| `ignore` | String[] | Relative file/folder paths to skip during copy |
| `newsCategories` | Array | List of all news categories. Each has a `label` (display name) and `slug` (used in URLs and API filtering) |
| `newsApi` | Object | API configuration used by `fetchNews.js` |

---

## 6. Templating System

Templates are plain HTML files with `{{placeholder}}` tokens. The build system replaces them with actual content at build time.

### Template Syntax

```html
<!-- Scalar value -->
<h1>{{article.title}}</h1>

<!-- HTML block (pre-rendered) -->
<div class="sidebar">{{sidebar}}</div>

<!-- List (rendered by the build system before injection) -->
<ul class="article-list">{{articleCards}}</ul>
```

### `renderTemplate(templatePath, data)`

Located in `src/service/renderTemplate.js`. Reads the template file and replaces all `{{key}}` tokens with values from the `data` object.

```js
const fs = require('fs');

function renderTemplate(templatePath, data) {
  let html = fs.readFileSync(templatePath, 'utf-8');

  for (const [key, value] of Object.entries(data)) {
    const token = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(token, value ?? '');
  }

  return html;
}

module.exports = { renderTemplate };
```

For complex values (like a list of article cards), pre-render them to an HTML string in `build.js` before passing into `renderTemplate`.

**Example:**

```js
const articleCards = articles
  .map(a => `
    <article class="card">
      <img src="${a.urlToImage}" alt="${a.title}" />
      <h2><a href="/news/${a.category}/${a.slug}/">${a.title}</a></h2>
      <p>${a.description}</p>
    </article>
  `)
  .join('');

renderTemplate('./src/templates/news.html', {
  articleCards,
  activeCategory: 'nba',
  // ...
});
```

### news.html Template Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>{{pageTitle}} — HoopZone</title>
  <link rel="stylesheet" href="/styles/global.css" />
  <link rel="stylesheet" href="/styles/news.css" />
</head>
<body>

  <!-- shared nav included as pre-rendered string -->
  {{nav}}

  <div class="layout">
    <aside class="sidebar">
      <ul>
        <li class="{{activeCategoryNba}}"><a href="/news/nba/">NBA</a></li>
        <li class="{{activeCategoryEuroleague}}"><a href="/news/euroleague/">EuroLeague</a></li>
        <li class="{{activeCategoryTransfers}}"><a href="/news/transfers/">Transfers</a></li>
        <li class="{{activeCategoryTraining}}"><a href="/news/training/">Training</a></li>
      </ul>
    </aside>

    <main class="articles">
      {{articleCards}}
    </main>
  </div>

  <script src="/scripts/news.js"></script>
</body>
</html>
```

> The `activeCategory*` tokens are injected as either `"active"` or `""` by the build system based on which page is being generated.

### article.html Template Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>{{articleTitle}} — HoopZone</title>
  <link rel="stylesheet" href="/styles/global.css" />
  <link rel="stylesheet" href="/styles/news.css" />
</head>
<body>

  {{nav}}

  <div class="layout">
    <aside class="sidebar">
      <!-- same sidebar as news.html, same active category logic -->
      {{sidebar}}
    </aside>

    <main class="article">
      <img src="{{articleImage}}" alt="{{articleTitle}}" />
      <h1>{{articleTitle}}</h1>
      <p class="meta">{{articleDate}} · {{articleSource}}</p>
      <div class="body">{{articleBody}}</div>
      <a href="/news/{{articleCategory}}/" class="back">← Back to {{articleCategoryLabel}}</a>
    </main>
  </div>

</body>
</html>
```

---

## 7. News API & Data Fetching

### `src/service/fetchNews.js`

This module runs **only at build time** (Node.js). It fetches articles from the News API and returns a normalized array.

```js
const config = JSON.parse(require('fs').readFileSync('./build-config.json', 'utf-8'));

async function fetchAllNews() {
  const { baseUrl, query, pageSize } = config.newsApi;
  const apiKey = process.env.NEWS_API_KEY; // loaded from .env or environment

  const url = `${baseUrl}/everything?q=${query}&pageSize=${pageSize}&apiKey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  return data.articles.map(normalizeArticle);
}

function normalizeArticle(raw) {
  return {
    slug:        slugify(raw.title),
    title:       raw.title,
    description: raw.description,
    body:        raw.content,
    urlToImage:  raw.urlToImage,
    date:        raw.publishedAt,
    source:      raw.source.name,
    category:    detectCategory(raw),  // maps article to a category slug
  };
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function detectCategory(article) {
  // Simple keyword-based categorization
  const text = (article.title + ' ' + article.description).toLowerCase();
  if (text.includes('transfer') || text.includes('sign')) return 'transfers';
  if (text.includes('euroleague'))                         return 'euroleague';
  if (text.includes('train') || text.includes('drill'))   return 'training';
  return 'nba'; // default
}

module.exports = { fetchAllNews };
```

> **API Key:** Never hardcode the key. Pass it via environment variable: `NEWS_API_KEY=your_key node build.js` or use a `.env` file with a loader.

---

## 8. Game Page

`src/pages/game.html` is a **fully static page**. It is copied as-is to `dist/game/index.html`.

All game logic lives in `src/scripts/game.js` (client-side).

### Features to implement in `game.js`

- Click/tap the basketball → increment score
- Display current score (coins/taps)
- Upgrades panel (e.g., "Auto-tap", "Multiplier x2")
- Upgrades cost coins and are purchased via UI buttons
- All game state (score, purchased upgrades) persisted in `localStorage`
- On page load, restore state from `localStorage`

### localStorage schema

```js
{
  "balance": 1042,
  "upgrades": {
    "autoTap": true,
    "multiplier2x": false,
    "multiplier5x": false
  }
}
```

---

## 9. Styling & Scripts Conventions

### CSS

- All styles live in `src/styles/`
- `global.css` — CSS variables, reset, typography, shared layout
- Page-specific files: `home.css`, `game.css`, `news.css`
- Each HTML page links only the CSS files it needs

### JavaScript

- All browser JS lives in `src/scripts/`
- Files are linked via `<script src="/scripts/game.js">` in the HTML
- `src/service/` contains **Node.js only** modules — they use `require()` and `fs`, they never run in the browser
- No module bundler is used — scripts are loaded directly as classic scripts

### No Inline JS in HTML

**Never** use inline event handlers in HTML attributes. All event binding must happen in `.js` files via `addEventListener`.

```html
<!-- BAD -->
<button onclick="toggleTutorial()">How to Play</button>
<a href="#" onclick="navigate(event, 'home.html', 'back')">Home</a>

<!-- GOOD -->
<button id="tut-toggle">How to Play</button>
```

```js
// good — in the corresponding .js file
document.getElementById('tut-toggle').addEventListener('click', toggleTutorial);
```

This applies to all inline handlers: `onclick`, `onchange`, `onsubmit`, `onkeydown`, `oninput`, etc.

### HTML Formatting

Block-level elements must be written in **expanded format** — each opening tag, child, and closing tag on its own line with proper indentation. Never collapse multiple tags onto a single line.

```html
<!-- BAD -->
<div class="stat-row"><div class="stat-label">Taps / sec</div><div class="stat-value" id="stat-tps">0</div></div>

<!-- GOOD -->
<div class="stat-row">
  <div class="stat-label">Taps / sec</div>
  <div class="stat-value" id="stat-tps">0</div>
</div>
```

Inline elements (`<span>`, `<a>`, `<strong>`, etc.) may remain inline when they are short and contained within a single line of their parent.

### Path Convention

All asset paths in HTML use **absolute paths from root** (`/styles/...`, `/scripts/...`, `/images/...`) so they work correctly at any nesting depth in the output.

---

## 10. dist/ Output Structure

After running `node build.js`, the `/dist/` folder should look like this:

```
dist/
│
├── images/                         ← from public/
├── fonts/                          ← from public/
├── favicon.ico                     ← from public/
│
├── styles/                         ← from src/styles/
│   ├── global.css
│   ├── home.css
│   ├── game.css
│   └── news.css
│
├── scripts/                        ← from src/scripts/
│   ├── game.js
│   └── news.js
│
├── index.html                      ← from src/pages/index.html → /
├── game/
│   └── index.html                  ← from src/pages/game.html → /game/
│
└── news/
    ├── index.html                  ← rendered from template → /news/
    ├── nba/
    │   ├── index.html              ← rendered from template → /news/nba/
    │   ├── lebron-drops-50-points/
    │   │   └── index.html          ← rendered from template → /news/nba/lebron-drops-50-points/
    │   └── curry-breaks-record/
    │       └── index.html
    ├── euroleague/
    │   └── index.html
    ├── transfers/
    │   └── index.html
    └── training/
        └── index.html
```

> ⚠️ `/dist/` should be in `.gitignore` — it is a build artifact, not source code.
> ✅ `node build.js` must always produce a complete, self-contained `/dist/` from scratch.

---

## Quick Reference: What Goes Where

| File type | Location | Ends up in dist? | How? |
|-----------|----------|-----------------|------|
| Static assets (images, fonts) | `public/` | ✅ Yes | Direct copy |
| Static HTML pages | `src/pages/` | ✅ Yes | Direct copy |
| CSS stylesheets | `src/styles/` | ✅ Yes | Direct copy |
| Browser JS | `src/scripts/` | ✅ Yes | Direct copy |
| HTML templates | `src/templates/` | ✅ Yes (as rendered pages) | Processed by build system |
| Build-time Node.js services | `src/service/` | ❌ No | Listed in `ignore` |
| `build.js` | `/` | ❌ No | Listed in `ignore` |
| `build-config.json` | `/` | ❌ No | Listed in `ignore` |