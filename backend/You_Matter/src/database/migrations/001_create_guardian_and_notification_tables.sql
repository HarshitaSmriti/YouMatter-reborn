-- Migration: 001_create_guardian_and_notification_tables.sql
-- Description: Schema for Trusted Contacts, Guardian Verifications, Notifications, Crisis Events, and Audit Logs

-- 1. TRUSTED CONTACTS TABLE
CREATE TABLE IF NOT EXISTS trusted_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  relationship VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  notification_consent BOOLEAN DEFAULT FALSE,
  wellbeing_notification_enabled BOOLEAN DEFAULT TRUE,
  high_risk_notification_enabled BOOLEAN DEFAULT TRUE,
  emergency_notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user_id ON trusted_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_email ON trusted_contacts(email);

-- 2. GUARDIAN VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS guardian_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES trusted_contacts(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guardian_verifications_contact_id ON guardian_verifications(contact_id);

-- 3. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_type VARCHAR(50) NOT NULL DEFAULT 'GUARDIAN',
  recipient_id UUID REFERENCES trusted_contacts(id) ON DELETE SET NULL,
  channel VARCHAR(50) NOT NULL DEFAULT 'EMAIL',
  notification_type VARCHAR(100) NOT NULL,
  risk_level VARCHAR(20) NOT NULL DEFAULT 'HIGH',
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSING, SENT, FAILED, BLOCKED
  provider VARCHAR(50) NOT NULL DEFAULT 'SMTP',
  provider_message_id VARCHAR(255),
  attempt_count INT DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- 4. CRISIS EVENTS TABLE
CREATE TABLE IF NOT EXISTS crisis_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  risk_level VARCHAR(20) NOT NULL DEFAULT 'HIGH',
  trigger_source VARCHAR(100) NOT NULL DEFAULT 'AI_SAFETY_ENGINE',
  notification_triggered BOOLEAN DEFAULT FALSE,
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, ACKNOWLEDGED, RESOLVED
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_crisis_events_user_id ON crisis_events(user_id);

-- 5. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
