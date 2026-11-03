-- P01 catalog only. FTS is derived and may be rebuilt; no user/auth/rating tables.
PRAGMA foreign_keys = ON;
CREATE TABLE resource_types (slug TEXT PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE categories (slug TEXT PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE tags (slug TEXT PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE resources (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 120),
  summary TEXT NOT NULL CHECK(length(summary) BETWEEN 1 AND 240),
  description TEXT NOT NULL,
  type TEXT NOT NULL REFERENCES resource_types(slug),
  canonical_url TEXT NOT NULL UNIQUE CHECK(canonical_url LIKE 'https://%'),
  platforms_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(platforms_json) AND json_type(platforms_json)='array'),
  license TEXT,
  pricing TEXT,
  icon TEXT,
  image TEXT,
  mobile_image TEXT,
  hero_title TEXT,
  media_alt TEXT,
  media_credit TEXT,
  media_kind TEXT CHECK(media_kind IS NULL OR media_kind IN ('screenshot','artwork')),
  status TEXT NOT NULL CHECK(status IN ('draft','published','archived')),
  featured_rank INTEGER CHECK(featured_rank IS NULL OR featured_rank >= 0),
  curated_rank INTEGER CHECK(curated_rank IS NULL OR curated_rank >= 0),
  search_text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX resources_status_featured ON resources(status,featured_rank,id);
CREATE INDEX resources_status_curated ON resources(status,curated_rank,id);
CREATE INDEX resources_status_type ON resources(status,type,id);
CREATE INDEX resources_status_updated ON resources(status,updated_at DESC,id);
CREATE TABLE resource_categories (
  resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  category_slug TEXT NOT NULL REFERENCES categories(slug),
  PRIMARY KEY(resource_id,category_slug)
);
CREATE INDEX resource_categories_category ON resource_categories(category_slug,resource_id);
CREATE TABLE resource_tags (
  resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  tag_slug TEXT NOT NULL REFERENCES tags(slug),
  PRIMARY KEY(resource_id,tag_slug)
);
CREATE INDEX resource_tags_tag ON resource_tags(tag_slug,resource_id);
CREATE TABLE sources (
  id TEXT PRIMARY KEY,
  resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  url TEXT NOT NULL CHECK(url LIKE 'https://%'),
  label TEXT NOT NULL,
  fields_json TEXT NOT NULL CHECK(json_valid(fields_json) AND json_type(fields_json)='array'),
  verified_at TEXT NOT NULL,
  UNIQUE(resource_id,url)
);
CREATE INDEX sources_resource ON sources(resource_id);
CREATE VIRTUAL TABLE resource_search USING fts5(search_text, content='resources', content_rowid='rowid', tokenize='unicode61 remove_diacritics 2');
CREATE TRIGGER resources_search_insert AFTER INSERT ON resources BEGIN
  INSERT INTO resource_search(rowid,search_text) VALUES(new.rowid,new.search_text);
END;
CREATE TRIGGER resources_search_delete AFTER DELETE ON resources BEGIN
  INSERT INTO resource_search(resource_search,rowid,search_text) VALUES('delete',old.rowid,old.search_text);
END;
CREATE TRIGGER resources_search_update AFTER UPDATE OF search_text ON resources BEGIN
  INSERT INTO resource_search(resource_search,rowid,search_text) VALUES('delete',old.rowid,old.search_text);
  INSERT INTO resource_search(rowid,search_text) VALUES(new.rowid,new.search_text);
END;
