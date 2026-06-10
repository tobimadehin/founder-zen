const fs = require('fs');

const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const filename = `/tmp/draft-blog-${ts}.md`;
fs.writeFileSync(filename, $input.first().json.md_content);

return [{ json: { ...($input.first().json), filename } }];
