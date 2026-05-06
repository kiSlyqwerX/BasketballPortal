const fs = require('fs');

function renderTemplate(templatePath, data) {
  let html = fs.readFileSync(templatePath, 'utf-8');

  for (const [key, value] of Object.entries(data)) {
    const token = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    html = html.replace(token, () => String(value ?? ''));
  }

  return html;
}

module.exports = { renderTemplate };
