-- Use this query to update your EXISTING database table.
-- Do not run the full schema.sql again as it tries to create tables that already exist.

ALTER TABLE projects 
ALTER COLUMN deadline TYPE timestamp with time zone 
USING deadline::timestamp with time zone;
