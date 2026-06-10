const endpoints = JSON.parse($input.first().json.endpoints_json || '[]');
if (!endpoints.length) return [];

return endpoints.map(ep => ({ json: ep }));
