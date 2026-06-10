const fs = require('fs');

let icp = '';
try {
  icp = fs.readFileSync('/opt/memory/icp.md', 'utf8');
} catch (e) {
  icp = 'ICP: developers and devops engineers evaluating deployment platforms.';
}

return $input.all().map(item => ({ json: { ...item.json, icp } }));
