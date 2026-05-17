const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./build-config.json', 'utf-8'));

async function fetchAllNews() {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) throw new Error('NEWS_API_KEY not set — add it to .env');

  const { baseUrl, pageSize } = config.newsApi;
  const allArticles = [];
  const seenUrls = new Set();

  for (const cat of config.newsCategories) {
    if (!cat.query) continue;
    const query = cat.query;
    const url = `${baseUrl}/everything?q=${encodeURIComponent(query)}&pageSize=${pageSize}&language=en&sortBy=publishedAt&apiKey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`NewsAPI responded with ${res.status} for category "${cat.slug}"`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(`NewsAPI: ${data.message}`);

    const articles = (data.articles || [])
      .filter(a => a.title && a.title !== '[Removed]' && !seenUrls.has(a.url))
      .map(raw => {
        seenUrls.add(raw.url);
        const a = normalizeArticle(raw);
        a.category = cat.slug;
        return a;
      });

    allArticles.push(...articles);
  }

  return allArticles;
}

function normalizeArticle(raw) {
  return {
    slug:        slugify(raw.title),
    title:       raw.title        || '',
    description: raw.description  || '',
    body:        raw.content      || raw.description || '',
    urlToImage:  raw.urlToImage   || '',
    date:        raw.publishedAt  || '',
    source:      raw.source?.name || '',
    url:         raw.url          || '',
    category:    '',
  };
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

module.exports = { fetchAllNews };
