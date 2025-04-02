-- Create database if it doesn't exist
CREATE DATABASE cpr_web;

-- Create user if it doesn't exist
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'cpr_web_user') THEN

      CREATE USER cpr_web_user WITH PASSWORD 'cpr_web_password';
   END IF;
END
$do$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cpr_web TO cpr_web_user; 