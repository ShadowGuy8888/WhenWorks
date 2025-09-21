-- WhenWorks MySQL schema (designed for MySQL 8+)
CREATE DATABASE IF NOT EXISTS whenworks;
USE whenworks;

-- users: stores user accounts (Google-authenticated)
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  city VARCHAR(255),
  profile_complete BOOLEAN DEFAULT FALSE,
  gmail_refresh_token TEXT, -- encrypted or null
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- schedules: persistent schedules; temporary schedules are NOT stored here
CREATE TABLE IF NOT EXISTS schedules (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  owner_id BIGINT NOT NULL, -- creator (users.id)
  title VARCHAR(255) NOT NULL,
  description TEXT,
  frequency ENUM('one-off','daily','weekly','custom') DEFAULT 'one-off',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- participants: references to users (if they have accounts) or email strings for manual typing
CREATE TABLE IF NOT EXISTS schedule_participants (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  schedule_id BIGINT NOT NULL,
  user_id BIGINT NULL, -- null if manually typed participant
  name VARCHAR(255) NULL,
  location VARCHAR(255) NULL, -- e.g. "Los Angeles, CA"
  role ENUM('editor','viewer') DEFAULT 'editor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- simple scheduled items / calls (future-proof)
CREATE TABLE IF NOT EXISTS schedule_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  schedule_id BIGINT NOT NULL,
  start_ts DATETIME NOT NULL,
  end_ts DATETIME NOT NULL,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- share tokens (for editor links)
CREATE TABLE IF NOT EXISTS share_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  schedule_id BIGINT NOT NULL,
  token CHAR(36) NOT NULL,
  expires_at DATETIME NULL,
  role ENUM('editor','viewer') DEFAULT 'editor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
  UNIQUE (token)
) ENGINE=InnoDB;

-- notifications log
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  schedule_event_id BIGINT,
  sent_to_email VARCHAR(255),
  method ENUM('gmail','in-app') DEFAULT 'in-app',
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('sent','failed') DEFAULT 'sent',
  details TEXT
) ENGINE=InnoDB;

-- indexes
CREATE INDEX idx_schedules_owner ON schedules(owner_id);
CREATE INDEX idx_participants_schedule ON schedule_participants(schedule_id);
CREATE INDEX idx_events_schedule ON schedule_events(schedule_id);
