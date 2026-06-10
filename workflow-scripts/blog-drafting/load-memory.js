const fs = require('fs');

let icp = '', tone = '';
try {
  icp = fs.readFileSync('/opt/memory/icp.md', 'utf8');
} catch (e) {
  icp = 'ICP: developers and devops engineers evaluating deployment platforms.';
}
try {
  tone = fs.readFileSync('/opt/memory/tone.md', 'utf8');
} catch (e) {
  tone = 'Tone: direct, technical, founder voice. No corporate speak.';
}

return [{ json: { ...($input.first().json), icp, tone } }];
