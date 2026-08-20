-- Store up to three customer-facing product benefits, one per line.
ALTER TABLE products ADD COLUMN IF NOT EXISTS benefits TEXT;