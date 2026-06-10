'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT, 'workflows', 'templates');
const OUTPUT_DIR = path.join(ROOT, 'workflows');

function resolveFileRefs(value) {
  if (typeof value === 'string' && value.startsWith('__FILE__:')) {
    const filePath = path.join(ROOT, value.slice('__FILE__:'.length));
    return fs.readFileSync(filePath, 'utf8');
  }
  if (Array.isArray(value)) return value.map(resolveFileRefs);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveFileRefs(v)]));
  }
  return value;
}

const templates = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.json'));

for (const file of templates) {
  const template = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, file), 'utf8'));
  const resolved = resolveFileRefs(template);
  fs.writeFileSync(path.join(OUTPUT_DIR, file), JSON.stringify(resolved, null, 2));
  console.log(`built: ${file}`);
}
