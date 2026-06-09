-- Movie Tracker Database Schema (Cloudflare D1)

-- Items (movies, TV, anime, books)
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  original_title TEXT,
  type TEXT NOT NULL CHECK(type IN ('movie','tv','anime','book')),
  year INTEGER,
  cover_url TEXT,
  backdrop_url TEXT,
  description TEXT,
  director TEXT,
  cast TEXT,
  genres TEXT,
  country TEXT,
  language TEXT,
  runtime INTEGER,
  rating REAL DEFAULT 0,
  tmdb_id INTEGER,
  douban_id TEXT,
  status TEXT DEFAULT 'want' CHECK(status IN ('want','watching','watched','paused','dropped')),
  watch_date TEXT,
  notes TEXT,
  tags TEXT,
  author TEXT,
  publisher TEXT,
  page_count INTEGER,
  current_page INTEGER DEFAULT 0,
  play_urls TEXT,
  current_episode INTEGER DEFAULT 1,
  playback_position INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  rating INTEGER DEFAULT 0 CHECK(rating >= 0 AND rating <= 5),
  is_public INTEGER DEFAULT 0,
  is_archived INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Journal Pages
CREATE TABLE IF NOT EXISTS journal_pages (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT,
  elements_json TEXT NOT NULL DEFAULT '[]',
  paper_mode TEXT DEFAULT 'solid',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Quotes
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  source_info TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Watch Logs (multi-viewing records)
CREATE TABLE IF NOT EXISTS watch_logs (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  watch_date TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_items_user ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_type ON items(user_id, type);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_item ON reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_item ON journal_pages(item_id);
CREATE INDEX IF NOT EXISTS idx_quotes_item ON quotes(item_id);
CREATE INDEX IF NOT EXISTS idx_watch_logs_item ON watch_logs(item_id);
