const subjects = JSON.parse($('Pass 1A: Subject Lines').first().json.choices[0].message.content);
const outline = JSON.parse($('Pass 1B: Content Outline').first().json.choices[0].message.content);

return [{ json: { ...($('Load ICP + Tone').first().json), subjects, outline } }];
