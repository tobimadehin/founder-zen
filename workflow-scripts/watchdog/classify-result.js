const ep = $('Load Endpoints').item.json;
const response = $input.first().json;

// continueOnFail gives us error object on network failure
const statusCode = response.statusCode || (response.error ? 0 : 200);
const pass = statusCode === (ep.expect_status || 200);

return [{
  json: {
    endpoint_name: ep.name,
    endpoint_url: ep.url,
    expect_status: ep.expect_status || 200,
    actual_status: statusCode,
    pass,
    checked_at: Math.floor(Date.now() / 1000),
  },
}];
