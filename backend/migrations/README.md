# Database Migrations

This directory contains SQL migration files for the FoloUp database schema.

## How to Run Migrations

Since this project uses Supabase, you have two options to run migrations:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the content of the migration file (e.g., `001_add_summary_fields.sql`)
4. Paste it into the SQL Editor
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Navigate to project root
cd /path/to/Userology-Foloup

# Run the migration
supabase db push --file backend/migrations/001_add_summary_fields.sql
```

### Option 3: Using psql (Direct Database Connection)

If you have direct database access:

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration
\i backend/migrations/001_add_summary_fields.sql
```

## Migration Files

### 001_add_summary_fields.sql

**Date**: 2025-01-20

**Description**: Adds fields for enhanced interview analytics

**Changes**:
- **response table**:
  - `key_insights` (JSONB): Stores 3-5 key insights per interview
  - `important_quotes` (JSONB): Stores 5-10 important quotes with timestamps

- **interview table**:
  - `executive_summary` (TEXT): One-paragraph study summary
  - `objective_deliverables` (JSONB): Dynamic deliverables based on study objective
  - `cross_interview_insights` (JSONB): 5-8 insights across all interviews
  - `evidence_bank` (JSONB): Links insights to supporting user quotes

**Indexes**:
- `idx_interview_has_summary`: For querying interviews with summaries
- `idx_response_has_insights`: For querying responses with insights

## Rollback

If you need to rollback this migration, run:

```sql
-- Remove new columns from response table
ALTER TABLE response 
DROP COLUMN IF EXISTS key_insights,
DROP COLUMN IF EXISTS important_quotes;

-- Remove new columns from interview table
ALTER TABLE interview 
DROP COLUMN IF EXISTS executive_summary,
DROP COLUMN IF EXISTS objective_deliverables,
DROP COLUMN IF EXISTS cross_interview_insights,
DROP COLUMN IF EXISTS evidence_bank;

-- Remove indexes
DROP INDEX IF EXISTS idx_interview_has_summary;
DROP INDEX IF EXISTS idx_response_has_insights;
```

## Verification

After running the migration, verify the changes:

```sql
-- Check response table columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'response'
  AND column_name IN ('key_insights', 'important_quotes');

-- Check interview table columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'interview'
  AND column_name IN ('executive_summary', 'objective_deliverables', 'cross_interview_insights', 'evidence_bank');

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('response', 'interview')
  AND indexname LIKE 'idx_%';
```

## Notes

- All new fields are nullable or have default values, so existing data won't be affected
- The migration includes data initialization for existing records
- JSONB fields are used for flexible schema evolution
- Indexes are created to optimize query performance

