const { endpoint_name, endpoint_url, pass, actual_status, checked_at, existing_id } = $input.first().json;

if (!pass && !existing_id) {
  return [{ json: { action: 'new_failure', endpoint_name, endpoint_url, actual_status, checked_at } }];
}

if (pass && existing_id) {
  return [{ json: { action: 'recovery', endpoint_name, endpoint_url, checked_at, incident_id: existing_id } }];
}

// ongoing known failure, or steady pass — nothing to do
return [];
