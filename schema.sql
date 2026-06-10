CREATE TABLE IF NOT EXISTS incidents (
    id              TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    type            TEXT NOT NULL DEFAULT 'cstate',   -- 'cstate' | 'watchdog'
    endpoint_name   TEXT,                             -- watchdog only
    status          TEXT NOT NULL,                    -- 'ongoing' | 'resolved'
    severity        TEXT,                             -- 'critical' | 'major' | 'minor'
    first_seen_at   INTEGER NOT NULL,
    last_alerted_at INTEGER,
    resolved_at     INTEGER,
    acked           INTEGER DEFAULT 0,
    ack_reason      TEXT,
    postmortem      TEXT
);

CREATE TABLE IF NOT EXISTS reddit_seen (
    thread_id   TEXT PRIMARY KEY,
    subreddit   TEXT NOT NULL,
    title       TEXT,
    url         TEXT,
    seen_at     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS drafts (
    id          TEXT PRIMARY KEY,
    type        TEXT NOT NULL,            -- 'blog' | 'newsletter'
    prompt      TEXT,
    content     TEXT,
    created_at  INTEGER NOT NULL
);
