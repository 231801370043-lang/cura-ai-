-- CuraLink Database Setup Script
-- Run this script to create the database and user

-- Create database
CREATE DATABASE IF NOT EXISTS curalink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (change password in production!)
CREATE USER IF NOT EXISTS 'curalink_user'@'localhost' IDENTIFIED BY 'curalink_password_2024';

-- Grant privileges
GRANT ALL PRIVILEGES ON curalink.* TO 'curalink_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Use the database
USE curalink;

-- Show success message
SELECT 'Database setup complete! You can now run the FastAPI application.' AS message;
