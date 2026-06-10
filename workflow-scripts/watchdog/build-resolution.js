const { endpoint_name, endpoint_url, checked_at, incident_id } = $input.first().json;

const date = new Date(checked_at * 1000).toISOString();

// fetch the existing file SHA so GitHub can update it
const existingSha = $('Get Incident File').first().json?.sha || null;

const cstateContent = [
  '---',
  `title: "${endpoint_name} is down"`,
  `date: ${date}`,
  'resolved: true',
  `resolvedWhen: "${date}"`,
  'severity: down',
  'affectedSystems:',
  `  - ${endpoint_name}`,
  'section: issue',
  '---',
  '',
  `Resolved. Service recovered at ${date}.`,
  '',
  `URL: ${endpoint_url}`,
].join('\n');

const resolveText = `✅ *${endpoint_name} is back up*\n\n${endpoint_url}`;

return [{
  json: {
    incident_id,
    endpoint_name,
    endpoint_url,
    checked_at,
    resolve_text: resolveText,
    github_path: `content/incidents/${incident_id}.md`,
    github_content: Buffer.from(cstateContent).toString('base64'),
    github_message: `resolved: ${endpoint_name} is back up`,
    github_sha: existingSha,
  },
}];
