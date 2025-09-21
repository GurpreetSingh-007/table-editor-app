-- Script to create database and tables if they do not exist
-- Run this in psql or pgAdmin

-- Create database (run only if you want a new database)
-- CREATE DATABASE table_editor;
-- \c table_editor

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL
);

-- Create tables table if not exists
CREATE TABLE IF NOT EXISTS tables (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id INTEGER REFERENCES tables(id) ON DELETE CASCADE
);
