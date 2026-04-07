-- ============================================
-- ACMS PostgreSQL Schema
-- ============================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS co_po_mappings CASCADE;
DROP TABLE IF EXISTS course_outcomes CASCADE;
DROP TABLE IF EXISTS program_outcomes CASCADE;
DROP TABLE IF EXISTS syllabus_units CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS semesters CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'hod', 'faculty')),
  department_id INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Departments
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  hod_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add FK from users to departments
ALTER TABLE users ADD CONSTRAINT fk_user_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Programs
CREATE TABLE programs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
  duration_years INTEGER DEFAULT 4,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Semesters
CREATE TABLE semesters (
  id SERIAL PRIMARY KEY,
  program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  label VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (program_id, number)
);

-- Courses
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  code VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  credits INTEGER DEFAULT 3,
  semester_id INTEGER REFERENCES semesters(id) ON DELETE CASCADE,
  faculty_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Program Outcomes (POs)
CREATE TABLE program_outcomes (
  id SERIAL PRIMARY KEY,
  program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (program_id, code)
);

-- Course Outcomes (COs)
CREATE TABLE course_outcomes (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (course_id, code)
);

-- CO-PO Mappings
CREATE TABLE co_po_mappings (
  id SERIAL PRIMARY KEY,
  co_id INTEGER REFERENCES course_outcomes(id) ON DELETE CASCADE,
  po_id INTEGER REFERENCES program_outcomes(id) ON DELETE CASCADE,
  correlation_level INTEGER CHECK (correlation_level IN (1, 2, 3)) NOT NULL,
  mapped_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (co_id, po_id)
);

-- Syllabus Units
CREATE TABLE syllabus_units (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  unit_no INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  hours INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50),
  record_id INTEGER,
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_courses_semester ON courses(semester_id);
CREATE INDEX idx_courses_faculty ON courses(faculty_id);
CREATE INDEX idx_co_course ON course_outcomes(course_id);
CREATE INDEX idx_po_program ON program_outcomes(program_id);
CREATE INDEX idx_mapping_co ON co_po_mappings(co_id);
CREATE INDEX idx_mapping_po ON co_po_mappings(po_id);
