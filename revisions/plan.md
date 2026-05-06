# План переписування BasketTap

> ⚠️ **Правило:** перед початком кожної фази — перечитати `revisions/spec.md` цілком, звірити план з реальним станом файлів і тільки тоді починати.

---

## Що змінюється (поточний стан → spec.md)

| | Зараз | За spec |
|---|---|---|
| Структура | Плоска — всі html в корені | `src/pages/`, `src/templates/`, `src/service/`, `public/` |
| CSS | 1 монолітний файл | `global.css` + по файлу на сторінку |
| JS | 1 монолітний `app.js` | `game.js`, `news.js` — тільки браузерний код |
| Inline JS в HTML | Є (`<script>` в `index.html`) | Заборонено |
| Новини | Статична `news.html` | Pre-rendered з NewsAPI під час білду |
| Кожна стаття | Немає окремих сторінок | `/news/nba/lebron-drops-50-points/index.html` |
| Білд система | Немає | `node build.js` → `/dist/` |
| URL-и | `news.html`, `article.html` | `/news/`, `/news/nba/`, `/game/` |
| Шляхи до ресурсів | Відносні (`src/styles/...`) | Абсолютні (`/styles/...`) |

---

## Фаза 1 — Реструктуризація вихідних файлів ✅
> 📖 Перечитати `spec.md` розділи 2, 9 перед початком.

*Мета: правильна папкова структура без будь-якої зміни логіки гри*

1. Створити нову структуру: `public/`, `src/pages/`, `src/styles/`, `src/scripts/`, `src/templates/`, `src/service/`
2. Перемістити `favicon.svg` та зображення → `public/`
3. Перемістити `home.html` → `src/pages/index.html`, `index.html` (гра) → `src/pages/game.html`
4. Розбити `src/styles/styles.css` → `global.css` + `home.css` + `game.css` + `news.css`
5. Перейменувати `src/scripts/app.js` → `src/scripts/game.js`; спільні утиліти (`navigate`, `fmtBig`, sessionStorage-check) → `src/scripts/ui.js`
6. Прибрати весь inline `<script>` і `<style>` з HTML-файлів; розбити логіку по `home.js`, `news.js`, `article.js`
7. Виправити всі шляхи до ресурсів на абсолютні (`/styles/game.css`, `/scripts/game.js`)

**Результат:** проект має правильну структуру, гра все ще працює якщо відкрити через локальний сервер.

**Примітки по реалізації:**
- `ui.js` завантажується першим скриптом всередині `<body>` (не в `<head>`!) — щоб `document.body` вже існував для sessionStorage-перевірки
- Логотип у `article.html` — клас `.art-logo`, не `.logo` (`.logo` не має `text-decoration:none`)
- Артикул навігація в `news.js` (`openArticle`) тимчасово веде на `/src/templates/article.html` — буде замінено в фазі 3
- Стара `news.html` в корені (з `M` статусом) залишається до фази 4

---

## Фаза 2 — Білд система (статичні сторінки)
> 📖 Перечитати `spec.md` розділи 4, 5, 10 перед початком.1

*Мета: `node build.js` продукує `/dist/` з home + game*

1. Створити `build-config.json` зі списком `ignore`, категоріями новин, конфігом API
2. Створити `src/service/renderTemplate.js` — замінює `{{token}}` в шаблонах
3. Написати `build.js`:
   - Очищення та перестворення `/dist/`
   - Копіювання `public/` → `dist/`
   - Копіювання `src/` → `dist/` з урахуванням ignore-листа
4. Перевірити що `dist/index.html` (home) і `dist/game/index.html` (гра) доступні і працюють

**Результат:** `node build.js` генерує робочий `/dist/` для 2 сторінок. Новини — ще заглушка.

---

## Фаза 3 — Шаблони новин та генерація сторінок
> 📖 Перечитати `spec.md` розділи 3, 6, 7 перед початком.

*Мета: новини pre-rendered з реальними даними*

1. Написати `src/service/fetchNews.js` — отримує статті з NewsAPI, нормалізує, робить `slug`, визначає категорію
2. Оновити `src/templates/news.html` — додати `{{articleCards}}`, `{{activeCategoryNba}}`, `{{activeCategoryEuroleague}}` і т.д., `{{nav}}`
3. Оновити `src/templates/article.html` — додати `{{articleTitle}}`, `{{articleBody}}`, `{{articleImage}}`, `{{articleDate}}`, `{{articleSource}}`, `{{articleCategory}}` і т.д.
4. Написати `src/service/generatePages.js` — будує HTML-рядки для карток і статей
5. Інтегрувати в `build.js`: рендеринг `/news/`, `/news/[category]/`, `/news/[category]/[article]/`
6. Замінити тимчасовий шлях в `news.js` (`openArticle`) на правильний — тепер сторінки статичні, JS-навігація не потрібна
7. Додати `.env` підтримку для `NEWS_API_KEY`
8. Додати `dist/` в `.gitignore`

**Результат:** повністю робочий білд із pre-rendered новинами по категоріях.

---

## Фаза 4 — Доводка і перевірка
> 📖 Перечитати `spec.md` повністю перед початком.

*Мета: все чисто, нічого зайвого*

1. Перевірити що в жодному HTML немає inline JS чи CSS
2. Перевірити всі internal посилання — використовують clean URL (`/game/`, `/news/nba/`)
3. Протестувати build з нуля на чистій машині (`rm -rf dist && node build.js`)
4. Видалити старі файли з кореня (`index.html`, `home.html`, `news.html`, `article.html`) та `src/scripts/app.js`, `src/styles/styles.css`
5. Перевірити SEO-мета теги і canonical URLs у всіх шаблонах
