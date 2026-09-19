-- PG search support: trigram fuzzy + FTS GIN (applied on migrate once Neon keys exist).
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Trigram indexes for fuzzy ILIKE
CREATE INDEX IF NOT EXISTS skill_name_trgm_idx ON "Skill" USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS skill_short_trgm_idx ON "Skill" USING gin ("shortDescription" gin_trgm_ops);

-- FTS vector (name + short + description) for future to_tsvector queries
ALTER TABLE "Skill" ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(name,'') || ' ' || coalesce("shortDescription",'') || ' ' || coalesce(description,''))) STORED;
CREATE INDEX IF NOT EXISTS skill_search_vector_idx ON "Skill" USING gin (search_vector);
