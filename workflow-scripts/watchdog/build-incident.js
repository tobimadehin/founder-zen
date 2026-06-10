const { endpoint_name, endpoint_url, actual_status, checked_at } = $input.first().json;

const id = `watchdog-${endpoint_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${checked_at}`;
const date = new Date(checked_at * 1000).toISOString();

const cstateContent = [
  '---',
  `title: "${endpoint_name} is down"`,
  `date: ${date}`,
  'resolved: false',
  'resolvedWhen: ""',
  'severity: down',
  'affectedSystems:',
  `  - ${endpoint_name}`,
  'section: issue',
  '---',
  '',
  `Automated health check failed. Expected 200, got ${actual_status}.`,
  '',
  `URL: ${endpoint_url}`,
].join('\n');

const alertText = `🔴 *${endpoint_name} is down*\n\nExpected 200, got ${actual_status}.\n${endpoint_url}`;

return [{
  json: {
    id,
    endpoint_name,
    endpoint_url,
    actual_status,
    checked_at,
    alert_text: alertText,
    github_path: `content/incidents/${id}.md`,
    github_content: Buffer.from(cstateContent).toString('base64'),
    github_message: `incident: ${endpoint_name} is down`,
  },
}];
