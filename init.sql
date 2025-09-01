-- PostgreSQL initialization script for TechLanding LMS
-- This script runs when the database is first created

-- Create additional extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Set timezone
ALTER DATABASE techlanding_lms SET timezone TO 'UTC';

-- Create techuser with full permissions
CREATE USER techuser WITH PASSWORD 'techpass123';
ALTER USER techuser CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE techlanding_lms TO techuser;
GRANT ALL PRIVILEGES ON SCHEMA public TO techuser;
GRANT CREATE ON SCHEMA public TO techuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO techuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO techuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO techuser;

-- Log that initialization is complete
SELECT 'PostgreSQL database initialized successfully for TechLanding LMS' AS status;
