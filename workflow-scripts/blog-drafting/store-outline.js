const outline = JSON.parse($input.first().json.choices[0].message.content);

return [{ json: { ...($('Load ICP + Tone').first().json), outline } }];
